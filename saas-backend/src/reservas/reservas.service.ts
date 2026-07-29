/* saas-backend/src/reservas/reservas.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoReserva, EstadoVuelo, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    correoAerolinea: true,
    estadoAerolinea: true,
  } as const;

  private readonly seleccionPasajero = {
    idPasajero: true,
    tipoDocumentoPasajero: true,
    numeroDocumentoPasajero: true,
    nombresPasajero: true,
    apellidosPasajero: true,
    correoPasajero: true,
    telefonoPasajero: true,
  } as const;

  private readonly seleccionUsuario = {
    idUsuario: true,
    nombresUsuario: true,
    apellidosUsuario: true,
    correoUsuario: true,
    rolUsuario: true,
    estadoUsuario: true,
  } as const;

  private readonly seleccionVuelo = {
    idVuelo: true,
    numeroVuelo: true,
    fechaHoraSalidaVuelo: true,
    fechaHoraLlegadaVuelo: true,
    precioBaseVuelo: true,
    estadoVuelo: true,
    rutaVuelo: {
      select: {
        idRuta: true,
        codigoRuta: true,
        aeropuertoOrigenRuta: {
          select: {
            idAeropuerto: true,
            codigoIataAeropuerto: true,
            ciudadAeropuerto: true,
            paisAeropuerto: true,
          },
        },
        aeropuertoDestinoRuta: {
          select: {
            idAeropuerto: true,
            codigoIataAeropuerto: true,
            ciudadAeropuerto: true,
            paisAeropuerto: true,
          },
        },
      },
    },
    avionVuelo: {
      select: {
        idAvion: true,
        matriculaAvion: true,
        modeloAvion: true,
        capacidadAvion: true,
        estadoAvion: true,
      },
    },
  } as const;

  private readonly relacionesReserva = {
    aerolineaReserva: {
      select: this.seleccionAerolinea,
    },
    vueloReserva: {
      select: this.seleccionVuelo,
    },
    pasajeroReserva: {
      select: this.seleccionPasajero,
    },
    usuarioRegistroReserva: {
      select: this.seleccionUsuario,
    },
    boletoReserva: {
      select: {
        idBoleto: true,
        numeroBoleto: true,
        asientoBoleto: true,
        claseBoleto: true,
        estadoBoleto: true,
      },
    },
  } as const;

  private obtenerIdAerolineaUsuario(
    usuarioActual: UsuarioAutenticado,
  ): number {
    const idAerolinea = usuarioActual.fkAerolineaUsuario;

    if (idAerolinea === null || idAerolinea === undefined) {
      throw new ForbiddenException(
        'El usuario autenticado no pertenece a una aerolínea',
      );
    }

    return idAerolinea;
  }

  private resolverIdAerolineaCreacion(
    createReservaDto: CreateReservaDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createReservaDto.fkAerolineaReserva === undefined ||
        createReservaDto.fkAerolineaReserva === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria de la reserva',
        );
      }

      return createReservaDto.fkAerolineaReserva;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createReservaDto.fkAerolineaReserva !== undefined &&
      createReservaDto.fkAerolineaReserva !== null &&
      createReservaDto.fkAerolineaReserva !==
      idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede registrar reservas para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idReserva: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idReserva,
      };
    }

    return {
      idReserva,
      fkAerolineaReserva:
        this.obtenerIdAerolineaUsuario(usuarioActual),
    };
  }

  private async verificarAerolineaOperativa(
    idAerolinea: number,
  ): Promise<void> {
    const aerolineaEncontrada =
      await this.prisma.aerolinea.findUnique({
        where: {
          idAerolinea,
        },
      });

    if (!aerolineaEncontrada) {
      throw new NotFoundException(
        `No se encontró una aerolínea con el ID ${idAerolinea}`,
      );
    }

    if (
      aerolineaEncontrada.estadoAerolinea !==
      EstadoAerolinea.ACTIVA
    ) {
      throw new ConflictException(
        'La aerolínea debe estar ACTIVA para gestionar reservas',
      );
    }
  }

  private async obtenerVueloDelTenant(
    idVuelo: number,
    idAerolinea: number,
    exigirVueloReservable: boolean,
  ) {
    const vueloEncontrado = await this.prisma.vuelo.findFirst({
      where: {
        idVuelo,
        fkAerolineaVuelo: idAerolinea,
      },
      include: {
        avionVuelo: {
          select: {
            capacidadAvion: true,
          },
        },
      },
    });

    if (!vueloEncontrado) {
      throw new NotFoundException(
        `No se encontró un vuelo accesible con el ID ${idVuelo}`,
      );
    }

    if (
      exigirVueloReservable &&
      vueloEncontrado.estadoVuelo !== EstadoVuelo.PROGRAMADO
    ) {
      throw new ConflictException(
        'El vuelo debe estar PROGRAMADO para recibir reservas',
      );
    }

    if (
      exigirVueloReservable &&
      vueloEncontrado.fechaHoraSalidaVuelo <= new Date()
    ) {
      throw new ConflictException(
        'No se pueden registrar reservas para un vuelo cuya salida ya ocurrió',
      );
    }

    return vueloEncontrado;
  }

  private async verificarPasajeroDelTenant(
    idPasajero: number,
    idAerolinea: number,
  ): Promise<void> {
    const pasajeroEncontrado =
      await this.prisma.pasajero.findFirst({
        where: {
          idPasajero,
          fkAerolineaPasajero: idAerolinea,
        },
      });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero accesible con el ID ${idPasajero}`,
      );
    }
  }

  private async verificarCodigoReservaUnico(
    idAerolinea: number,
    codigoReserva: string,
    idReservaExcluir?: number,
  ): Promise<void> {
    const reservaExistente =
      await this.prisma.reserva.findFirst({
        where: {
          fkAerolineaReserva: idAerolinea,
          codigoReserva,
          ...(idReservaExcluir !== undefined
            ? {
              NOT: {
                idReserva: idReservaExcluir,
              },
            }
            : {}),
        },
      });

    if (reservaExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene una reserva con el código "${codigoReserva}"`,
      );
    }
  }

  private async verificarReservaDuplicada(
    idVuelo: number,
    idPasajero: number,
    idReservaExcluir?: number,
  ): Promise<void> {
    const reservaExistente =
      await this.prisma.reserva.findFirst({
        where: {
          fkVueloReserva: idVuelo,
          fkPasajeroReserva: idPasajero,
          ...(idReservaExcluir !== undefined
            ? {
              NOT: {
                idReserva: idReservaExcluir,
              },
            }
            : {}),
        },
      });

    if (reservaExistente) {
      throw new ConflictException(
        'El pasajero ya tiene una reserva registrada para este vuelo',
      );
    }
  }

  private async verificarCapacidadVuelo(
    idVuelo: number,
    capacidadAvion: number,
    idReservaExcluir?: number,
  ): Promise<void> {
    const cantidadReservas =
      await this.prisma.reserva.count({
        where: {
          fkVueloReserva: idVuelo,
          estadoReserva: {
            not: EstadoReserva.CANCELADA,
          },
          ...(idReservaExcluir !== undefined
            ? {
              NOT: {
                idReserva: idReservaExcluir,
              },
            }
            : {}),
        },
      });

    if (cantidadReservas >= capacidadAvion) {
      throw new ConflictException(
        `El vuelo alcanzó la capacidad máxima de ${capacidadAvion} pasajeros`,
      );
    }
  }

  async create(
    createReservaDto: CreateReservaDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createReservaDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);

    const vueloEncontrado =
      await this.obtenerVueloDelTenant(
        createReservaDto.fkVueloReserva,
        idAerolinea,
        true,
      );

    await this.verificarPasajeroDelTenant(
      createReservaDto.fkPasajeroReserva,
      idAerolinea,
    );

    await this.verificarCodigoReservaUnico(
      idAerolinea,
      createReservaDto.codigoReserva,
    );

    await this.verificarReservaDuplicada(
      createReservaDto.fkVueloReserva,
      createReservaDto.fkPasajeroReserva,
    );

    const estadoReserva =
      createReservaDto.estadoReserva ??
      EstadoReserva.PENDIENTE;

    if (estadoReserva !== EstadoReserva.CANCELADA) {
      await this.verificarCapacidadVuelo(
        createReservaDto.fkVueloReserva,
        vueloEncontrado.avionVuelo.capacidadAvion,
      );
    }

    return this.prisma.reserva.create({
      data: {
        ...createReservaDto,
        fkAerolineaReserva: idAerolinea,
        fkUsuarioRegistroReserva: usuarioActual.idUsuario,
        estadoReserva,
      },
      include: this.relacionesReserva,
    });
  }

  async findAll(usuarioActual: UsuarioAutenticado) {
    const filtroAerolinea =
      usuarioActual.rolUsuario === RolUsuario.SUPERADMIN
        ? undefined
        : {
          fkAerolineaReserva:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.reserva.findMany({
      where: filtroAerolinea,
      include: this.relacionesReserva,
      orderBy: {
        idReserva: 'asc',
      },
    });
  }

  async findOne(
    idReserva: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const reservaEncontrada =
      await this.prisma.reserva.findFirst({
        where: this.construirFiltroAcceso(
          idReserva,
          usuarioActual,
        ),
        include: this.relacionesReserva,
      });

    if (!reservaEncontrada) {
      throw new NotFoundException(
        `No se encontró una reserva accesible con el ID ${idReserva}`,
      );
    }

    return reservaEncontrada;
  }

  async update(
    idReserva: number,
    updateReservaDto: UpdateReservaDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const reservaActual =
      await this.prisma.reserva.findFirst({
        where: this.construirFiltroAcceso(
          idReserva,
          usuarioActual,
        ),
        include: {
          boletoReserva: {
            select: {
              idBoleto: true,
            },
          },
        },
      });

    if (!reservaActual) {
      throw new NotFoundException(
        `No se encontró una reserva accesible con el ID ${idReserva}`,
      );
    }

    const idAerolinea =
      reservaActual.fkAerolineaReserva;

    const idVueloFinal =
      updateReservaDto.fkVueloReserva ??
      reservaActual.fkVueloReserva;

    const idPasajeroFinal =
      updateReservaDto.fkPasajeroReserva ??
      reservaActual.fkPasajeroReserva;

    const codigoReservaFinal =
      updateReservaDto.codigoReserva ??
      reservaActual.codigoReserva;

    const estadoReservaFinal =
      updateReservaDto.estadoReserva ??
      reservaActual.estadoReserva;

    const cambiaVuelo =
      idVueloFinal !== reservaActual.fkVueloReserva;

    const cambiaPasajero =
      idPasajeroFinal !==
      reservaActual.fkPasajeroReserva;

    const cambiaRelacionPrincipal =
      cambiaVuelo || cambiaPasajero;

    if (
      cambiaRelacionPrincipal &&
      reservaActual.boletoReserva
    ) {
      throw new ConflictException(
        'No se puede cambiar el vuelo o el pasajero porque la reserva ya tiene un boleto emitido',
      );
    }

    const cambiaEstado =
      updateReservaDto.estadoReserva !== undefined &&
      updateReservaDto.estadoReserva !==
      reservaActual.estadoReserva;

    const reactivaReserva =
      reservaActual.estadoReserva ===
      EstadoReserva.CANCELADA &&
      estadoReservaFinal !== EstadoReserva.CANCELADA;

    const cambiaAEstadoNoCancelado =
      cambiaEstado &&
      estadoReservaFinal !== EstadoReserva.CANCELADA;

    const exigirVueloReservable =
      cambiaRelacionPrincipal ||
      reactivaReserva ||
      cambiaAEstadoNoCancelado;

    await this.verificarAerolineaOperativa(idAerolinea);

    const vueloEncontrado =
      await this.obtenerVueloDelTenant(
        idVueloFinal,
        idAerolinea,
        exigirVueloReservable,
      );

    await this.verificarPasajeroDelTenant(
      idPasajeroFinal,
      idAerolinea,
    );

    await this.verificarCodigoReservaUnico(
      idAerolinea,
      codigoReservaFinal,
      idReserva,
    );

    await this.verificarReservaDuplicada(
      idVueloFinal,
      idPasajeroFinal,
      idReserva,
    );

    if (estadoReservaFinal !== EstadoReserva.CANCELADA) {
      await this.verificarCapacidadVuelo(
        idVueloFinal,
        vueloEncontrado.avionVuelo.capacidadAvion,
        idReserva,
      );
    }

    return this.prisma.reserva.update({
      where: {
        idReserva,
      },
      data: updateReservaDto,
      include: this.relacionesReserva,
    });
  }

  async remove(
    idReserva: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const reservaEncontrada =
      await this.prisma.reserva.findFirst({
        where: this.construirFiltroAcceso(
          idReserva,
          usuarioActual,
        ),
        include: {
          boletoReserva: {
            select: {
              idBoleto: true,
            },
          },
        },
      });

    if (!reservaEncontrada) {
      throw new NotFoundException(
        `No se encontró una reserva accesible con el ID ${idReserva}`,
      );
    }

    if (reservaEncontrada.boletoReserva) {
      throw new ConflictException(
        'No se puede eliminar la reserva porque tiene un boleto asociado. Puede cambiar su estado a CANCELADA.',
      );
    }

    return this.prisma.reserva.delete({
      where: {
        idReserva,
      },
      include: this.relacionesReserva,
    });
  }
}
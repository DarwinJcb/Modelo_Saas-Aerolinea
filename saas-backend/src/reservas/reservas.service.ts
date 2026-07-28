/* saas-backend/src/reservas/reservas.service.ts */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoAerolinea,
  EstadoReserva,
  EstadoUsuario,
  EstadoVuelo,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async verificarAerolineaOperativa(
    idAerolinea: number,
  ): Promise<void> {
    const aerolineaEncontrada = await this.prisma.aerolinea.findUnique({
      where: {
        idAerolinea,
      },
    });

    if (!aerolineaEncontrada) {
      throw new NotFoundException(
        `No se encontró una aerolínea con el ID ${idAerolinea}`,
      );
    }

    if (aerolineaEncontrada.estadoAerolinea !== EstadoAerolinea.ACTIVA) {
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
    const vueloEncontrado = await this.prisma.vuelo.findUnique({
      where: {
        idVuelo,
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
        `No se encontró un vuelo con el ID ${idVuelo}`,
      );
    }

    if (vueloEncontrado.fkAerolineaVuelo !== idAerolinea) {
      throw new BadRequestException(
        'El vuelo seleccionado no pertenece a la aerolínea de la reserva',
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
    const pasajeroEncontrado = await this.prisma.pasajero.findUnique({
      where: {
        idPasajero,
      },
    });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero con el ID ${idPasajero}`,
      );
    }

    if (pasajeroEncontrado.fkAerolineaPasajero !== idAerolinea) {
      throw new BadRequestException(
        'El pasajero seleccionado no pertenece a la aerolínea de la reserva',
      );
    }
  }

  private async verificarUsuarioDelTenant(
    idUsuario: number,
    idAerolinea: number,
  ): Promise<void> {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: {
        idUsuario,
      },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(
        `No se encontró un usuario con el ID ${idUsuario}`,
      );
    }

    if (usuarioEncontrado.fkAerolineaUsuario !== idAerolinea) {
      throw new BadRequestException(
        'El usuario seleccionado no pertenece a la aerolínea de la reserva',
      );
    }

    if (usuarioEncontrado.estadoUsuario !== EstadoUsuario.ACTIVO) {
      throw new ConflictException(
        'El usuario que registra la reserva debe estar ACTIVO',
      );
    }
  }

  private async verificarCodigoReservaUnico(
    idAerolinea: number,
    codigoReserva: string,
    idReservaExcluir?: number,
  ): Promise<void> {
    const reservaExistente = await this.prisma.reserva.findFirst({
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
    const reservaExistente = await this.prisma.reserva.findFirst({
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
    const cantidadReservas = await this.prisma.reserva.count({
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

  async create(createReservaDto: CreateReservaDto) {
    await this.verificarAerolineaOperativa(createReservaDto.fkAerolineaReserva);

    const vueloEncontrado = await this.obtenerVueloDelTenant(
      createReservaDto.fkVueloReserva,
      createReservaDto.fkAerolineaReserva,
      true,
    );

    await this.verificarPasajeroDelTenant(
      createReservaDto.fkPasajeroReserva,
      createReservaDto.fkAerolineaReserva,
    );

    if (
      createReservaDto.fkUsuarioRegistroReserva !== undefined &&
      createReservaDto.fkUsuarioRegistroReserva !== null
    ) {
      await this.verificarUsuarioDelTenant(
        createReservaDto.fkUsuarioRegistroReserva,
        createReservaDto.fkAerolineaReserva,
      );
    }

    await this.verificarCodigoReservaUnico(
      createReservaDto.fkAerolineaReserva,
      createReservaDto.codigoReserva,
    );

    await this.verificarReservaDuplicada(
      createReservaDto.fkVueloReserva,
      createReservaDto.fkPasajeroReserva,
    );

    const estadoReserva =
      createReservaDto.estadoReserva ?? EstadoReserva.PENDIENTE;

    if (estadoReserva !== EstadoReserva.CANCELADA) {
      await this.verificarCapacidadVuelo(
        createReservaDto.fkVueloReserva,
        vueloEncontrado.avionVuelo.capacidadAvion,
      );
    }

    return this.prisma.reserva.create({
      data: {
        ...createReservaDto,
        estadoReserva,
      },
      include: this.relacionesReserva,
    });
  }

  async findAll() {
    return this.prisma.reserva.findMany({
      include: this.relacionesReserva,
      orderBy: {
        idReserva: 'asc',
      },
    });
  }

  async findOne(idReserva: number) {
    const reservaEncontrada = await this.prisma.reserva.findUnique({
      where: {
        idReserva,
      },
      include: this.relacionesReserva,
    });

    if (!reservaEncontrada) {
      throw new NotFoundException(
        `No se encontró una reserva con el ID ${idReserva}`,
      );
    }

    return reservaEncontrada;
  }

  async update(idReserva: number, updateReservaDto: UpdateReservaDto) {
    const reservaActual = await this.prisma.reserva.findUnique({
      where: {
        idReserva,
      },
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
        `No se encontró una reserva con el ID ${idReserva}`,
      );
    }

    const idAerolineaFinal =
      updateReservaDto.fkAerolineaReserva ?? reservaActual.fkAerolineaReserva;

    const idVueloFinal =
      updateReservaDto.fkVueloReserva ?? reservaActual.fkVueloReserva;

    const idPasajeroFinal =
      updateReservaDto.fkPasajeroReserva ?? reservaActual.fkPasajeroReserva;

    const idUsuarioFinal =
      updateReservaDto.fkUsuarioRegistroReserva !== undefined
        ? updateReservaDto.fkUsuarioRegistroReserva
        : reservaActual.fkUsuarioRegistroReserva;

    const codigoReservaFinal =
      updateReservaDto.codigoReserva ?? reservaActual.codigoReserva;

    const estadoReservaFinal =
      updateReservaDto.estadoReserva ?? reservaActual.estadoReserva;

    const cambiaRelacionPrincipal =
      idAerolineaFinal !== reservaActual.fkAerolineaReserva ||
      idVueloFinal !== reservaActual.fkVueloReserva ||
      idPasajeroFinal !== reservaActual.fkPasajeroReserva;

    if (cambiaRelacionPrincipal && reservaActual.boletoReserva) {
      throw new ConflictException(
        'No se puede cambiar la aerolínea, el vuelo o el pasajero porque la reserva ya tiene un boleto emitido',
      );
    }

    const reactivaReserva =
      reservaActual.estadoReserva === EstadoReserva.CANCELADA &&
      estadoReservaFinal !== EstadoReserva.CANCELADA;

    await this.verificarAerolineaOperativa(idAerolineaFinal);

    const vueloEncontrado = await this.obtenerVueloDelTenant(
      idVueloFinal,
      idAerolineaFinal,
      cambiaRelacionPrincipal || reactivaReserva,
    );

    await this.verificarPasajeroDelTenant(idPasajeroFinal, idAerolineaFinal);

    if (idUsuarioFinal !== null) {
      await this.verificarUsuarioDelTenant(idUsuarioFinal, idAerolineaFinal);
    }

    await this.verificarCodigoReservaUnico(
      idAerolineaFinal,
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

  async remove(idReserva: number) {
    const reservaEncontrada = await this.prisma.reserva.findUnique({
      where: {
        idReserva,
      },
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
        `No se encontró una reserva con el ID ${idReserva}`,
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

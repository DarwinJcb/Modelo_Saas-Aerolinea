/* saas-backend/src/vuelos/vuelos.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoAeropuerto, EstadoAvion, EstadoPlan, EstadoRuta, EstadoSuscripcion, EstadoVuelo, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVueloDto } from './dto/create-vuelo.dto';
import { UpdateVueloDto } from './dto/update-vuelo.dto';

@Injectable()
export class VuelosService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    estadoAerolinea: true,
  } as const;

  private readonly seleccionAvion = {
    idAvion: true,
    matriculaAvion: true,
    codigoInternoAvion: true,
    modeloAvion: true,
    fabricanteAvion: true,
    capacidadAvion: true,
    estadoAvion: true,
  } as const;

  private readonly seleccionRuta = {
    idRuta: true,
    codigoRuta: true,
    duracionEstimadaMinutosRuta: true,
    distanciaKilometrosRuta: true,
    estadoRuta: true,
    aeropuertoOrigenRuta: {
      select: {
        idAeropuerto: true,
        codigoIataAeropuerto: true,
        nombreAeropuerto: true,
        ciudadAeropuerto: true,
        paisAeropuerto: true,
      },
    },
    aeropuertoDestinoRuta: {
      select: {
        idAeropuerto: true,
        codigoIataAeropuerto: true,
        nombreAeropuerto: true,
        ciudadAeropuerto: true,
        paisAeropuerto: true,
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
    createVueloDto: CreateVueloDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createVueloDto.fkAerolineaVuelo === undefined ||
        createVueloDto.fkAerolineaVuelo === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria del vuelo',
        );
      }

      return createVueloDto.fkAerolineaVuelo;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createVueloDto.fkAerolineaVuelo !== undefined &&
      createVueloDto.fkAerolineaVuelo !== null &&
      createVueloDto.fkAerolineaVuelo !== idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede registrar vuelos para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idVuelo: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idVuelo,
      };
    }

    return {
      idVuelo,
      fkAerolineaVuelo:
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
        'La aerolínea debe estar ACTIVA para gestionar vuelos',
      );
    }
  }

  private async obtenerSuscripcionVigente(
    idAerolinea: number,
  ) {
    const fechaActual = new Date();

    const suscripcionEncontrada =
      await this.prisma.suscripcion.findFirst({
        where: {
          fkAerolineaSuscripcion: idAerolinea,
          estadoSuscripcion: EstadoSuscripcion.ACTIVA,
          fechaInicioSuscripcion: {
            lte: fechaActual,
          },
          fechaFinSuscripcion: {
            gt: fechaActual,
          },
          planSuscripcion: {
            is: {
              estadoPlan: EstadoPlan.ACTIVO,
            },
          },
        },
        include: {
          planSuscripcion: true,
        },
        orderBy: {
          fechaFinSuscripcion: 'desc',
        },
      });

    if (!suscripcionEncontrada) {
      throw new ConflictException(
        'La aerolínea no tiene una suscripción activa y vigente',
      );
    }

    return suscripcionEncontrada;
  }

  private async verificarRutaDeAerolinea(
    idRuta: number,
    idAerolinea: number,
    exigirRutaActiva: boolean,
  ): Promise<void> {
    const rutaEncontrada = await this.prisma.ruta.findFirst({
      where: {
        idRuta,
        fkAerolineaRuta: idAerolinea,
      },
      include: {
        aeropuertoOrigenRuta: true,
        aeropuertoDestinoRuta: true,
      },
    });

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta accesible con el ID ${idRuta}`,
      );
    }

    if (
      exigirRutaActiva &&
      rutaEncontrada.estadoRuta !== EstadoRuta.ACTIVA
    ) {
      throw new ConflictException(
        'La ruta debe estar ACTIVA para programar el vuelo',
      );
    }

    if (
      exigirRutaActiva &&
      rutaEncontrada.aeropuertoOrigenRuta.estadoAeropuerto !==
      EstadoAeropuerto.ACTIVO
    ) {
      throw new ConflictException(
        'El aeropuerto de origen de la ruta no está activo',
      );
    }

    if (
      exigirRutaActiva &&
      rutaEncontrada.aeropuertoDestinoRuta.estadoAeropuerto !==
      EstadoAeropuerto.ACTIVO
    ) {
      throw new ConflictException(
        'El aeropuerto de destino de la ruta no está activo',
      );
    }
  }

  private async verificarAvionDeAerolinea(
    idAvion: number,
    idAerolinea: number,
    exigirDisponible: boolean,
  ): Promise<void> {
    const avionEncontrado = await this.prisma.avion.findFirst({
      where: {
        idAvion,
        fkAerolineaAvion: idAerolinea,
      },
    });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión accesible con el ID ${idAvion}`,
      );
    }

    if (
      exigirDisponible &&
      avionEncontrado.estadoAvion !== EstadoAvion.DISPONIBLE
    ) {
      throw new ConflictException(
        'El avión debe estar DISPONIBLE para programar el vuelo',
      );
    }
  }

  private validarFechasVuelo(
    fechaHoraSalidaVuelo: Date,
    fechaHoraLlegadaVuelo: Date,
    exigirSalidaFutura: boolean,
  ): void {
    if (fechaHoraLlegadaVuelo <= fechaHoraSalidaVuelo) {
      throw new BadRequestException(
        'La fecha y hora de llegada debe ser posterior a la fecha y hora de salida',
      );
    }

    if (
      exigirSalidaFutura &&
      fechaHoraSalidaVuelo <= new Date()
    ) {
      throw new BadRequestException(
        'La fecha y hora de salida debe ser posterior a la fecha actual',
      );
    }
  }

  private async verificarNumeroVueloUnico(
    idAerolinea: number,
    numeroVuelo: string,
    fechaHoraSalidaVuelo: Date,
    idVueloExcluir?: number,
  ): Promise<void> {
    const vueloExistente = await this.prisma.vuelo.findFirst({
      where: {
        fkAerolineaVuelo: idAerolinea,
        numeroVuelo,
        fechaHoraSalidaVuelo,
        ...(idVueloExcluir !== undefined
          ? {
            NOT: {
              idVuelo: idVueloExcluir,
            },
          }
          : {}),
      },
    });

    if (vueloExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene el vuelo "${numeroVuelo}" programado para la misma fecha y hora`,
      );
    }
  }

  private async verificarDisponibilidadAvion(
    idAvion: number,
    fechaHoraSalidaVuelo: Date,
    fechaHoraLlegadaVuelo: Date,
    idVueloExcluir?: number,
  ): Promise<void> {
    const vueloSolapado = await this.prisma.vuelo.findFirst({
      where: {
        fkAvionVuelo: idAvion,
        estadoVuelo: {
          not: EstadoVuelo.CANCELADO,
        },
        fechaHoraSalidaVuelo: {
          lt: fechaHoraLlegadaVuelo,
        },
        fechaHoraLlegadaVuelo: {
          gt: fechaHoraSalidaVuelo,
        },
        ...(idVueloExcluir !== undefined
          ? {
            NOT: {
              idVuelo: idVueloExcluir,
            },
          }
          : {}),
      },
    });

    if (vueloSolapado) {
      throw new ConflictException(
        'El avión ya tiene otro vuelo programado dentro del mismo intervalo de tiempo',
      );
    }
  }

  private obtenerLimitesDelMes(
    fechaHoraSalidaVuelo: Date,
  ): {
    inicioMes: Date;
    inicioMesSiguiente: Date;
  } {
    const anio = fechaHoraSalidaVuelo.getUTCFullYear();
    const mes = fechaHoraSalidaVuelo.getUTCMonth();

    return {
      inicioMes: new Date(
        Date.UTC(anio, mes, 1, 0, 0, 0),
      ),
      inicioMesSiguiente: new Date(
        Date.UTC(anio, mes + 1, 1, 0, 0, 0),
      ),
    };
  }

  private async verificarLimiteMensualVuelos(
    idAerolinea: number,
    fechaHoraSalidaVuelo: Date,
    idVueloExcluir?: number,
  ): Promise<void> {
    const suscripcionVigente =
      await this.obtenerSuscripcionVigente(idAerolinea);

    const { inicioMes, inicioMesSiguiente } =
      this.obtenerLimitesDelMes(fechaHoraSalidaVuelo);

    const cantidadVuelos = await this.prisma.vuelo.count({
      where: {
        fkAerolineaVuelo: idAerolinea,
        estadoVuelo: {
          not: EstadoVuelo.CANCELADO,
        },
        fechaHoraSalidaVuelo: {
          gte: inicioMes,
          lt: inicioMesSiguiente,
        },
        ...(idVueloExcluir !== undefined
          ? {
            NOT: {
              idVuelo: idVueloExcluir,
            },
          }
          : {}),
      },
    });

    const limiteVuelos =
      suscripcionVigente.planSuscripcion
        .limiteVuelosMensualesPlan;

    if (cantidadVuelos >= limiteVuelos) {
      throw new ConflictException(
        `La aerolínea alcanzó el límite mensual de ${limiteVuelos} vuelos permitido por su plan`,
      );
    }
  }

  async create(
    createVueloDto: CreateVueloDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createVueloDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);
    await this.obtenerSuscripcionVigente(idAerolinea);

    await this.verificarRutaDeAerolinea(
      createVueloDto.fkRutaVuelo,
      idAerolinea,
      true,
    );

    await this.verificarAvionDeAerolinea(
      createVueloDto.fkAvionVuelo,
      idAerolinea,
      true,
    );

    this.validarFechasVuelo(
      createVueloDto.fechaHoraSalidaVuelo,
      createVueloDto.fechaHoraLlegadaVuelo,
      true,
    );

    await this.verificarNumeroVueloUnico(
      idAerolinea,
      createVueloDto.numeroVuelo,
      createVueloDto.fechaHoraSalidaVuelo,
    );

    await this.verificarDisponibilidadAvion(
      createVueloDto.fkAvionVuelo,
      createVueloDto.fechaHoraSalidaVuelo,
      createVueloDto.fechaHoraLlegadaVuelo,
    );

    const estadoVuelo =
      createVueloDto.estadoVuelo ??
      EstadoVuelo.PROGRAMADO;

    if (estadoVuelo !== EstadoVuelo.CANCELADO) {
      await this.verificarLimiteMensualVuelos(
        idAerolinea,
        createVueloDto.fechaHoraSalidaVuelo,
      );
    }

    return this.prisma.vuelo.create({
      data: {
        ...createVueloDto,
        fkAerolineaVuelo: idAerolinea,
        estadoVuelo,
      },
      include: {
        aerolineaVuelo: {
          select: this.seleccionAerolinea,
        },
        rutaVuelo: {
          select: this.seleccionRuta,
        },
        avionVuelo: {
          select: this.seleccionAvion,
        },
      },
    });
  }

  async findAll(usuarioActual: UsuarioAutenticado) {
    const filtroAerolinea =
      usuarioActual.rolUsuario === RolUsuario.SUPERADMIN
        ? undefined
        : {
          fkAerolineaVuelo:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.vuelo.findMany({
      where: filtroAerolinea,
      include: {
        aerolineaVuelo: {
          select: this.seleccionAerolinea,
        },
        rutaVuelo: {
          select: this.seleccionRuta,
        },
        avionVuelo: {
          select: this.seleccionAvion,
        },
      },
      orderBy: {
        fechaHoraSalidaVuelo: 'asc',
      },
    });
  }

  async findOne(
    idVuelo: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const vueloEncontrado = await this.prisma.vuelo.findFirst({
      where: this.construirFiltroAcceso(
        idVuelo,
        usuarioActual,
      ),
      include: {
        aerolineaVuelo: {
          select: this.seleccionAerolinea,
        },
        rutaVuelo: {
          select: this.seleccionRuta,
        },
        avionVuelo: {
          select: this.seleccionAvion,
        },
      },
    });

    if (!vueloEncontrado) {
      throw new NotFoundException(
        `No se encontró un vuelo accesible con el ID ${idVuelo}`,
      );
    }

    return vueloEncontrado;
  }

  async update(
    idVuelo: number,
    updateVueloDto: UpdateVueloDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const vueloActual = await this.prisma.vuelo.findFirst({
      where: this.construirFiltroAcceso(
        idVuelo,
        usuarioActual,
      ),
    });

    if (!vueloActual) {
      throw new NotFoundException(
        `No se encontró un vuelo accesible con el ID ${idVuelo}`,
      );
    }

    const idAerolinea = vueloActual.fkAerolineaVuelo;

    const idRutaFinal =
      updateVueloDto.fkRutaVuelo ??
      vueloActual.fkRutaVuelo;

    const idAvionFinal =
      updateVueloDto.fkAvionVuelo ??
      vueloActual.fkAvionVuelo;

    const numeroVueloFinal =
      updateVueloDto.numeroVuelo ??
      vueloActual.numeroVuelo;

    const fechaSalidaFinal =
      updateVueloDto.fechaHoraSalidaVuelo ??
      vueloActual.fechaHoraSalidaVuelo;

    const fechaLlegadaFinal =
      updateVueloDto.fechaHoraLlegadaVuelo ??
      vueloActual.fechaHoraLlegadaVuelo;

    const estadoVueloFinal =
      updateVueloDto.estadoVuelo ??
      vueloActual.estadoVuelo;

    const cambiaRuta =
      idRutaFinal !== vueloActual.fkRutaVuelo;

    const cambiaAvion =
      idAvionFinal !== vueloActual.fkAvionVuelo;

    const cambiaProgramacion =
      updateVueloDto.fechaHoraSalidaVuelo !== undefined ||
      updateVueloDto.fechaHoraLlegadaVuelo !== undefined;

    const reactivaVuelo =
      vueloActual.estadoVuelo === EstadoVuelo.CANCELADO &&
      estadoVueloFinal !== EstadoVuelo.CANCELADO;

    if (cambiaRuta || cambiaAvion) {
      const cantidadReservas =
        await this.prisma.reserva.count({
          where: {
            fkVueloReserva: idVuelo,
          },
        });

      if (cantidadReservas > 0) {
        throw new ConflictException(
          'No se puede cambiar la ruta o el avión porque el vuelo tiene reservas asociadas',
        );
      }
    }

    await this.verificarAerolineaOperativa(idAerolinea);
    await this.obtenerSuscripcionVigente(idAerolinea);

    const exigirRecursosOperativos =
      estadoVueloFinal !== EstadoVuelo.CANCELADO &&
      (
        cambiaRuta ||
        cambiaAvion ||
        cambiaProgramacion ||
        reactivaVuelo
      );

    await this.verificarRutaDeAerolinea(
      idRutaFinal,
      idAerolinea,
      exigirRecursosOperativos,
    );

    await this.verificarAvionDeAerolinea(
      idAvionFinal,
      idAerolinea,
      exigirRecursosOperativos,
    );

    this.validarFechasVuelo(
      fechaSalidaFinal,
      fechaLlegadaFinal,
      cambiaProgramacion,
    );

    await this.verificarNumeroVueloUnico(
      idAerolinea,
      numeroVueloFinal,
      fechaSalidaFinal,
      idVuelo,
    );

    if (estadoVueloFinal !== EstadoVuelo.CANCELADO) {
      await this.verificarDisponibilidadAvion(
        idAvionFinal,
        fechaSalidaFinal,
        fechaLlegadaFinal,
        idVuelo,
      );

      await this.verificarLimiteMensualVuelos(
        idAerolinea,
        fechaSalidaFinal,
        idVuelo,
      );
    }

    return this.prisma.vuelo.update({
      where: {
        idVuelo,
      },
      data: updateVueloDto,
      include: {
        aerolineaVuelo: {
          select: this.seleccionAerolinea,
        },
        rutaVuelo: {
          select: this.seleccionRuta,
        },
        avionVuelo: {
          select: this.seleccionAvion,
        },
      },
    });
  }

  async remove(
    idVuelo: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const vueloEncontrado = await this.prisma.vuelo.findFirst({
      where: this.construirFiltroAcceso(
        idVuelo,
        usuarioActual,
      ),
    });

    if (!vueloEncontrado) {
      throw new NotFoundException(
        `No se encontró un vuelo accesible con el ID ${idVuelo}`,
      );
    }

    const cantidadReservas =
      await this.prisma.reserva.count({
        where: {
          fkVueloReserva: idVuelo,
        },
      });

    if (cantidadReservas > 0) {
      throw new ConflictException(
        'No se puede eliminar el vuelo porque tiene reservas asociadas. Puede cambiar su estado a CANCELADO.',
      );
    }

    return this.prisma.vuelo.delete({
      where: {
        idVuelo,
      },
      include: {
        aerolineaVuelo: {
          select: this.seleccionAerolinea,
        },
        rutaVuelo: {
          select: this.seleccionRuta,
        },
        avionVuelo: {
          select: this.seleccionAvion,
        },
      },
    });
  }
}
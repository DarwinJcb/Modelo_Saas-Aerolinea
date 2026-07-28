/* saas-backend/src/vuelos/vuelos.service.ts */
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { EstadoAerolinea, EstadoAeropuerto, EstadoAvion, EstadoPlan, EstadoRuta, EstadoSuscripcion, EstadoVuelo, } from '../generated/prisma/enums';
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

  private readonly seleccionAeropuerto = {
    idAeropuerto: true,
    codigoIataAeropuerto: true,
    nombreAeropuerto: true,
    ciudadAeropuerto: true,
    paisAeropuerto: true,
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
    const rutaEncontrada =
      await this.prisma.ruta.findUnique({
        where: {
          idRuta,
        },
        include: {
          aeropuertoOrigenRuta: true,
          aeropuertoDestinoRuta: true,
        },
      });

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta con el ID ${idRuta}`,
      );
    }

    if (
      rutaEncontrada.fkAerolineaRuta !== idAerolinea
    ) {
      throw new BadRequestException(
        'La ruta seleccionada no pertenece a la aerolínea del vuelo',
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
      rutaEncontrada.aeropuertoOrigenRuta
        .estadoAeropuerto !== EstadoAeropuerto.ACTIVO
    ) {
      throw new ConflictException(
        'El aeropuerto de origen de la ruta no está activo',
      );
    }

    if (
      exigirRutaActiva &&
      rutaEncontrada.aeropuertoDestinoRuta
        .estadoAeropuerto !== EstadoAeropuerto.ACTIVO
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
    const avionEncontrado =
      await this.prisma.avion.findUnique({
        where: {
          idAvion,
        },
      });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión con el ID ${idAvion}`,
      );
    }

    if (
      avionEncontrado.fkAerolineaAvion !==
      idAerolinea
    ) {
      throw new BadRequestException(
        'El avión seleccionado no pertenece a la aerolínea del vuelo',
      );
    }

    if (
      exigirDisponible &&
      avionEncontrado.estadoAvion !==
      EstadoAvion.DISPONIBLE
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
    if (
      fechaHoraLlegadaVuelo <= fechaHoraSalidaVuelo
    ) {
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
    const vueloExistente =
      await this.prisma.vuelo.findFirst({
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
    const vueloSolapado =
      await this.prisma.vuelo.findFirst({
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
    const anio =
      fechaHoraSalidaVuelo.getUTCFullYear();

    const mes =
      fechaHoraSalidaVuelo.getUTCMonth();

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
      await this.obtenerSuscripcionVigente(
        idAerolinea,
      );

    const {
      inicioMes,
      inicioMesSiguiente,
    } = this.obtenerLimitesDelMes(
      fechaHoraSalidaVuelo,
    );

    const cantidadVuelos =
      await this.prisma.vuelo.count({
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

  async create(createVueloDto: CreateVueloDto) {
    await this.verificarAerolineaOperativa(
      createVueloDto.fkAerolineaVuelo,
    );

    await this.obtenerSuscripcionVigente(
      createVueloDto.fkAerolineaVuelo,
    );

    await this.verificarRutaDeAerolinea(
      createVueloDto.fkRutaVuelo,
      createVueloDto.fkAerolineaVuelo,
      true,
    );

    await this.verificarAvionDeAerolinea(
      createVueloDto.fkAvionVuelo,
      createVueloDto.fkAerolineaVuelo,
      true,
    );

    this.validarFechasVuelo(
      createVueloDto.fechaHoraSalidaVuelo,
      createVueloDto.fechaHoraLlegadaVuelo,
      true,
    );

    await this.verificarNumeroVueloUnico(
      createVueloDto.fkAerolineaVuelo,
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
        createVueloDto.fkAerolineaVuelo,
        createVueloDto.fechaHoraSalidaVuelo,
      );
    }

    return this.prisma.vuelo.create({
      data: {
        ...createVueloDto,
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

  async findAll() {
    return this.prisma.vuelo.findMany({
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

  async findOne(idVuelo: number) {
    const vueloEncontrado =
      await this.prisma.vuelo.findUnique({
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

    if (!vueloEncontrado) {
      throw new NotFoundException(
        `No se encontró un vuelo con el ID ${idVuelo}`,
      );
    }

    return vueloEncontrado;
  }

  async update(
    idVuelo: number,
    updateVueloDto: UpdateVueloDto,
  ) {
    const vueloActual =
      await this.prisma.vuelo.findUnique({
        where: {
          idVuelo,
        },
      });

    if (!vueloActual) {
      throw new NotFoundException(
        `No se encontró un vuelo con el ID ${idVuelo}`,
      );
    }

    const idAerolineaFinal =
      updateVueloDto.fkAerolineaVuelo ??
      vueloActual.fkAerolineaVuelo;

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

    const cambiaAerolinea =
      idAerolineaFinal !==
      vueloActual.fkAerolineaVuelo;

    const cambiaRuta =
      idRutaFinal !== vueloActual.fkRutaVuelo;

    const cambiaAvion =
      idAvionFinal !== vueloActual.fkAvionVuelo;

    const cambiaProgramacion =
      updateVueloDto.fechaHoraSalidaVuelo !==
      undefined ||
      updateVueloDto.fechaHoraLlegadaVuelo !==
      undefined;

    if (
      cambiaAerolinea ||
      cambiaRuta ||
      cambiaAvion
    ) {
      const cantidadReservas =
        await this.prisma.reserva.count({
          where: {
            fkVueloReserva: idVuelo,
          },
        });

      if (cantidadReservas > 0) {
        throw new ConflictException(
          'No se puede cambiar la aerolínea, la ruta o el avión porque el vuelo tiene reservas asociadas',
        );
      }
    }

    await this.verificarAerolineaOperativa(
      idAerolineaFinal,
    );

    await this.obtenerSuscripcionVigente(
      idAerolineaFinal,
    );

    await this.verificarRutaDeAerolinea(
      idRutaFinal,
      idAerolineaFinal,
      cambiaRuta || cambiaAerolinea,
    );

    await this.verificarAvionDeAerolinea(
      idAvionFinal,
      idAerolineaFinal,
      cambiaAvion || cambiaAerolinea,
    );

    this.validarFechasVuelo(
      fechaSalidaFinal,
      fechaLlegadaFinal,
      cambiaProgramacion,
    );

    await this.verificarNumeroVueloUnico(
      idAerolineaFinal,
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
        idAerolineaFinal,
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

  async remove(idVuelo: number) {
    const vueloEncontrado =
      await this.prisma.vuelo.findUnique({
        where: {
          idVuelo,
        },
      });

    if (!vueloEncontrado) {
      throw new NotFoundException(
        `No se encontró un vuelo con el ID ${idVuelo}`,
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
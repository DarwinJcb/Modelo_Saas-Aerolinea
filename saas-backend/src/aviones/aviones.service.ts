/* saas-backend/src/aviones/aviones.service.ts */
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { EstadoAerolinea, EstadoPlan, EstadoSuscripcion, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvionDto } from './dto/create-avion.dto';
import { UpdateAvionDto } from './dto/update-avion.dto';

@Injectable()
export class AvionesService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    correoAerolinea: true,
    estadoAerolinea: true,
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
        'La aerolínea debe estar ACTIVA para gestionar aviones',
      );
    }
  }

  private async obtenerSuscripcionVigente(idAerolinea: number) {
    const fechaActual = new Date();

    const suscripcionEncontrada = await this.prisma.suscripcion.findFirst({
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

  private async verificarLimiteAviones(
    idAerolinea: number,
    idAvionExcluir?: number,
  ): Promise<void> {
    const suscripcionVigente =
      await this.obtenerSuscripcionVigente(idAerolinea);

    const cantidadAviones = await this.prisma.avion.count({
      where: {
        fkAerolineaAvion: idAerolinea,
        ...(idAvionExcluir !== undefined
          ? {
            NOT: {
              idAvion: idAvionExcluir,
            },
          }
          : {}),
      },
    });

    const limiteAviones = suscripcionVigente.planSuscripcion.limiteAvionesPlan;

    if (cantidadAviones >= limiteAviones) {
      throw new ConflictException(
        `La aerolínea alcanzó el límite de ${limiteAviones} aviones permitido por su plan`,
      );
    }
  }

  private async verificarMatriculaUnica(
    matriculaAvion: string,
    idAvionExcluir?: number,
  ): Promise<void> {
    const avionExistente = await this.prisma.avion.findFirst({
      where: {
        matriculaAvion,
        ...(idAvionExcluir !== undefined
          ? {
            NOT: {
              idAvion: idAvionExcluir,
            },
          }
          : {}),
      },
    });

    if (avionExistente) {
      throw new ConflictException(
        `Ya existe un avión con la matrícula "${matriculaAvion}"`,
      );
    }
  }

  private async verificarCodigoInternoUnico(
    idAerolinea: number,
    codigoInternoAvion: string,
    idAvionExcluir?: number,
  ): Promise<void> {
    const avionExistente = await this.prisma.avion.findFirst({
      where: {
        fkAerolineaAvion: idAerolinea,
        codigoInternoAvion,
        ...(idAvionExcluir !== undefined
          ? {
            NOT: {
              idAvion: idAvionExcluir,
            },
          }
          : {}),
      },
    });

    if (avionExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene un avión con el código interno "${codigoInternoAvion}"`,
      );
    }
  }

  async create(createAvionDto: CreateAvionDto) {
    await this.verificarAerolineaOperativa(createAvionDto.fkAerolineaAvion);

    await this.verificarLimiteAviones(createAvionDto.fkAerolineaAvion);

    await this.verificarMatriculaUnica(createAvionDto.matriculaAvion);

    await this.verificarCodigoInternoUnico(
      createAvionDto.fkAerolineaAvion,
      createAvionDto.codigoInternoAvion,
    );

    return this.prisma.avion.create({
      data: createAvionDto,
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async findAll() {
    return this.prisma.avion.findMany({
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
      orderBy: {
        idAvion: 'asc',
      },
    });
  }

  async findOne(idAvion: number) {
    const avionEncontrado = await this.prisma.avion.findUnique({
      where: {
        idAvion,
      },
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión con el ID ${idAvion}`,
      );
    }

    return avionEncontrado;
  }

  async update(idAvion: number, updateAvionDto: UpdateAvionDto) {
    const avionActual = await this.prisma.avion.findUnique({
      where: {
        idAvion,
      },
    });

    if (!avionActual) {
      throw new NotFoundException(
        `No se encontró un avión con el ID ${idAvion}`,
      );
    }

    const idAerolineaFinal =
      updateAvionDto.fkAerolineaAvion ?? avionActual.fkAerolineaAvion;

    const matriculaFinal =
      updateAvionDto.matriculaAvion ?? avionActual.matriculaAvion;

    const codigoInternoFinal =
      updateAvionDto.codigoInternoAvion ?? avionActual.codigoInternoAvion;

    await this.verificarAerolineaOperativa(idAerolineaFinal);

    await this.obtenerSuscripcionVigente(idAerolineaFinal);

    if (idAerolineaFinal !== avionActual.fkAerolineaAvion) {
      await this.verificarLimiteAviones(idAerolineaFinal, idAvion);
    }

    await this.verificarMatriculaUnica(matriculaFinal, idAvion);

    await this.verificarCodigoInternoUnico(
      idAerolineaFinal,
      codigoInternoFinal,
      idAvion,
    );

    return this.prisma.avion.update({
      where: {
        idAvion,
      },
      data: updateAvionDto,
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async remove(idAvion: number) {
    const avionEncontrado = await this.prisma.avion.findUnique({
      where: {
        idAvion,
      },
    });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión con el ID ${idAvion}`,
      );
    }

    const cantidadVuelos = await this.prisma.vuelo.count({
      where: {
        fkAvionVuelo: idAvion,
      },
    });

    if (cantidadVuelos > 0) {
      throw new ConflictException(
        'No se puede eliminar el avión porque tiene vuelos asociados. Puede cambiar su estado a FUERA_DE_SERVICIO.',
      );
    }

    return this.prisma.avion.delete({
      where: {
        idAvion,
      },
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }
}

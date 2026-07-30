/* saas-backend/src/suscripciones/suscripciones.service.ts */
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { EstadoSuscripcion } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';

@Injectable()
export class SuscripcionesService {
  constructor(private readonly prisma: PrismaService) { }

  private async verificarPlan(idPlan: number): Promise<void> {
    const planEncontrado = await this.prisma.plan.findUnique({
      where: {
        idPlan,
      },
    });

    if (!planEncontrado) {
      throw new NotFoundException(`No se encontró un plan con el ID ${idPlan}`);
    }
  }

  private async verificarAerolinea(idAerolinea: number): Promise<void> {
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
  }

  private validarFechas(
    fechaInicioSuscripcion: Date,
    fechaFinSuscripcion: Date,
  ): void {
    if (fechaFinSuscripcion <= fechaInicioSuscripcion) {
      throw new BadRequestException(
        'La fecha de finalización debe ser posterior a la fecha de inicio de la suscripción',
      );
    }
  }

  private async verificarSuscripcionActiva(
    idAerolinea: number,
    idSuscripcionExcluir?: number,
  ): Promise<void> {
    const suscripcionActiva = await this.prisma.suscripcion.findFirst({
      where: {
        fkAerolineaSuscripcion: idAerolinea,
        estadoSuscripcion: EstadoSuscripcion.ACTIVA,
        ...(idSuscripcionExcluir !== undefined
          ? {
            NOT: {
              idSuscripcion: idSuscripcionExcluir,
            },
          }
          : {}),
      },
    });

    if (suscripcionActiva) {
      throw new ConflictException(
        'La aerolínea ya tiene una suscripción activa',
      );
    }
  }

  async create(createSuscripcionDto: CreateSuscripcionDto) {
    await this.verificarPlan(createSuscripcionDto.fkPlanSuscripcion);

    await this.verificarAerolinea(createSuscripcionDto.fkAerolineaSuscripcion);

    const fechaInicioSuscripcion =
      createSuscripcionDto.fechaInicioSuscripcion ?? new Date();

    this.validarFechas(
      fechaInicioSuscripcion,
      createSuscripcionDto.fechaFinSuscripcion,
    );

    const estadoSuscripcion =
      createSuscripcionDto.estadoSuscripcion ?? EstadoSuscripcion.ACTIVA;

    if (estadoSuscripcion === EstadoSuscripcion.ACTIVA) {
      await this.verificarSuscripcionActiva(
        createSuscripcionDto.fkAerolineaSuscripcion,
      );
    }

    return this.prisma.suscripcion.create({
      data: {
        ...createSuscripcionDto,
        fechaInicioSuscripcion,
        estadoSuscripcion,
      },
      include: {
        planSuscripcion: {
          select: {
            idPlan: true,
            nombrePlan: true,
            precioMensualPlan: true,
            estadoPlan: true,
          },
        },
        aerolineaSuscripcion: {
          select: {
            idAerolinea: true,
            nombreComercialAerolinea: true,
            correoAerolinea: true,
            estadoAerolinea: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.suscripcion.findMany({
      include: {
        planSuscripcion: {
          select: {
            idPlan: true,
            nombrePlan: true,
            precioMensualPlan: true,
            estadoPlan: true,
          },
        },
        aerolineaSuscripcion: {
          select: {
            idAerolinea: true,
            nombreComercialAerolinea: true,
            correoAerolinea: true,
            estadoAerolinea: true,
          },
        },
      },
      orderBy: {
        idSuscripcion: 'asc',
      },
    });
  }

  async findOne(idSuscripcion: number) {
    const suscripcionEncontrada = await this.prisma.suscripcion.findUnique({
      where: {
        idSuscripcion,
      },
      include: {
        planSuscripcion: {
          select: {
            idPlan: true,
            nombrePlan: true,
            precioMensualPlan: true,
            estadoPlan: true,
          },
        },
        aerolineaSuscripcion: {
          select: {
            idAerolinea: true,
            nombreComercialAerolinea: true,
            correoAerolinea: true,
            estadoAerolinea: true,
          },
        },
      },
    });

    if (!suscripcionEncontrada) {
      throw new NotFoundException(
        `No se encontró una suscripción con el ID ${idSuscripcion}`,
      );
    }

    return suscripcionEncontrada;
  }

  async update(
    idSuscripcion: number,
    updateSuscripcionDto: UpdateSuscripcionDto,
  ) {
    const suscripcionActual = await this.prisma.suscripcion.findUnique({
      where: {
        idSuscripcion,
      },
    });

    if (!suscripcionActual) {
      throw new NotFoundException(
        `No se encontró una suscripción con el ID ${idSuscripcion}`,
      );
    }

    const idPlanFinal =
      updateSuscripcionDto.fkPlanSuscripcion ??
      suscripcionActual.fkPlanSuscripcion;

    const idAerolineaFinal =
      updateSuscripcionDto.fkAerolineaSuscripcion ??
      suscripcionActual.fkAerolineaSuscripcion;

    await this.verificarPlan(idPlanFinal);
    await this.verificarAerolinea(idAerolineaFinal);

    const fechaInicioFinal =
      updateSuscripcionDto.fechaInicioSuscripcion ??
      suscripcionActual.fechaInicioSuscripcion;

    const fechaFinFinal =
      updateSuscripcionDto.fechaFinSuscripcion ??
      suscripcionActual.fechaFinSuscripcion;

    this.validarFechas(fechaInicioFinal, fechaFinFinal);

    const estadoFinal =
      updateSuscripcionDto.estadoSuscripcion ??
      suscripcionActual.estadoSuscripcion;

    if (estadoFinal === EstadoSuscripcion.ACTIVA) {
      await this.verificarSuscripcionActiva(idAerolineaFinal, idSuscripcion);
    }

    return this.prisma.suscripcion.update({
      where: {
        idSuscripcion,
      },
      data: updateSuscripcionDto,
      include: {
        planSuscripcion: {
          select: {
            idPlan: true,
            nombrePlan: true,
            precioMensualPlan: true,
            estadoPlan: true,
          },
        },
        aerolineaSuscripcion: {
          select: {
            idAerolinea: true,
            nombreComercialAerolinea: true,
            correoAerolinea: true,
            estadoAerolinea: true,
          },
        },
      },
    });
  }

  async remove(idSuscripcion: number) {
    const suscripcionEncontrada = await this.prisma.suscripcion.findUnique({
      where: {
        idSuscripcion,
      },
    });

    if (!suscripcionEncontrada) {
      throw new NotFoundException(
        `No se encontró una suscripción con el ID ${idSuscripcion}`,
      );
    }

    if (suscripcionEncontrada.estadoSuscripcion === EstadoSuscripcion.ACTIVA) {
      throw new ConflictException(
        'No se puede eliminar una suscripción activa. Primero debe cambiar su estado a CANCELADA o VENCIDA.',
      );
    }

    return this.prisma.suscripcion.delete({
      where: {
        idSuscripcion,
      },
    });
  }
}

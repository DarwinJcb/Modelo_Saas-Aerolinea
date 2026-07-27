/* saas-backend/src/planes/planes.service.ts */
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPlanDto: CreatePlanDto) {
    const planExistente = await this.prisma.plan.findUnique({
      where: {
        nombrePlan: createPlanDto.nombrePlan,
      },
    });

    if (planExistente) {
      throw new ConflictException(
        `Ya existe un plan con el nombre "${createPlanDto.nombrePlan}"`,
      );
    }

    return this.prisma.plan.create({
      data: createPlanDto,
    });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: {
        idPlan: 'asc',
      },
    });
  }

  async findOne(idPlan: number) {
    const planEncontrado = await this.prisma.plan.findUnique({
      where: {
        idPlan,
      },
    });

    if (!planEncontrado) {
      throw new NotFoundException(
        `No se encontró un plan con el ID ${idPlan}`,
      );
    }

    return planEncontrado;
  }

  async update(idPlan: number, updatePlanDto: UpdatePlanDto) {
    await this.findOne(idPlan);

    if (updatePlanDto.nombrePlan) {
      const planConMismoNombre = await this.prisma.plan.findFirst({
        where: {
          nombrePlan: updatePlanDto.nombrePlan,
          NOT: {
            idPlan,
          },
        },
      });

      if (planConMismoNombre) {
        throw new ConflictException(
          `Ya existe otro plan con el nombre "${updatePlanDto.nombrePlan}"`,
        );
      }
    }

    return this.prisma.plan.update({
      where: {
        idPlan,
      },
      data: updatePlanDto,
    });
  }

  async remove(idPlan: number) {
    await this.findOne(idPlan);

    const cantidadSuscripciones =
      await this.prisma.suscripcion.count({
        where: {
          fkPlanSuscripcion: idPlan,
        },
      });

    if (cantidadSuscripciones > 0) {
      throw new ConflictException(
        'No se puede eliminar el plan porque tiene suscripciones asociadas',
      );
    }

    return this.prisma.plan.delete({
      where: {
        idPlan,
      },
    });
  }
}
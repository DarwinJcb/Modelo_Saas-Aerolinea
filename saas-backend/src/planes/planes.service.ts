/* saas-backend/src/planes/planes.service.ts */
import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  create(createPlanDto: CreatePlanDto) {
    return {
      mensaje: 'Acción temporal para crear un plan',
      datos: createPlanDto,
    };
  }

  findAll() {
    return {
      mensaje: 'Acción temporal para consultar todos los planes',
    };
  }

  findOne(idPlan: number) {
    return {
      mensaje: `Acción temporal para consultar el plan ${idPlan}`,
    };
  }

  update(idPlan: number, updatePlanDto: UpdatePlanDto) {
    return {
      mensaje: `Acción temporal para actualizar el plan ${idPlan}`,
      datos: updatePlanDto,
    };
  }

  remove(idPlan: number) {
    return {
      mensaje: `Acción temporal para eliminar el plan ${idPlan}`,
    };
  }
}
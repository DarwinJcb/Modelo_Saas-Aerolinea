/* saas-backend/src/planes/dto/update-plan.dto.ts */
import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) { }
/* saas-backend/src/aviones/dto/update-avion.dto.ts */
import { OmitType, PartialType, } from '@nestjs/mapped-types';
import { CreateAvionDto } from './create-avion.dto';

export class UpdateAvionDto extends PartialType(
    OmitType(CreateAvionDto, ['fkAerolineaAvion'] as const),
) { }
/* saas-backend/src/vuelos/dto/update-vuelo.dto.ts */
import { OmitType, PartialType, } from '@nestjs/mapped-types';
import { CreateVueloDto } from './create-vuelo.dto';

export class UpdateVueloDto extends PartialType(
    OmitType(CreateVueloDto, ['fkAerolineaVuelo'] as const),
) { }
/* saas-backend/src/rutas/dto/update-ruta.dto.ts */
import { OmitType, PartialType, } from '@nestjs/mapped-types';
import { CreateRutaDto } from './create-ruta.dto';

export class UpdateRutaDto extends PartialType(
    OmitType(CreateRutaDto, ['fkAerolineaRuta'] as const),
) { }
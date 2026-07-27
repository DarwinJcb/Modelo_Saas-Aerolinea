/* saas-backend/src/aerolineas/dto/update-aerolinea.dto.ts */
import { PartialType } from '@nestjs/mapped-types';
import { CreateAerolineaDto } from './create-aerolinea.dto';

export class UpdateAerolineaDto extends PartialType(CreateAerolineaDto) { }
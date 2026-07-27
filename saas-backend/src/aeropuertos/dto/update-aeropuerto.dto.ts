/* saas-backend/src/aeropuertos/dto/update-aeropuerto.dto.ts */
import { PartialType } from '@nestjs/mapped-types';
import { CreateAeropuertoDto } from './create-aeropuerto.dto';

export class UpdateAeropuertoDto extends PartialType(
    CreateAeropuertoDto,
) { }
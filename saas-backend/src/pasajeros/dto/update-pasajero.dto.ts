/* saas-backend/src/pasajeros/dto/update-pasajero.dto.ts */
import { PartialType } from '@nestjs/mapped-types';
import { CreatePasajeroDto } from './create-pasajero.dto';

export class UpdatePasajeroDto extends PartialType(CreatePasajeroDto) {}

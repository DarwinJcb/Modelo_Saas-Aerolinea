/* saas-backend/src/pasajeros/dto/update-pasajero.dto.ts */
import { OmitType, PartialType, } from '@nestjs/mapped-types';
import { CreatePasajeroDto } from './create-pasajero.dto';

export class UpdatePasajeroDto extends PartialType(
    OmitType(
        CreatePasajeroDto,
        ['fkAerolineaPasajero'] as const,
    ),
) { }
/* saas-backend/src/reservas/dto/update-reserva.dto.ts */
import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';

export class UpdateReservaDto extends PartialType(CreateReservaDto) { }

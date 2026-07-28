/* saas-backend/src/planes/dto/create-plan.dto.ts */
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoPlan } from '../../generated/prisma/enums';

export class CreatePlanDto {
  @IsString()
  @Length(3, 50)
  nombrePlan: string;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcionPlan?: string;
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio mensual debe tener máximo 2 decimales' },
  )
  @Min(0)
  precioMensualPlan: number;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limiteUsuariosPlan: number;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limiteAvionesPlan: number;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limiteVuelosMensualesPlan: number;
  @IsOptional()
  @IsEnum(EstadoPlan)
  estadoPlan?: EstadoPlan;
}

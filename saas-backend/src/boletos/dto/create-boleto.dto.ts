/* saas-backend/src/boletos/dto/create-boleto.dto.ts */
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Matches, Max, Min, } from 'class-validator';
import { ClaseBoleto, EstadoBoleto, } from '../../generated/prisma/enums';

export class CreateBoletoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message:
      'El ID de la aerolínea debe ser un número entero',
  })
  @Min(1, {
    message:
      'El ID de la aerolínea debe ser mayor o igual a 1',
  })
  fkAerolineaBoleto?: number;

  @Type(() => Number)
  @IsInt({
    message:
      'El ID de la reserva debe ser un número entero',
  })
  @Min(1, {
    message:
      'El ID de la reserva debe ser mayor o igual a 1',
  })
  fkReservaBoleto: number;

  @IsString()
  @Length(5, 30, {
    message:
      'El número del boleto debe contener entre 5 y 30 caracteres',
  })
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'El número del boleto solo puede contener letras, números y guiones',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  numeroBoleto: string;

  @IsString()
  @Length(2, 4, {
    message:
      'El asiento debe contener entre 2 y 4 caracteres',
  })
  @Matches(/^[1-9][0-9]{0,2}[A-Z]$/, {
    message:
      'El asiento debe tener un formato válido, por ejemplo 8A o 25C',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  asientoBoleto: string;

  @IsOptional()
  @IsEnum(ClaseBoleto, {
    message: 'La clase del boleto no es válida',
  })
  claseBoleto?: ClaseBoleto;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'El precio final debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, {
    message:
      'El precio final del boleto no puede ser negativo',
  })
  @Max(99999999.99, {
    message:
      'El precio final del boleto supera el valor permitido',
  })
  precioFinalBoleto: number;

  @IsOptional()
  @IsEnum(EstadoBoleto, {
    message: 'El estado del boleto no es válido',
  })
  estadoBoleto?: EstadoBoleto;
}
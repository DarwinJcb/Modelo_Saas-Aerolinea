/* saas-backend/src/vuelos/dto/create-vuelo.dto.ts */
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoVuelo } from '../../generated/prisma/enums';

export class CreateVueloDto {
  @Type(() => Number)
  @Min(1, {
    message: 'El ID de la aerolínea debe ser mayor o igual a 1',
  })
  fkAerolineaVuelo: number;

  @Type(() => Number)
  @Min(1, {
    message: 'El ID de la ruta debe ser mayor o igual a 1',
  })
  fkRutaVuelo: number;

  @Type(() => Number)
  @Min(1, {
    message: 'El ID del avión debe ser mayor o igual a 1',
  })
  fkAvionVuelo: number;

  @IsString()
  @Length(2, 20, {
    message: 'El número de vuelo debe contener entre 2 y 20 caracteres',
  })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El número de vuelo solo puede contener letras, números y guiones',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  numeroVuelo: string;

  @Type(() => Date)
  @IsDate({
    message: 'La fecha y hora de salida no es válida',
  })
  fechaHoraSalidaVuelo: Date;

  @Type(() => Date)
  @IsDate({
    message: 'La fecha y hora de llegada no es válida',
  })
  fechaHoraLlegadaVuelo: Date;

  @IsOptional()
  @IsString()
  @MaxLength(20, {
    message: 'La puerta de embarque no puede superar los 20 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  puertaEmbarqueVuelo?: string;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El precio base debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, {
    message: 'El precio base no puede ser negativo',
  })
  precioBaseVuelo: number;

  @IsOptional()
  @IsEnum(EstadoVuelo, {
    message: 'El estado del vuelo no es válido',
  })
  estadoVuelo?: EstadoVuelo;
}

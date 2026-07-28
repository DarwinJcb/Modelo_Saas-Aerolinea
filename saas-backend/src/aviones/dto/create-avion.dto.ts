/* saas-backend/src/aviones/dto/create-avion.dto.ts */
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EstadoAvion } from '../../generated/prisma/enums';

export class CreateAvionDto {
  @Type(() => Number)
  @IsInt({
    message: 'El ID de la aerolínea debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID de la aerolínea debe ser mayor o igual a 1',
  })
  fkAerolineaAvion: number;

  @IsString()
  @Length(3, 20, {
    message: 'La matrícula debe contener entre 3 y 20 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  matriculaAvion: string;

  @IsString()
  @Length(2, 20, {
    message:
      'El código interno del avión debe contener entre 2 y 20 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoInternoAvion: string;

  @IsString()
  @Length(2, 80, {
    message: 'El modelo del avión debe contener entre 2 y 80 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  modeloAvion: string;

  @IsString()
  @Length(2, 80, {
    message: 'El fabricante del avión debe contener entre 2 y 80 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fabricanteAvion: string;

  @Type(() => Number)
  @IsInt({
    message: 'La capacidad del avión debe ser un número entero',
  })
  @Min(1, {
    message: 'La capacidad del avión debe ser mayor o igual a 1',
  })
  @Max(1000, {
    message: 'La capacidad del avión no puede superar 1000 pasajeros',
  })
  capacidadAvion: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El año de fabricación debe ser un número entero',
  })
  @Min(1903, {
    message: 'El año de fabricación no puede ser anterior a 1903',
  })
  @Max(new Date().getFullYear(), {
    message: 'El año de fabricación no puede ser posterior al año actual',
  })
  anioFabricacionAvion?: number;

  @IsOptional()
  @IsEnum(EstadoAvion, {
    message: 'El estado del avión no es válido',
  })
  estadoAvion?: EstadoAvion;
}

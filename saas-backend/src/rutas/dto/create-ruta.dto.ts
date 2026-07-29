/* saas-backend/src/rutas/dto/create-ruta.dto.ts */
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Matches, Max, Min, } from 'class-validator';
import { EstadoRuta } from '../../generated/prisma/enums';

export class CreateRutaDto {
  @Type(() => Number)
  @IsInt({
    message: 'El ID de la aerolínea debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID de la aerolínea debe ser mayor o igual a 1',
  })
  fkAerolineaRuta: number;

  @Type(() => Number)
  @IsInt({
    message: 'El ID del aeropuerto de origen debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID del aeropuerto de origen debe ser mayor o igual a 1',
  })
  fkAeropuertoOrigenRuta: number;

  @Type(() => Number)
  @IsInt({
    message: 'El ID del aeropuerto de destino debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID del aeropuerto de destino debe ser mayor o igual a 1',
  })
  fkAeropuertoDestinoRuta: number;

  @IsString()
  @Length(3, 20, {
    message: 'El código de la ruta debe contener entre 3 y 20 caracteres',
  })
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'El código de la ruta solo puede contener letras, números y guiones',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoRuta: string;

  @Type(() => Number)
  @IsInt({
    message:
      'La duración estimada debe expresarse como un número entero de minutos',
  })
  @Min(1, {
    message: 'La duración estimada debe ser mayor o igual a 1 minuto',
  })
  @Max(3000, {
    message: 'La duración estimada no puede superar 3000 minutos',
  })
  duracionEstimadaMinutosRuta: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'La distancia debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0.01, {
    message: 'La distancia debe ser mayor que 0 kilómetros',
  })
  @Max(50000, {
    message: 'La distancia no puede superar 50000 kilómetros',
  })
  distanciaKilometrosRuta?: number;

  @IsOptional()
  @IsEnum(EstadoRuta, {
    message: 'El estado de la ruta no es válido',
  })
  estadoRuta?: EstadoRuta;
}

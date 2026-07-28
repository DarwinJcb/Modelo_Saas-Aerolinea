/* saas-backend/src/aeropuertos/dto/create-aeropuerto.dto.ts */
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { EstadoAeropuerto } from '../../generated/prisma/enums';

export class CreateAeropuertoDto {
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'El código IATA del aeropuerto debe contener exactamente 3 letras',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoIataAeropuerto: string;

  @IsString()
  @Matches(/^[A-Z]{4}$/, {
    message: 'El código ICAO del aeropuerto debe contener exactamente 4 letras',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoIcaoAeropuerto: string;

  @IsString()
  @Length(3, 150, {
    message: 'El nombre del aeropuerto debe contener entre 3 y 150 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombreAeropuerto: string;

  @IsString()
  @Length(2, 100, {
    message: 'La ciudad del aeropuerto debe contener entre 2 y 100 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  ciudadAeropuerto: string;

  @IsString()
  @Length(2, 80, {
    message: 'El país del aeropuerto debe contener entre 2 y 80 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  paisAeropuerto: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+-]+)+$/, {
    message:
      'La zona horaria debe tener un formato válido, por ejemplo America/Guayaquil',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  zonaHorariaAeropuerto: string;

  @IsOptional()
  @IsEnum(EstadoAeropuerto, {
    message: 'El estado del aeropuerto no es válido',
  })
  estadoAeropuerto?: EstadoAeropuerto;
}

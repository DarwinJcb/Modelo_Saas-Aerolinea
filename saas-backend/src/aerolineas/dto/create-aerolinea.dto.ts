/* saas-backend/src/aerolineas/dto/create-aerolinea.dto.ts */
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { EstadoAerolinea } from '../../generated/prisma/enums';

export class CreateAerolineaDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'El RUC de la aerolínea debe contener exactamente 13 dígitos',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  rucAerolinea?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{2}$/, {
    message:
      'El código IATA de la aerolínea debe contener exactamente 2 letras o números',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoIataAerolinea?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'El código ICAO de la aerolínea debe contener exactamente 3 letras',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoIcaoAerolinea?: string;

  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombreComercialAerolinea: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  razonSocialAerolinea?: string;

  @IsEmail({}, { message: 'El correo de la aerolínea no es válido' })
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  correoAerolinea: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,20}$/, {
    message: 'El teléfono de la aerolínea no tiene un formato válido',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  telefonoAerolinea?: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  paisAerolinea?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'El código del país debe contener exactamente 2 letras',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigoPaisAerolinea?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'La moneda debe representarse mediante un código de 3 letras',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  monedaAerolinea?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  zonaHorariaAerolinea?: string;

  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'La URL del logotipo de la aerolínea no es válida' },
  )
  logotipoUrlAerolinea?: string;

  @IsOptional()
  @IsEnum(EstadoAerolinea, {
    message: 'El estado de la aerolínea no es válido',
  })
  estadoAerolinea?: EstadoAerolinea;
}

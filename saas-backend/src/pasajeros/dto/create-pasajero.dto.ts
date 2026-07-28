/* saas-backend/src/pasajeros/dto/create-pasajero.dto.ts */
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Matches, MaxLength, Min, } from 'class-validator';
import { TipoDocumento } from '../../generated/prisma/enums';

export class CreatePasajeroDto {
    @Type(() => Number)
    @IsInt({
        message: 'El ID de la aerolínea debe ser un número entero',
    })
    @Min(1, {
        message: 'El ID de la aerolínea debe ser mayor o igual a 1',
    })
    fkAerolineaPasajero: number;

    @IsEnum(TipoDocumento, {
        message: 'El tipo de documento del pasajero no es válido',
    })
    tipoDocumentoPasajero: TipoDocumento;

    @IsString()
    @Length(5, 25, {
        message:
            'El número de documento debe contener entre 5 y 25 caracteres',
    })
    @Matches(/^[A-Z0-9-]+$/, {
        message:
            'El número de documento solo puede contener letras, números y guiones',
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().toUpperCase()
            : value,
    )
    numeroDocumentoPasajero: string;

    @IsString()
    @Length(2, 80, {
        message:
            'Los nombres del pasajero deben contener entre 2 y 80 caracteres',
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    nombresPasajero: string;

    @IsString()
    @Length(2, 80, {
        message:
            'Los apellidos del pasajero deben contener entre 2 y 80 caracteres',
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    apellidosPasajero: string;

    @Type(() => Date)
    @IsDate({
        message: 'La fecha de nacimiento del pasajero no es válida',
    })
    fechaNacimientoPasajero: Date;

    @IsString()
    @Length(2, 80, {
        message:
            'La nacionalidad del pasajero debe contener entre 2 y 80 caracteres',
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    nacionalidadPasajero: string;

    @IsOptional()
    @IsEmail({}, {
        message: 'El correo del pasajero no es válido',
    })
    @MaxLength(150)
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().toLowerCase()
            : value,
    )
    correoPasajero?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9\s()-]{7,20}$/, {
        message: 'El teléfono del pasajero no tiene un formato válido',
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    telefonoPasajero?: string;
}
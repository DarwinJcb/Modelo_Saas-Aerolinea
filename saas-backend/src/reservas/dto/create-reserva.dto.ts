/* saas-backend/src/reservas/dto/create-reserva.dto.ts */
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, MaxLength, Min, } from 'class-validator';
import { EstadoReserva } from '../../generated/prisma/enums';

export class CreateReservaDto {
    @Type(() => Number)
    @IsInt({
        message: 'El ID de la aerolínea debe ser un número entero',
    })
    @Min(1, {
        message: 'El ID de la aerolínea debe ser mayor o igual a 1',
    })
    fkAerolineaReserva: number;

    @Type(() => Number)
    @IsInt({
        message: 'El ID del vuelo debe ser un número entero',
    })
    @Min(1, {
        message: 'El ID del vuelo debe ser mayor o igual a 1',
    })
    fkVueloReserva: number;

    @Type(() => Number)
    @IsInt({
        message: 'El ID del pasajero debe ser un número entero',
    })
    @Min(1, {
        message: 'El ID del pasajero debe ser mayor o igual a 1',
    })
    fkPasajeroReserva: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({
        message: 'El ID del usuario debe ser un número entero',
    })
    @Min(1, {
        message: 'El ID del usuario debe ser mayor o igual a 1',
    })
    fkUsuarioRegistroReserva?: number | null;

    @IsString()
    @Length(5, 20, {
        message:
            'El código de la reserva debe contener entre 5 y 20 caracteres',
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().toUpperCase()
            : value,
    )
    codigoReserva: string;

    @IsOptional()
    @IsEnum(EstadoReserva, {
        message: 'El estado de la reserva no es válido',
    })
    estadoReserva?: EstadoReserva;

    @Type(() => Number)
    @IsNumber(
        {
            maxDecimalPlaces: 2,
        },
        {
            message:
                'El total de la reserva debe ser un número con máximo 2 decimales',
        },
    )
    @Min(0, {
        message: 'El total de la reserva no puede ser negativo',
    })
    totalReserva: number;

    @IsOptional()
    @IsString()
    @MaxLength(500, {
        message:
            'La observación de la reserva no puede superar los 500 caracteres',
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    observacionReserva?: string;
}
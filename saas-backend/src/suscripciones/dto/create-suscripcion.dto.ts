/* saas-backend/src/suscripciones/dto/create-suscripcion.dto.ts */
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Min, } from 'class-validator';
import { EstadoSuscripcion } from '../../generated/prisma/enums';

export class CreateSuscripcionDto {
    @Type(() => Number)
    @IsInt({ message: 'El ID del plan debe ser un número entero' })
    @Min(1, { message: 'El ID del plan debe ser mayor o igual a 1' })
    fkPlanSuscripcion: number;

    @Type(() => Number)
    @IsInt({ message: 'El ID de la aerolínea debe ser un número entero' })
    @Min(1, {
        message: 'El ID de la aerolínea debe ser mayor o igual a 1',
    })
    fkAerolineaSuscripcion: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate({
        message: 'La fecha de inicio de la suscripción no es válida',
    })
    fechaInicioSuscripcion?: Date;

    @Type(() => Date)
    @IsDate({
        message: 'La fecha de finalización de la suscripción no es válida',
    })
    fechaFinSuscripcion: Date;

    @IsOptional()
    @IsEnum(EstadoSuscripcion, {
        message: 'El estado de la suscripción no es válido',
    })
    estadoSuscripcion?: EstadoSuscripcion;
}
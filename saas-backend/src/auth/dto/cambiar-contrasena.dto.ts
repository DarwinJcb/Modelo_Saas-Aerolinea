/* saas-backend/src/auth/dto/cambiar-contrasena.dto.ts */
import { IsNotEmpty, IsString, MaxLength, MinLength, } from 'class-validator';

export class CambiarContrasenaDto {
    @IsString({
        message: 'La contraseña actual debe ser una cadena de texto',
    })
    @IsNotEmpty({
        message: 'La contraseña actual es obligatoria',
    })
    @MaxLength(100, {
        message: 'La contraseña actual no puede superar los 100 caracteres',
    })
    contrasenaActual: string;

    @IsString({
        message: 'La nueva contraseña debe ser una cadena de texto',
    })
    @MinLength(8, {
        message: 'La nueva contraseña debe contener al menos 8 caracteres',
    })
    @MaxLength(100, {
        message: 'La nueva contraseña no puede superar los 100 caracteres',
    })
    nuevaContrasena: string;

    @IsString({
        message: 'La confirmación debe ser una cadena de texto',
    })
    @MinLength(8, {
        message: 'La confirmación debe contener al menos 8 caracteres',
    })
    @MaxLength(100, {
        message: 'La confirmación no puede superar los 100 caracteres',
    })
    confirmarNuevaContrasena: string;
}

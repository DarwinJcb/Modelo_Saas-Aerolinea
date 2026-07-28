/* saas-backend/src/auth/dto/login.dto.ts */
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'El correo del usuario no tiene un formato válido',
    },
  )
  @MaxLength(150, {
    message: 'El correo no puede superar los 150 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  correoUsuario: string;

  @IsString({
    message: 'La contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  contrasenaUsuario: string;
}
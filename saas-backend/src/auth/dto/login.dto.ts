/* saas-backend/src/auth/dto/login.dto.ts */
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo ingresado no es válido' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  correoUsuario: string;

  @IsString()
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  contrasenaUsuario: string;
}

/* saas-backend/src/usuarios/dto/create-usuario.dto.ts */
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Matches, MaxLength, Min, MinLength, } from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../../generated/prisma/enums';

export class CreateUsuarioDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El ID de la aerolínea debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID de la aerolínea debe ser mayor o igual a 1',
  })
  fkAerolineaUsuario?: number;

  @IsString()
  @Length(2, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombresUsuario: string;

  @IsString()
  @Length(2, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  apellidosUsuario: string;

  @IsEmail({}, { message: 'El correo del usuario no es válido' })
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  correoUsuario: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contener al menos 8 caracteres',
  })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe contener una letra mayúscula',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe contener una letra minúscula',
  })
  @Matches(/[0-9]/, {
    message: 'La contraseña debe contener un número',
  })
  contrasenaUsuario: string;

  @IsOptional()
  @IsEnum(RolUsuario, {
    message: 'El rol del usuario no es válido',
  })
  rolUsuario?: RolUsuario;

  @IsOptional()
  @IsEnum(EstadoUsuario, {
    message: 'El estado del usuario no es válido',
  })
  estadoUsuario?: EstadoUsuario;
}

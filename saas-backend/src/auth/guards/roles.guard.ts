/* saas-backend/src/auth/guards/roles.guard.ts */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RolUsuario } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

interface SolicitudConUsuario {
  usuario?: UsuarioAutenticado;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos =
      this.reflector.getAllAndOverride<RolUsuario[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !rolesPermitidos ||
      rolesPermitidos.length === 0
    ) {
      return true;
    }

    const solicitud =
      context.switchToHttp().getRequest<SolicitudConUsuario>();

    const usuarioAutenticado = solicitud.usuario;

    if (!usuarioAutenticado) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario autenticado',
      );
    }

    const tieneRolPermitido =
      rolesPermitidos.includes(
        usuarioAutenticado.rolUsuario,
      );

    if (!tieneRolPermitido) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta operación',
      );
    }

    return true;
  }
}
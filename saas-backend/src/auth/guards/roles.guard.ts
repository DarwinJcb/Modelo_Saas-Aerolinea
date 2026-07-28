/* saas-backend/src/auth/guards/roles.guard.ts */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../generated/prisma/enums';
import { ROLES_KEY, } from '../decorators/roles.decorator';
import type { SolicitudConUsuario, } from '../interfaces/auth.interface';

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
      context
        .switchToHttp()
        .getRequest<SolicitudConUsuario>();

    const usuario = solicitud.usuario;

    if (!usuario) {
      throw new UnauthorizedException(
        'No se encontró un usuario autenticado',
      );
    }

    if (
      !rolesPermitidos.includes(usuario.rolUsuario)
    ) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta operación',
      );
    }

    return true;
  }
}
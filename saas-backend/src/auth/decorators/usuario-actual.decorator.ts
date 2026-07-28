/* saas-backend/src/auth/decorators/usuario-actual.decorator.ts */
import { createParamDecorator, ExecutionContext, UnauthorizedException, } from '@nestjs/common';
import type { SolicitudConUsuario, UsuarioAutenticado, } from '../interfaces/auth.interface';

export const UsuarioActual = createParamDecorator(
    (
        _data: unknown,
        context: ExecutionContext,
    ): UsuarioAutenticado => {
        const solicitud = context
            .switchToHttp()
            .getRequest<SolicitudConUsuario>();

        if (!solicitud.usuario) {
            throw new UnauthorizedException(
                'No se encontró un usuario autenticado',
            );
        }

        return solicitud.usuario;
    },
);
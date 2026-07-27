/* saas-backend/src/auth/decorators/usuario-actual.decorator.ts */
import { createParamDecorator, ExecutionContext, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

export const UsuarioActual = createParamDecorator(
    (
        _dato: unknown,
        context: ExecutionContext,
    ): UsuarioAutenticado => {
        const solicitud =
            context.switchToHttp().getRequest<{
                usuario: UsuarioAutenticado;
            }>();

        return solicitud.usuario;
    },
);
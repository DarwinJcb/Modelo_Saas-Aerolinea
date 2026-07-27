/* saas-backend/src/auth/decorators/usuario-actual.decorator.ts */
import { SetMetadata } from '@nestjs/common';

export const UsuarioActual = (...args: string[]) => SetMetadata('usuario-actual', args);

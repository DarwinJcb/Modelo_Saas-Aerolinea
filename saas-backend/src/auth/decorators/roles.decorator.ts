/* saas-backend/src/auth/decorators/roles.decorator.ts */
import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolUsuario[]) =>
    SetMetadata(ROLES_KEY, roles);
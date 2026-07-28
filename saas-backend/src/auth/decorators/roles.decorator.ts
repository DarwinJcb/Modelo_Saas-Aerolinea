/* saas-backend/src/auth/decorators/roles.decorator.ts */
import { SetMetadata } from '@nestjs/common';
import type { RolUsuario } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...rolesPermitidos: RolUsuario[]) =>
  SetMetadata(ROLES_KEY, rolesPermitidos);

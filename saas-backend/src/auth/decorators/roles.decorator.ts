/* saas-backend/src/auth/decorators/roles.decorator.ts */
import { SetMetadata } from '@nestjs/common';

export const Roles = (...args: string[]) => SetMetadata('roles', args);

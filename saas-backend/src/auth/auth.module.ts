/* saas-backend/src/auth/auth.module.ts */
import 'dotenv/config';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

function convertirDuracionASegundos(
    duracion: string,
): number {
    const duracionNormalizada =
        duracion.trim().toLowerCase();

    const coincidencia =
        /^(\d+)([smhd])$/.exec(duracionNormalizada);

    if (!coincidencia) {
        throw new Error(
            'JWT_EXPIRES_IN debe usar un formato como 30s, 15m, 2h o 30d',
        );
    }

    const cantidad = Number(coincidencia[1]);
    const unidad = coincidencia[2];

    const segundosPorUnidad: Record<string, number> = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60,
    };

    return cantidad * segundosPorUnidad[unidad];
}

const secretoJwt = process.env.JWT_SECRET;

const expiracionJwt =
    process.env.JWT_EXPIRES_IN ?? '30d';

if (!secretoJwt) {
    throw new Error(
        'La variable JWT_SECRET no está definida en el archivo .env',
    );
}

const expiracionJwtSegundos =
    convertirDuracionASegundos(expiracionJwt);

@Global()
@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: secretoJwt,
            signOptions: {
                expiresIn: expiracionJwtSegundos,
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard, RolesGuard,],
    exports: [AuthService, JwtAuthGuard, RolesGuard,],
})
export class AuthModule { } 
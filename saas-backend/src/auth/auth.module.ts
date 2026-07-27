/* saas-backend/src/auth/auth.module.ts */
import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const secretoJwt = process.env.JWT_SECRET;
const expiracionJwtSegundos = Number(
    process.env.JWT_EXPIRES_IN_SECONDS ?? 7200,
);

if (!secretoJwt) {
    throw new Error(
        'La variable JWT_SECRET no está definida en el archivo .env',
    );
}

if (
    !Number.isInteger(expiracionJwtSegundos) ||
    expiracionJwtSegundos <= 0
) {
    throw new Error(
        'JWT_EXPIRES_IN_SECONDS debe ser un número entero mayor que cero',
    );
}

@Module({
    imports: [
        JwtModule.register({
            secret: secretoJwt,
            signOptions: {
                expiresIn: expiracionJwtSegundos,
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }
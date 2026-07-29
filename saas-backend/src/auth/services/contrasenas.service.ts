/* saas-backend/src/auth/services/contrasenas.service.ts */
import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

@Injectable()
export class ContrasenasService {
    private derivarClave(
        contrasenaUsuario: string,
        saltContrasena: string,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            scrypt(
                contrasenaUsuario,
                saltContrasena,
                64,
                (error, claveDerivada) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(claveDerivada);
                },
            );
        });
    }

    async generarHashContrasena(
        contrasenaUsuario: string,
    ): Promise<string> {
        const saltContrasena = randomBytes(16).toString('hex');

        const claveDerivada = await this.derivarClave(
            contrasenaUsuario,
            saltContrasena,
        );

        return `${saltContrasena}:${claveDerivada.toString('hex')}`;
    }

    async verificarContrasena(
        contrasenaIngresada: string,
        contrasenaAlmacenada: string,
    ): Promise<boolean> {
        const partesContrasena = contrasenaAlmacenada.split(':');

        if (partesContrasena.length !== 2) {
            return false;
        }

        const [saltContrasena, hashContrasena] =
            partesContrasena;

        if (
            !saltContrasena ||
            !hashContrasena ||
            !/^[0-9a-f]{32}$/i.test(saltContrasena) ||
            !/^[0-9a-f]{128}$/i.test(hashContrasena)
        ) {
            return false;
        }

        const hashIngresado = await this.derivarClave(
            contrasenaIngresada,
            saltContrasena,
        );

        const hashGuardado = Buffer.from(
            hashContrasena,
            'hex',
        );

        if (hashIngresado.length !== hashGuardado.length) {
            return false;
        }

        return timingSafeEqual(hashIngresado, hashGuardado);
    }
}

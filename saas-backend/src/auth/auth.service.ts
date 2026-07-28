/* saas-backend/src/auth/auth.service.ts */
import { ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { EstadoAerolinea, EstadoSuscripcion, EstadoUsuario, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type SuscripcionActualLogin = {
    idSuscripcion: number;
    fechaInicioSuscripcion: Date;
    fechaFinSuscripcion: Date;
    estadoSuscripcion: EstadoSuscripcion;
    planSuscripcion: {
        idPlan: number;
        nombrePlan: string;
        limiteUsuariosPlan: number;
        limiteAvionesPlan: number;
        limiteVuelosMensualesPlan: number;
    };
};

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

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

    private async verificarContrasena(
        contrasenaIngresada: string,
        contrasenaAlmacenada: string,
    ): Promise<boolean> {
        const partesContrasena = contrasenaAlmacenada.split(':');

        if (partesContrasena.length !== 2) {
            return false;
        }

        const [saltContrasena, hashContrasena] =
            partesContrasena;

        if (!saltContrasena || !hashContrasena || !/^[0-9a-f]{32}$/i.test(saltContrasena) || !/^[0-9a-f]{128}$/i.test(hashContrasena)) {
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

    async login(loginDto: LoginDto) {
        const usuarioEncontrado =
            await this.prisma.usuario.findUnique({
                where: {
                    correoUsuario: loginDto.correoUsuario,
                },
                include: {
                    aerolineaUsuario: {
                        select: {
                            idAerolinea: true,
                            nombreComercialAerolinea: true,
                            codigoIataAerolinea: true,
                            estadoAerolinea: true,
                        },
                    },
                },
            });

        if (!usuarioEncontrado) {
            throw new UnauthorizedException(
                'Correo o contraseña incorrectos',
            );
        }

        const contrasenaCorrecta =
            await this.verificarContrasena(
                loginDto.contrasenaUsuario,
                usuarioEncontrado.contrasenaUsuario,
            );

        if (!contrasenaCorrecta) {
            throw new UnauthorizedException(
                'Correo o contraseña incorrectos',
            );
        }

        if (
            usuarioEncontrado.estadoUsuario !==
            EstadoUsuario.ACTIVO
        ) {
            throw new ForbiddenException(
                'El usuario no se encuentra ACTIVO',
            );
        }

        let suscripcionActual: SuscripcionActualLogin | null =
            null;
        if (
            usuarioEncontrado.rolUsuario !==
            RolUsuario.SUPERADMIN
        ) {
            if (
                usuarioEncontrado.fkAerolineaUsuario === null ||
                usuarioEncontrado.aerolineaUsuario === null
            ) {
                throw new ForbiddenException(
                    'El usuario no tiene una aerolínea asignada',
                );
            }

            if (
                usuarioEncontrado.aerolineaUsuario
                    .estadoAerolinea !== EstadoAerolinea.ACTIVA
            ) {
                throw new ForbiddenException(
                    'La aerolínea del usuario no se encuentra ACTIVA',
                );
            }

            const fechaActual = new Date();

            suscripcionActual = await this.prisma.suscripcion.findFirst({
                where: {
                    fkAerolineaSuscripcion:
                        usuarioEncontrado.fkAerolineaUsuario,
                    estadoSuscripcion:
                        EstadoSuscripcion.ACTIVA,
                    fechaInicioSuscripcion: {
                        lte: fechaActual,
                    },
                    fechaFinSuscripcion: {
                        gte: fechaActual,
                    },
                },
                select: {
                    idSuscripcion: true,
                    fechaInicioSuscripcion: true,
                    fechaFinSuscripcion: true,
                    estadoSuscripcion: true,
                    planSuscripcion: {
                        select: {
                            idPlan: true,
                            nombrePlan: true,
                            limiteUsuariosPlan: true,
                            limiteAvionesPlan: true,
                            limiteVuelosMensualesPlan: true,
                        },
                    },
                },
                orderBy: {
                    fechaFinSuscripcion: 'desc',
                },
            });

            if (!suscripcionActual) {
                throw new ForbiddenException(
                    'La aerolínea no tiene una suscripción activa y vigente',
                );
            }
        }

        const payloadJwt = {
            sub: usuarioEncontrado.idUsuario,
            rolUsuario: usuarioEncontrado.rolUsuario,
            fkAerolineaUsuario:
                usuarioEncontrado.fkAerolineaUsuario,
        };

        const tokenAcceso =
            await this.jwtService.signAsync(payloadJwt);

        const fechaUltimoAcceso = new Date();

        await this.prisma.usuario.update({
            where: {
                idUsuario: usuarioEncontrado.idUsuario,
            },
            data: {
                ultimoAccesoUsuario: fechaUltimoAcceso,
            },
        });

        return {
            tokenAcceso,
            tipoToken: 'Bearer',
            expiraEn: '2h',
            usuario: {
                idUsuario: usuarioEncontrado.idUsuario,
                fkAerolineaUsuario:
                    usuarioEncontrado.fkAerolineaUsuario,
                nombresUsuario:
                    usuarioEncontrado.nombresUsuario,
                apellidosUsuario:
                    usuarioEncontrado.apellidosUsuario,
                correoUsuario:
                    usuarioEncontrado.correoUsuario,
                rolUsuario: usuarioEncontrado.rolUsuario,
                estadoUsuario:
                    usuarioEncontrado.estadoUsuario,
                ultimoAccesoUsuario: fechaUltimoAcceso,
                aerolineaUsuario:
                    usuarioEncontrado.aerolineaUsuario,
            },
            suscripcionActual,
        };
    }
}
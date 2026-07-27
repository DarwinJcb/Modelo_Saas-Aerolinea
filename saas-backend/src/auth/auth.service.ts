/* saas-backend/src/auth/auth.service.ts */
import { ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scrypt, timingSafeEqual, } from 'node:crypto';
import { EstadoAerolinea, EstadoPlan, EstadoSuscripcion, EstadoUsuario, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    private verificarContrasena(
        contrasenaIngresada: string,
        contrasenaAlmacenada: string,
    ): Promise<boolean> {
        const partesContrasena =
            contrasenaAlmacenada.split(':');

        if (partesContrasena.length !== 2) {
            return Promise.resolve(false);
        }

        const [saltContrasena, hashContrasena] =
            partesContrasena;

        if (!saltContrasena || !hashContrasena) {
            return Promise.resolve(false);
        }

        return new Promise((resolve, reject) => {
            scrypt(
                contrasenaIngresada,
                saltContrasena,
                64,
                (error, claveDerivada) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const hashAlmacenado = Buffer.from(
                        hashContrasena,
                        'hex',
                    );

                    if (
                        hashAlmacenado.length !==
                        claveDerivada.length
                    ) {
                        resolve(false);
                        return;
                    }

                    resolve(
                        timingSafeEqual(
                            hashAlmacenado,
                            claveDerivada,
                        ),
                    );
                },
            );
        });
    }

    async login(loginDto: LoginDto) {
        const usuarioEncontrado =
            await this.prisma.usuario.findUnique({
                where: {
                    correoUsuario: loginDto.correoUsuario,
                },
                select: {
                    idUsuario: true,
                    fkAerolineaUsuario: true,
                    nombresUsuario: true,
                    apellidosUsuario: true,
                    correoUsuario: true,
                    contrasenaUsuario: true,
                    rolUsuario: true,
                    estadoUsuario: true,
                    aerolineaUsuario: {
                        select: {
                            idAerolinea: true,
                            nombreComercialAerolinea: true,
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
                'El usuario no se encuentra activo',
            );
        }

        if (
            usuarioEncontrado.rolUsuario !==
            RolUsuario.SUPERADMIN
        ) {
            if (
                !usuarioEncontrado.fkAerolineaUsuario ||
                !usuarioEncontrado.aerolineaUsuario
            ) {
                throw new ForbiddenException(
                    'El usuario no está asociado a una aerolínea',
                );
            }

            if (
                usuarioEncontrado.aerolineaUsuario
                    .estadoAerolinea !==
                EstadoAerolinea.ACTIVA
            ) {
                throw new ForbiddenException(
                    'La aerolínea del usuario no se encuentra activa',
                );
            }

            const fechaActual = new Date();

            const suscripcionActiva =
                await this.prisma.suscripcion.findFirst({
                    where: {
                        fkAerolineaSuscripcion:
                            usuarioEncontrado.fkAerolineaUsuario,
                        estadoSuscripcion:
                            EstadoSuscripcion.ACTIVA,
                        fechaInicioSuscripcion: {
                            lte: fechaActual,
                        },
                        fechaFinSuscripcion: {
                            gt: fechaActual,
                        },
                    },
                    include: {
                        planSuscripcion: {
                            select: {
                                estadoPlan: true,
                            },
                        },
                    },
                });

            if (
                !suscripcionActiva ||
                suscripcionActiva.planSuscripcion
                    .estadoPlan !== EstadoPlan.ACTIVO
            ) {
                throw new ForbiddenException(
                    'La aerolínea no tiene una suscripción activa',
                );
            }
        }

        const contenidoToken = {
            sub: usuarioEncontrado.idUsuario,
            rolUsuario: usuarioEncontrado.rolUsuario,
            fkAerolineaUsuario:
                usuarioEncontrado.fkAerolineaUsuario,
        };

        const tokenAcceso =
            await this.jwtService.signAsync(contenidoToken);

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
        };
    }
}
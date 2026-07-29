/* saas-backend/src/auth/auth.service.ts */
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EstadoAerolinea, EstadoSuscripcion, EstadoUsuario, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { LoginDto } from './dto/login.dto';
import type { UsuarioAutenticado } from './interfaces/auth.interface';
import { ContrasenasService } from './services/contrasenas.service';

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
        private readonly contrasenasService: ContrasenasService,
    ) { }

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
            await this.contrasenasService.verificarContrasena(
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

    async cambiarContrasena(
        cambiarContrasenaDto: CambiarContrasenaDto,
        usuarioActual: UsuarioAutenticado,
    ) {
        const usuarioEncontrado =
            await this.prisma.usuario.findUnique({
                where: {
                    idUsuario: usuarioActual.idUsuario,
                },
                select: {
                    idUsuario: true,
                    contrasenaUsuario: true,
                    estadoUsuario: true,
                },
            });

        if (!usuarioEncontrado) {
            throw new UnauthorizedException(
                'El usuario autenticado ya no existe',
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

        const contrasenaActualCorrecta =
            await this.contrasenasService.verificarContrasena(
                cambiarContrasenaDto.contrasenaActual,
                usuarioEncontrado.contrasenaUsuario,
            );

        if (!contrasenaActualCorrecta) {
            throw new BadRequestException(
                'La contraseña actual es incorrecta',
            );
        }

        if (
            cambiarContrasenaDto.nuevaContrasena !==
            cambiarContrasenaDto.confirmarNuevaContrasena
        ) {
            throw new BadRequestException(
                'La nueva contraseña y su confirmación no coinciden',
            );
        }

        const nuevaContrasenaEsActual =
            await this.contrasenasService.verificarContrasena(
                cambiarContrasenaDto.nuevaContrasena,
                usuarioEncontrado.contrasenaUsuario,
            );

        if (nuevaContrasenaEsActual) {
            throw new BadRequestException(
                'La nueva contraseña debe ser diferente de la contraseña actual',
            );
        }

        const nuevaContrasenaHash =
            await this.contrasenasService.generarHashContrasena(
                cambiarContrasenaDto.nuevaContrasena,
            );

        await this.prisma.usuario.update({
            where: {
                idUsuario: usuarioEncontrado.idUsuario,
            },
            data: {
                contrasenaUsuario: nuevaContrasenaHash,
            },
        });

        return {
            mensaje:
                'Contraseña actualizada correctamente. Inicie sesión nuevamente.',
        };
    }

}

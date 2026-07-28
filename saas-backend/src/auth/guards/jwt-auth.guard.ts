/* saas-backend/src/auth/guards/jwt-auth.guard.ts */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EstadoAerolinea, EstadoSuscripcion, EstadoUsuario, RolUsuario, } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, SolicitudConUsuario, } from '../interfaces/auth.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const solicitud =
      context.switchToHttp().getRequest<SolicitudConUsuario>();

    const token = this.extraerToken(solicitud);

    if (!token) {
      throw new UnauthorizedException(
        'Debe enviar un token Bearer',
      );
    }

    let payload: JwtPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
        );
    } catch {
      throw new UnauthorizedException(
        'El token es inválido o ha expirado',
      );
    }

    if (
      !Number.isInteger(payload.sub) ||
      payload.sub < 1
    ) {
      throw new UnauthorizedException(
        'El token no contiene un usuario válido',
      );
    }

    const usuarioEncontrado =
      await this.prisma.usuario.findUnique({
        where: {
          idUsuario: payload.sub,
        },
        select: {
          idUsuario: true,
          fkAerolineaUsuario: true,
          nombresUsuario: true,
          apellidosUsuario: true,
          correoUsuario: true,
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
        'El usuario del token ya no existe',
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

    if (
      payload.rolUsuario !==
      usuarioEncontrado.rolUsuario ||
      payload.fkAerolineaUsuario !==
      usuarioEncontrado.fkAerolineaUsuario
    ) {
      throw new UnauthorizedException(
        'Los datos del usuario cambiaron. Inicie sesión nuevamente',
      );
    }

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

      const suscripcionVigente =
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
              gte: fechaActual,
            },
          },
          select: {
            idSuscripcion: true,
          },
        });

      if (!suscripcionVigente) {
        throw new ForbiddenException(
          'La aerolínea no tiene una suscripción activa y vigente',
        );
      }
    }

    solicitud.usuario = usuarioEncontrado;

    return true;
  }

  private extraerToken(
    solicitud: SolicitudConUsuario,
  ): string | undefined {
    const [tipoToken, token] =
      solicitud.headers.authorization?.split(' ') ??
      [];

    if (tipoToken !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
}
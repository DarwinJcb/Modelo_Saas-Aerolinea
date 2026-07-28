/* saas-backend/src/auth/guards/jwt-auth.guard.ts */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  EstadoAerolinea,
  EstadoPlan,
  EstadoSuscripcion,
  EstadoUsuario,
  RolUsuario,
} from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

interface ContenidoToken {
  sub: number;
  rolUsuario: RolUsuario;
  fkAerolineaUsuario: number | null;
}

interface SolicitudAutenticada {
  headers: {
    authorization?: string;
  };
  usuario?: UsuarioAutenticado;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const solicitud = context.switchToHttp().getRequest<SolicitudAutenticada>();

    const tokenAcceso = this.extraerToken(solicitud.headers.authorization);

    let contenidoToken: ContenidoToken;

    try {
      contenidoToken =
        await this.jwtService.verifyAsync<ContenidoToken>(tokenAcceso);
    } catch {
      throw new UnauthorizedException(
        'El token de acceso es inválido o ha expirado',
      );
    }

    if (!Number.isInteger(contenidoToken.sub) || contenidoToken.sub < 1) {
      throw new UnauthorizedException(
        'El token de acceso no contiene un usuario válido',
      );
    }

    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: {
        idUsuario: contenidoToken.sub,
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
      throw new UnauthorizedException('El usuario del token ya no existe');
    }

    if (usuarioEncontrado.estadoUsuario !== EstadoUsuario.ACTIVO) {
      throw new ForbiddenException('El usuario no se encuentra activo');
    }

    if (
      usuarioEncontrado.rolUsuario !== contenidoToken.rolUsuario ||
      usuarioEncontrado.fkAerolineaUsuario !== contenidoToken.fkAerolineaUsuario
    ) {
      throw new UnauthorizedException(
        'Los datos del token están desactualizados. Inicie sesión nuevamente.',
      );
    }

    if (usuarioEncontrado.rolUsuario !== RolUsuario.SUPERADMIN) {
      await this.verificarAccesoAerolinea(
        usuarioEncontrado.fkAerolineaUsuario,
        usuarioEncontrado.aerolineaUsuario,
      );
    }

    solicitud.usuario = usuarioEncontrado;

    return true;
  }

  private extraerToken(encabezadoAutorizacion?: string): string {
    if (!encabezadoAutorizacion) {
      throw new UnauthorizedException('No se proporcionó un token de acceso');
    }

    const [tipoToken, tokenAcceso] = encabezadoAutorizacion.split(' ');

    if (tipoToken !== 'Bearer' || !tokenAcceso) {
      throw new UnauthorizedException(
        'El token debe enviarse usando el formato Bearer',
      );
    }

    return tokenAcceso;
  }

  private async verificarAccesoAerolinea(
    fkAerolineaUsuario: number | null,
    aerolineaUsuario: UsuarioAutenticado['aerolineaUsuario'],
  ): Promise<void> {
    if (fkAerolineaUsuario === null || !aerolineaUsuario) {
      throw new ForbiddenException(
        'El usuario no está asociado a una aerolínea',
      );
    }

    if (aerolineaUsuario.estadoAerolinea !== EstadoAerolinea.ACTIVA) {
      throw new ForbiddenException(
        'La aerolínea del usuario no se encuentra activa',
      );
    }

    const fechaActual = new Date();

    const suscripcionActiva = await this.prisma.suscripcion.findFirst({
      where: {
        fkAerolineaSuscripcion: fkAerolineaUsuario,
        estadoSuscripcion: EstadoSuscripcion.ACTIVA,
        fechaInicioSuscripcion: {
          lte: fechaActual,
        },
        fechaFinSuscripcion: {
          gt: fechaActual,
        },
        planSuscripcion: {
          estadoPlan: EstadoPlan.ACTIVO,
        },
      },
      select: {
        idSuscripcion: true,
      },
    });

    if (!suscripcionActiva) {
      throw new ForbiddenException(
        'La aerolínea no tiene una suscripción activa y vigente',
      );
    }
  }
}

/* saas-backend/src/auth/interfaces/auth.interface.ts */
import { EstadoAerolinea, EstadoUsuario, RolUsuario, } from '../../generated/prisma/enums';

export interface JwtPayload {
    sub: number;
    rolUsuario: RolUsuario;
    fkAerolineaUsuario: number | null;
    iat?: number;
    exp?: number;
}

export interface UsuarioAutenticado {
    idUsuario: number;
    fkAerolineaUsuario: number | null;
    nombresUsuario: string;
    apellidosUsuario: string;
    correoUsuario: string;
    rolUsuario: RolUsuario;
    estadoUsuario: EstadoUsuario;
    aerolineaUsuario: {
        idAerolinea: number;
        nombreComercialAerolinea: string;
        estadoAerolinea: EstadoAerolinea;
    } | null;
}

export interface SolicitudConUsuario {
    headers: {
        authorization?: string;
    };
    usuario?: UsuarioAutenticado;
}
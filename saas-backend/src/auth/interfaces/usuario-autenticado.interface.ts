/* saas-backend/src/auth/interfaces/usuario-autenticado.interface.ts */
import type {
  EstadoAerolinea,
  EstadoUsuario,
  RolUsuario,
} from '../../generated/prisma/enums';

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

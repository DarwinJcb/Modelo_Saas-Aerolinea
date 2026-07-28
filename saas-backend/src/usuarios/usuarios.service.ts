/* saas-backend/src/usuarios/usuarios.service.ts */
import {  BadRequestException,ConflictException,Injectable,NotFoundException,} from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';
import { EstadoUsuario, RolUsuario } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly seleccionUsuario = {
    idUsuario: true,
    fkAerolineaUsuario: true,
    nombresUsuario: true,
    apellidosUsuario: true,
    correoUsuario: true,
    rolUsuario: true,
    estadoUsuario: true,
    ultimoAccesoUsuario: true,
    fechaCreacionUsuario: true,
    fechaActualizacionUsuario: true,
    aerolineaUsuario: {
      select: {
        idAerolinea: true,
        nombreComercialAerolinea: true,
        correoAerolinea: true,
        estadoAerolinea: true,
      },
    },
  } as const;

  private generarHashContrasena(contrasenaUsuario: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltContrasena = randomBytes(16).toString('hex');

      scrypt(contrasenaUsuario, saltContrasena, 64, (error, claveDerivada) => {
        if (error) {
          reject(error);
          return;
        }

        const hashContrasena = claveDerivada.toString('hex');

        resolve(`${saltContrasena}:${hashContrasena}`);
      });
    });
  }

  private async verificarCorreoUnico(
    correoUsuario: string,
    idUsuarioExcluir?: number,
  ): Promise<void> {
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        correoUsuario,
        ...(idUsuarioExcluir !== undefined
          ? {
              NOT: {
                idUsuario: idUsuarioExcluir,
              },
            }
          : {}),
      },
    });

    if (usuarioExistente) {
      throw new ConflictException(
        `Ya existe un usuario con el correo "${correoUsuario}"`,
      );
    }
  }

  private async verificarAerolinea(idAerolinea: number): Promise<void> {
    const aerolineaEncontrada = await this.prisma.aerolinea.findUnique({
      where: {
        idAerolinea,
      },
    });

    if (!aerolineaEncontrada) {
      throw new NotFoundException(
        `No se encontró una aerolínea con el ID ${idAerolinea}`,
      );
    }
  }

  private async validarRolYAerolinea(
    rolUsuario: RolUsuario,
    fkAerolineaUsuario: number | null | undefined,
  ): Promise<number | null> {
    if (rolUsuario === RolUsuario.SUPERADMIN) {
      if (fkAerolineaUsuario !== undefined && fkAerolineaUsuario !== null) {
        throw new BadRequestException(
          'Un usuario SUPERADMIN no debe pertenecer a una aerolínea',
        );
      }

      return null;
    }

    if (fkAerolineaUsuario === undefined || fkAerolineaUsuario === null) {
      throw new BadRequestException(
        `Un usuario con rol ${rolUsuario} debe pertenecer a una aerolínea`,
      );
    }

    await this.verificarAerolinea(fkAerolineaUsuario);

    return fkAerolineaUsuario;
  }

  private async verificarPuedeEliminar(
    idUsuario: number,
    rolUsuario: RolUsuario,
    estadoUsuario: EstadoUsuario,
    fkAerolineaUsuario: number | null,
  ): Promise<void> {
    if (estadoUsuario !== EstadoUsuario.ACTIVO) {
      return;
    }

    if (rolUsuario === RolUsuario.SUPERADMIN) {
      const otrosSuperadministradores = await this.prisma.usuario.count({
        where: {
          rolUsuario: RolUsuario.SUPERADMIN,
          estadoUsuario: EstadoUsuario.ACTIVO,
          NOT: {
            idUsuario,
          },
        },
      });

      if (otrosSuperadministradores === 0) {
        throw new ConflictException(
          'No se puede eliminar el único SUPERADMIN activo de la plataforma',
        );
      }
    }

    if (
      rolUsuario === RolUsuario.ADMIN_AEROLINEA &&
      fkAerolineaUsuario !== null
    ) {
      const otrosAdministradores = await this.prisma.usuario.count({
        where: {
          fkAerolineaUsuario,
          rolUsuario: RolUsuario.ADMIN_AEROLINEA,
          estadoUsuario: EstadoUsuario.ACTIVO,
          NOT: {
            idUsuario,
          },
        },
      });

      if (otrosAdministradores === 0) {
        throw new ConflictException(
          'No se puede eliminar el único administrador activo de la aerolínea',
        );
      }
    }
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    await this.verificarCorreoUnico(createUsuarioDto.correoUsuario);

    const rolUsuario = createUsuarioDto.rolUsuario ?? RolUsuario.EMPLEADO;

    const estadoUsuario =
      createUsuarioDto.estadoUsuario ?? EstadoUsuario.ACTIVO;

    const fkAerolineaUsuario = await this.validarRolYAerolinea(
      rolUsuario,
      createUsuarioDto.fkAerolineaUsuario,
    );

    const contrasenaUsuario = await this.generarHashContrasena(
      createUsuarioDto.contrasenaUsuario,
    );

    return this.prisma.usuario.create({
      data: {
        nombresUsuario: createUsuarioDto.nombresUsuario,
        apellidosUsuario: createUsuarioDto.apellidosUsuario,
        correoUsuario: createUsuarioDto.correoUsuario,
        contrasenaUsuario,
        rolUsuario,
        estadoUsuario,
        fkAerolineaUsuario,
      },
      select: this.seleccionUsuario,
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: this.seleccionUsuario,
      orderBy: {
        idUsuario: 'asc',
      },
    });
  }

  async findOne(idUsuario: number) {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: {
        idUsuario,
      },
      select: this.seleccionUsuario,
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(
        `No se encontró un usuario con el ID ${idUsuario}`,
      );
    }

    return usuarioEncontrado;
  }

  async update(idUsuario: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: {
        idUsuario,
      },
    });

    if (!usuarioActual) {
      throw new NotFoundException(
        `No se encontró un usuario con el ID ${idUsuario}`,
      );
    }

    if (
      updateUsuarioDto.correoUsuario &&
      updateUsuarioDto.correoUsuario !== usuarioActual.correoUsuario
    ) {
      await this.verificarCorreoUnico(
        updateUsuarioDto.correoUsuario,
        idUsuario,
      );
    }

    const rolUsuario = updateUsuarioDto.rolUsuario ?? usuarioActual.rolUsuario;

    let fkAerolineaSolicitada =
      updateUsuarioDto.fkAerolineaUsuario ?? usuarioActual.fkAerolineaUsuario;

    if (rolUsuario === RolUsuario.SUPERADMIN) {
      if (updateUsuarioDto.fkAerolineaUsuario !== undefined) {
        throw new BadRequestException(
          'Un usuario SUPERADMIN no debe pertenecer a una aerolínea',
        );
      }

      fkAerolineaSolicitada = null;
    }

    const fkAerolineaUsuario = await this.validarRolYAerolinea(
      rolUsuario,
      fkAerolineaSolicitada,
    );

    const estadoUsuario =
      updateUsuarioDto.estadoUsuario ?? usuarioActual.estadoUsuario;

    const datosActualizacion = {
      ...(updateUsuarioDto.nombresUsuario !== undefined
        ? {
            nombresUsuario: updateUsuarioDto.nombresUsuario,
          }
        : {}),
      ...(updateUsuarioDto.apellidosUsuario !== undefined
        ? {
            apellidosUsuario: updateUsuarioDto.apellidosUsuario,
          }
        : {}),
      ...(updateUsuarioDto.correoUsuario !== undefined
        ? {
            correoUsuario: updateUsuarioDto.correoUsuario,
          }
        : {}),
      rolUsuario,
      estadoUsuario,
      fkAerolineaUsuario,
      ...(updateUsuarioDto.contrasenaUsuario
        ? {
            contrasenaUsuario: await this.generarHashContrasena(
              updateUsuarioDto.contrasenaUsuario,
            ),
          }
        : {}),
    };

    return this.prisma.usuario.update({
      where: {
        idUsuario,
      },
      data: datosActualizacion,
      select: this.seleccionUsuario,
    });
  }

  async remove(idUsuario: number) {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: {
        idUsuario,
      },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(
        `No se encontró un usuario con el ID ${idUsuario}`,
      );
    }

    await this.verificarPuedeEliminar(
      usuarioEncontrado.idUsuario,
      usuarioEncontrado.rolUsuario,
      usuarioEncontrado.estadoUsuario,
      usuarioEncontrado.fkAerolineaUsuario,
    );

    return this.prisma.usuario.delete({
      where: {
        idUsuario,
      },
      select: this.seleccionUsuario,
    });
  }
}

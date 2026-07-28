/* saas-backend/src/usuarios/usuarios.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoPlan, EstadoSuscripcion, EstadoUsuario, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) { }

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

  private generarHashContrasena(
    contrasenaUsuario: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltContrasena = randomBytes(16).toString(
        'hex',
      );

      scrypt(
        contrasenaUsuario,
        saltContrasena,
        64,
        (error, claveDerivada) => {
          if (error) {
            reject(error);
            return;
          }

          const hashContrasena =
            claveDerivada.toString('hex');

          resolve(
            `${saltContrasena}:${hashContrasena}`,
          );
        },
      );
    });
  }

  private obtenerIdAerolineaAdministrador(
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.fkAerolineaUsuario === null) {
      throw new ForbiddenException(
        'El administrador no tiene una aerolínea asignada',
      );
    }

    return usuarioActual.fkAerolineaUsuario;
  }

  private async verificarCorreoUnico(
    correoUsuario: string,
    idUsuarioExcluir?: number,
  ): Promise<void> {
    const usuarioExistente =
      await this.prisma.usuario.findFirst({
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

  private async verificarAerolineaYLímiteUsuarios(
    idAerolinea: number,
    idUsuarioExcluir?: number,
  ): Promise<void> {
    const aerolineaEncontrada =
      await this.prisma.aerolinea.findUnique({
        where: {
          idAerolinea,
        },
        select: {
          estadoAerolinea: true,
        },
      });

    if (!aerolineaEncontrada) {
      throw new NotFoundException(
        `No se encontró una aerolínea con el ID ${idAerolinea}`,
      );
    }

    if (
      aerolineaEncontrada.estadoAerolinea !==
      EstadoAerolinea.ACTIVA
    ) {
      throw new ConflictException(
        'La aerolínea debe estar ACTIVA para registrar usuarios',
      );
    }

    const fechaActual = new Date();

    const suscripcionActual =
      await this.prisma.suscripcion.findFirst({
        where: {
          fkAerolineaSuscripcion: idAerolinea,
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
          planSuscripcion: {
            select: {
              nombrePlan: true,
              limiteUsuariosPlan: true,
              estadoPlan: true,
            },
          },
        },
        orderBy: {
          fechaFinSuscripcion: 'desc',
        },
      });

    if (
      !suscripcionActual ||
      suscripcionActual.planSuscripcion.estadoPlan !==
      EstadoPlan.ACTIVO
    ) {
      throw new ConflictException(
        'La aerolínea no tiene una suscripción activa con un plan vigente',
      );
    }

    const cantidadUsuarios =
      await this.prisma.usuario.count({
        where: {
          fkAerolineaUsuario: idAerolinea,
          ...(idUsuarioExcluir !== undefined
            ? {
              NOT: {
                idUsuario: idUsuarioExcluir,
              },
            }
            : {}),
        },
      });

    const limiteUsuarios =
      suscripcionActual.planSuscripcion
        .limiteUsuariosPlan;

    if (cantidadUsuarios >= limiteUsuarios) {
      throw new ConflictException(
        `La aerolínea alcanzó el límite de ${limiteUsuarios} usuarios de su plan "${suscripcionActual.planSuscripcion.nombrePlan}"`,
      );
    }
  }

  private async resolverCreacion(
    createUsuarioDto: CreateUsuarioDto,
    usuarioActual: UsuarioAutenticado,
  ): Promise<{
    rolUsuario: RolUsuario;
    fkAerolineaUsuario: number | null;
  }> {
    const rolUsuario =
      createUsuarioDto.rolUsuario ??
      RolUsuario.EMPLEADO;

    if (
      usuarioActual.rolUsuario ===
      RolUsuario.SUPERADMIN
    ) {
      if (rolUsuario === RolUsuario.SUPERADMIN) {
        if (
          createUsuarioDto.fkAerolineaUsuario !==
          undefined
        ) {
          throw new BadRequestException(
            'Un usuario SUPERADMIN no debe pertenecer a una aerolínea',
          );
        }

        return {
          rolUsuario,
          fkAerolineaUsuario: null,
        };
      }

      if (
        createUsuarioDto.fkAerolineaUsuario ===
        undefined
      ) {
        throw new BadRequestException(
          `Un usuario con rol ${rolUsuario} debe pertenecer a una aerolínea`,
        );
      }

      await this.verificarAerolineaYLímiteUsuarios(
        createUsuarioDto.fkAerolineaUsuario,
      );

      return {
        rolUsuario,
        fkAerolineaUsuario:
          createUsuarioDto.fkAerolineaUsuario,
      };
    }

    if (rolUsuario === RolUsuario.SUPERADMIN) {
      throw new ForbiddenException(
        'Un administrador de aerolínea no puede crear usuarios SUPERADMIN',
      );
    }

    const idAerolineaAdministrador =
      this.obtenerIdAerolineaAdministrador(
        usuarioActual,
      );

    if (
      createUsuarioDto.fkAerolineaUsuario !==
      undefined &&
      createUsuarioDto.fkAerolineaUsuario !==
      idAerolineaAdministrador
    ) {
      throw new ForbiddenException(
        'No puede registrar usuarios para otra aerolínea',
      );
    }

    await this.verificarAerolineaYLímiteUsuarios(
      idAerolineaAdministrador,
    );

    return {
      rolUsuario,
      fkAerolineaUsuario:
        idAerolineaAdministrador,
    };
  }

  private async buscarUsuarioGestionable(
    idUsuario: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const usuarioEncontrado =
      usuarioActual.rolUsuario ===
        RolUsuario.SUPERADMIN
        ? await this.prisma.usuario.findUnique({
          where: {
            idUsuario,
          },
        })
        : await this.prisma.usuario.findFirst({
          where: {
            idUsuario,
            fkAerolineaUsuario:
              this.obtenerIdAerolineaAdministrador(
                usuarioActual,
              ),
          },
        });

    if (!usuarioEncontrado) {
      throw new NotFoundException(
        `No se encontró un usuario accesible con el ID ${idUsuario}`,
      );
    }

    return usuarioEncontrado;
  }

  private async verificarCambioTenant(
    idUsuario: number,
    fkAerolineaActual: number | null,
    fkAerolineaFinal: number | null,
  ): Promise<void> {
    if (
      fkAerolineaActual === fkAerolineaFinal
    ) {
      return;
    }

    const cantidadReservas =
      await this.prisma.reserva.count({
        where: {
          fkUsuarioRegistroReserva: idUsuario,
        },
      });

    if (cantidadReservas > 0) {
      throw new ConflictException(
        'No se puede cambiar la aerolínea del usuario porque tiene reservas registradas',
      );
    }
  }

  private async verificarConservaAdministradores(
    idUsuario: number,
    rolActual: RolUsuario,
    estadoActual: EstadoUsuario,
    fkAerolineaActual: number | null,
    rolFinal: RolUsuario,
    estadoFinal: EstadoUsuario,
    fkAerolineaFinal: number | null,
  ): Promise<void> {
    const dejaDeSerSuperadminActivo =
      rolActual === RolUsuario.SUPERADMIN &&
      estadoActual === EstadoUsuario.ACTIVO &&
      (rolFinal !== RolUsuario.SUPERADMIN ||
        estadoFinal !== EstadoUsuario.ACTIVO);

    if (dejaDeSerSuperadminActivo) {
      const otrosSuperadministradores =
        await this.prisma.usuario.count({
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
          'Debe permanecer al menos un SUPERADMIN activo en la plataforma',
        );
      }
    }

    const dejaDeSerAdministradorActivo =
      rolActual ===
      RolUsuario.ADMIN_AEROLINEA &&
      estadoActual === EstadoUsuario.ACTIVO &&
      fkAerolineaActual !== null &&
      (rolFinal !==
        RolUsuario.ADMIN_AEROLINEA ||
        estadoFinal !== EstadoUsuario.ACTIVO ||
        fkAerolineaFinal !==
        fkAerolineaActual);

    if (dejaDeSerAdministradorActivo) {
      const otrosAdministradores =
        await this.prisma.usuario.count({
          where: {
            fkAerolineaUsuario:
              fkAerolineaActual,
            rolUsuario:
              RolUsuario.ADMIN_AEROLINEA,
            estadoUsuario: EstadoUsuario.ACTIVO,
            NOT: {
              idUsuario,
            },
          },
        });

      if (otrosAdministradores === 0) {
        throw new ConflictException(
          'Debe permanecer al menos un administrador activo en la aerolínea',
        );
      }
    }
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
      const otrosSuperadministradores =
        await this.prisma.usuario.count({
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
      rolUsuario ===
      RolUsuario.ADMIN_AEROLINEA &&
      fkAerolineaUsuario !== null
    ) {
      const otrosAdministradores =
        await this.prisma.usuario.count({
          where: {
            fkAerolineaUsuario,
            rolUsuario:
              RolUsuario.ADMIN_AEROLINEA,
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

  async create(
    createUsuarioDto: CreateUsuarioDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    await this.verificarCorreoUnico(
      createUsuarioDto.correoUsuario,
    );

    const datosAsignacion =
      await this.resolverCreacion(
        createUsuarioDto,
        usuarioActual,
      );

    const estadoUsuario =
      createUsuarioDto.estadoUsuario ??
      EstadoUsuario.ACTIVO;

    const contrasenaUsuario =
      await this.generarHashContrasena(
        createUsuarioDto.contrasenaUsuario,
      );

    return this.prisma.usuario.create({
      data: {
        nombresUsuario:
          createUsuarioDto.nombresUsuario,
        apellidosUsuario:
          createUsuarioDto.apellidosUsuario,
        correoUsuario:
          createUsuarioDto.correoUsuario,
        contrasenaUsuario,
        rolUsuario: datosAsignacion.rolUsuario,
        estadoUsuario,
        fkAerolineaUsuario:
          datosAsignacion.fkAerolineaUsuario,
      },
      select: this.seleccionUsuario,
    });
  }

  async findAll(
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.prisma.usuario.findMany({
      where:
        usuarioActual.rolUsuario ===
          RolUsuario.SUPERADMIN
          ? {}
          : {
            fkAerolineaUsuario:
              this.obtenerIdAerolineaAdministrador(
                usuarioActual,
              ),
          },
      select: this.seleccionUsuario,
      orderBy: {
        idUsuario: 'asc',
      },
    });
  }

  async findOne(
    idUsuario: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const usuarioEncontrado =
      usuarioActual.rolUsuario ===
        RolUsuario.SUPERADMIN
        ? await this.prisma.usuario.findUnique({
          where: {
            idUsuario,
          },
          select: this.seleccionUsuario,
        })
        : await this.prisma.usuario.findFirst({
          where: {
            idUsuario,
            fkAerolineaUsuario:
              this.obtenerIdAerolineaAdministrador(
                usuarioActual,
              ),
          },
          select: this.seleccionUsuario,
        });

    if (!usuarioEncontrado) {
      throw new NotFoundException(
        `No se encontró un usuario accesible con el ID ${idUsuario}`,
      );
    }

    return usuarioEncontrado;
  }

  async update(
    idUsuario: number,
    updateUsuarioDto: UpdateUsuarioDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const usuarioEncontrado =
      await this.buscarUsuarioGestionable(
        idUsuario,
        usuarioActual,
      );

    if (
      updateUsuarioDto.correoUsuario &&
      updateUsuarioDto.correoUsuario !==
      usuarioEncontrado.correoUsuario
    ) {
      await this.verificarCorreoUnico(
        updateUsuarioDto.correoUsuario,
        idUsuario,
      );
    }

    const rolFinal =
      updateUsuarioDto.rolUsuario ??
      usuarioEncontrado.rolUsuario;

    let fkAerolineaFinal: number | null;

    if (
      usuarioActual.rolUsuario ===
      RolUsuario.SUPERADMIN
    ) {
      if (rolFinal === RolUsuario.SUPERADMIN) {
        if (
          updateUsuarioDto.fkAerolineaUsuario !==
          undefined
        ) {
          throw new BadRequestException(
            'Un usuario SUPERADMIN no debe pertenecer a una aerolínea',
          );
        }

        fkAerolineaFinal = null;
      } else {
        fkAerolineaFinal =
          updateUsuarioDto.fkAerolineaUsuario ??
          usuarioEncontrado.fkAerolineaUsuario;

        if (fkAerolineaFinal === null) {
          throw new BadRequestException(
            `Un usuario con rol ${rolFinal} debe pertenecer a una aerolínea`,
          );
        }
      }
    } else {
      if (rolFinal === RolUsuario.SUPERADMIN) {
        throw new ForbiddenException(
          'Un administrador de aerolínea no puede asignar el rol SUPERADMIN',
        );
      }

      const idAerolineaAdministrador =
        this.obtenerIdAerolineaAdministrador(
          usuarioActual,
        );

      if (
        updateUsuarioDto.fkAerolineaUsuario !==
        undefined &&
        updateUsuarioDto.fkAerolineaUsuario !==
        idAerolineaAdministrador
      ) {
        throw new ForbiddenException(
          'No puede trasladar usuarios a otra aerolínea',
        );
      }

      fkAerolineaFinal =
        idAerolineaAdministrador;
    }

    await this.verificarCambioTenant(
      idUsuario,
      usuarioEncontrado.fkAerolineaUsuario,
      fkAerolineaFinal,
    );

    if (
      fkAerolineaFinal !== null &&
      fkAerolineaFinal !==
      usuarioEncontrado.fkAerolineaUsuario
    ) {
      await this.verificarAerolineaYLímiteUsuarios(
        fkAerolineaFinal,
        idUsuario,
      );
    }

    const estadoFinal =
      updateUsuarioDto.estadoUsuario ??
      usuarioEncontrado.estadoUsuario;

    await this.verificarConservaAdministradores(
      idUsuario,
      usuarioEncontrado.rolUsuario,
      usuarioEncontrado.estadoUsuario,
      usuarioEncontrado.fkAerolineaUsuario,
      rolFinal,
      estadoFinal,
      fkAerolineaFinal,
    );

    const datosActualizacion = {
      ...(updateUsuarioDto.nombresUsuario !==
        undefined
        ? {
          nombresUsuario:
            updateUsuarioDto.nombresUsuario,
        }
        : {}),
      ...(updateUsuarioDto.apellidosUsuario !==
        undefined
        ? {
          apellidosUsuario:
            updateUsuarioDto.apellidosUsuario,
        }
        : {}),
      ...(updateUsuarioDto.correoUsuario !==
        undefined
        ? {
          correoUsuario:
            updateUsuarioDto.correoUsuario,
        }
        : {}),
      rolUsuario: rolFinal,
      estadoUsuario: estadoFinal,
      fkAerolineaUsuario: fkAerolineaFinal,
      ...(updateUsuarioDto.contrasenaUsuario
        ? {
          contrasenaUsuario:
            await this.generarHashContrasena(
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

  async remove(
    idUsuario: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (idUsuario === usuarioActual.idUsuario) {
      throw new ConflictException(
        'No puede eliminar su propio usuario mientras tiene una sesión activa',
      );
    }

    const usuarioEncontrado =
      await this.buscarUsuarioGestionable(
        idUsuario,
        usuarioActual,
      );

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
/* saas-backend/src/aviones/aviones.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoPlan, EstadoSuscripcion, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvionDto } from './dto/create-avion.dto';
import { UpdateAvionDto } from './dto/update-avion.dto';

@Injectable()
export class AvionesService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    correoAerolinea: true,
    estadoAerolinea: true,
  } as const;

  private obtenerIdAerolineaUsuario(
    usuarioActual: UsuarioAutenticado,
  ): number {
    const idAerolinea = usuarioActual.fkAerolineaUsuario;

    if (idAerolinea === null || idAerolinea === undefined) {
      throw new ForbiddenException(
        'El usuario autenticado no pertenece a una aerolínea',
      );
    }

    return idAerolinea;
  }

  private resolverIdAerolineaCreacion(
    createAvionDto: CreateAvionDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createAvionDto.fkAerolineaAvion === undefined ||
        createAvionDto.fkAerolineaAvion === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria del avión',
        );
      }

      return createAvionDto.fkAerolineaAvion;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createAvionDto.fkAerolineaAvion !== undefined &&
      createAvionDto.fkAerolineaAvion !== null &&
      createAvionDto.fkAerolineaAvion !== idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede registrar aviones para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idAvion: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idAvion,
      };
    }

    return {
      idAvion,
      fkAerolineaAvion:
        this.obtenerIdAerolineaUsuario(usuarioActual),
    };
  }

  private async verificarAerolineaOperativa(
    idAerolinea: number,
  ): Promise<void> {
    const aerolineaEncontrada =
      await this.prisma.aerolinea.findUnique({
        where: {
          idAerolinea,
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
        'La aerolínea debe estar ACTIVA para gestionar aviones',
      );
    }
  }

  private async obtenerSuscripcionVigente(
    idAerolinea: number,
  ) {
    const fechaActual = new Date();

    const suscripcionEncontrada =
      await this.prisma.suscripcion.findFirst({
        where: {
          fkAerolineaSuscripcion: idAerolinea,
          estadoSuscripcion: EstadoSuscripcion.ACTIVA,
          fechaInicioSuscripcion: {
            lte: fechaActual,
          },
          fechaFinSuscripcion: {
            gt: fechaActual,
          },
          planSuscripcion: {
            is: {
              estadoPlan: EstadoPlan.ACTIVO,
            },
          },
        },
        include: {
          planSuscripcion: true,
        },
        orderBy: {
          fechaFinSuscripcion: 'desc',
        },
      });

    if (!suscripcionEncontrada) {
      throw new ConflictException(
        'La aerolínea no tiene una suscripción activa y vigente',
      );
    }

    return suscripcionEncontrada;
  }

  private async verificarLimiteAviones(
    idAerolinea: number,
  ): Promise<void> {
    const suscripcionVigente =
      await this.obtenerSuscripcionVigente(idAerolinea);

    const cantidadAviones = await this.prisma.avion.count({
      where: {
        fkAerolineaAvion: idAerolinea,
      },
    });

    const limiteAviones =
      suscripcionVigente.planSuscripcion.limiteAvionesPlan;

    if (cantidadAviones >= limiteAviones) {
      throw new ConflictException(
        `La aerolínea alcanzó el límite de ${limiteAviones} aviones permitido por su plan`,
      );
    }
  }

  private async verificarMatriculaUnica(
    matriculaAvion: string,
    idAvionExcluir?: number,
  ): Promise<void> {
    const avionExistente = await this.prisma.avion.findFirst({
      where: {
        matriculaAvion,
        ...(idAvionExcluir !== undefined
          ? {
            NOT: {
              idAvion: idAvionExcluir,
            },
          }
          : {}),
      },
    });

    if (avionExistente) {
      throw new ConflictException(
        `Ya existe un avión con la matrícula "${matriculaAvion}"`,
      );
    }
  }

  private async verificarCodigoInternoUnico(
    idAerolinea: number,
    codigoInternoAvion: string,
    idAvionExcluir?: number,
  ): Promise<void> {
    const avionExistente = await this.prisma.avion.findFirst({
      where: {
        fkAerolineaAvion: idAerolinea,
        codigoInternoAvion,
        ...(idAvionExcluir !== undefined
          ? {
            NOT: {
              idAvion: idAvionExcluir,
            },
          }
          : {}),
      },
    });

    if (avionExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene un avión con el código interno "${codigoInternoAvion}"`,
      );
    }
  }

  async create(
    createAvionDto: CreateAvionDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createAvionDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);
    await this.verificarLimiteAviones(idAerolinea);
    await this.verificarMatriculaUnica(
      createAvionDto.matriculaAvion,
    );
    await this.verificarCodigoInternoUnico(
      idAerolinea,
      createAvionDto.codigoInternoAvion,
    );

    const datosAvion = {
      ...createAvionDto,
      fkAerolineaAvion: idAerolinea,
    };

    return this.prisma.avion.create({
      data: datosAvion,
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async findAll(usuarioActual: UsuarioAutenticado) {
    const filtroAerolinea =
      usuarioActual.rolUsuario === RolUsuario.SUPERADMIN
        ? undefined
        : {
          fkAerolineaAvion:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.avion.findMany({
      where: filtroAerolinea,
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
      orderBy: {
        idAvion: 'asc',
      },
    });
  }

  async findOne(
    idAvion: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const avionEncontrado = await this.prisma.avion.findFirst({
      where: this.construirFiltroAcceso(
        idAvion,
        usuarioActual,
      ),
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión accesible con el ID ${idAvion}`,
      );
    }

    return avionEncontrado;
  }

  async update(
    idAvion: number,
    updateAvionDto: UpdateAvionDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const avionActual = await this.prisma.avion.findFirst({
      where: this.construirFiltroAcceso(
        idAvion,
        usuarioActual,
      ),
    });

    if (!avionActual) {
      throw new NotFoundException(
        `No se encontró un avión accesible con el ID ${idAvion}`,
      );
    }

    const matriculaFinal =
      updateAvionDto.matriculaAvion ??
      avionActual.matriculaAvion;

    const codigoInternoFinal =
      updateAvionDto.codigoInternoAvion ??
      avionActual.codigoInternoAvion;

    await this.verificarAerolineaOperativa(
      avionActual.fkAerolineaAvion,
    );

    await this.obtenerSuscripcionVigente(
      avionActual.fkAerolineaAvion,
    );

    await this.verificarMatriculaUnica(
      matriculaFinal,
      idAvion,
    );

    await this.verificarCodigoInternoUnico(
      avionActual.fkAerolineaAvion,
      codigoInternoFinal,
      idAvion,
    );

    return this.prisma.avion.update({
      where: {
        idAvion,
      },
      data: updateAvionDto,
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async remove(
    idAvion: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const avionEncontrado = await this.prisma.avion.findFirst({
      where: this.construirFiltroAcceso(
        idAvion,
        usuarioActual,
      ),
    });

    if (!avionEncontrado) {
      throw new NotFoundException(
        `No se encontró un avión accesible con el ID ${idAvion}`,
      );
    }

    const cantidadVuelos = await this.prisma.vuelo.count({
      where: {
        fkAvionVuelo: idAvion,
      },
    });

    if (cantidadVuelos > 0) {
      throw new ConflictException(
        'No se puede eliminar el avión porque tiene vuelos asociados. Puede cambiar su estado a FUERA_DE_SERVICIO.',
      );
    }

    return this.prisma.avion.delete({
      where: {
        idAvion,
      },
      include: {
        aerolineaAvion: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }
}
/* saas-backend/src/rutas/rutas.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoAeropuerto, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    estadoAerolinea: true,
  } as const;

  private readonly seleccionAeropuerto = {
    idAeropuerto: true,
    codigoIataAeropuerto: true,
    codigoIcaoAeropuerto: true,
    nombreAeropuerto: true,
    ciudadAeropuerto: true,
    paisAeropuerto: true,
    estadoAeropuerto: true,
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
    createRutaDto: CreateRutaDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createRutaDto.fkAerolineaRuta === undefined ||
        createRutaDto.fkAerolineaRuta === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria de la ruta',
        );
      }

      return createRutaDto.fkAerolineaRuta;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createRutaDto.fkAerolineaRuta !== undefined &&
      createRutaDto.fkAerolineaRuta !== null &&
      createRutaDto.fkAerolineaRuta !== idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede registrar rutas para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idRuta: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idRuta,
      };
    }

    return {
      idRuta,
      fkAerolineaRuta:
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
        'La aerolínea debe estar ACTIVA para gestionar rutas',
      );
    }
  }

  private async verificarAeropuertoOperativo(
    idAeropuerto: number,
    tipoAeropuerto: 'origen' | 'destino',
  ): Promise<void> {
    const aeropuertoEncontrado =
      await this.prisma.aeropuerto.findUnique({
        where: {
          idAeropuerto,
        },
      });

    if (!aeropuertoEncontrado) {
      throw new NotFoundException(
        `No se encontró el aeropuerto de ${tipoAeropuerto} con el ID ${idAeropuerto}`,
      );
    }

    if (
      aeropuertoEncontrado.estadoAeropuerto !==
      EstadoAeropuerto.ACTIVO
    ) {
      throw new ConflictException(
        `El aeropuerto de ${tipoAeropuerto} debe estar ACTIVO`,
      );
    }
  }

  private validarAeropuertosDiferentes(
    idAeropuertoOrigen: number,
    idAeropuertoDestino: number,
  ): void {
    if (idAeropuertoOrigen === idAeropuertoDestino) {
      throw new BadRequestException(
        'El aeropuerto de origen y el aeropuerto de destino deben ser diferentes',
      );
    }
  }

  private async verificarCodigoRutaUnico(
    idAerolinea: number,
    codigoRuta: string,
    idRutaExcluir?: number,
  ): Promise<void> {
    const rutaExistente = await this.prisma.ruta.findFirst({
      where: {
        fkAerolineaRuta: idAerolinea,
        codigoRuta,
        ...(idRutaExcluir !== undefined
          ? {
            NOT: {
              idRuta: idRutaExcluir,
            },
          }
          : {}),
      },
    });

    if (rutaExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene una ruta con el código "${codigoRuta}"`,
      );
    }
  }

  private async verificarTrayectoUnico(
    idAerolinea: number,
    idAeropuertoOrigen: number,
    idAeropuertoDestino: number,
    idRutaExcluir?: number,
  ): Promise<void> {
    const rutaExistente = await this.prisma.ruta.findFirst({
      where: {
        fkAerolineaRuta: idAerolinea,
        fkAeropuertoOrigenRuta: idAeropuertoOrigen,
        fkAeropuertoDestinoRuta: idAeropuertoDestino,
        ...(idRutaExcluir !== undefined
          ? {
            NOT: {
              idRuta: idRutaExcluir,
            },
          }
          : {}),
      },
    });

    if (rutaExistente) {
      throw new ConflictException(
        'La aerolínea ya tiene registrada una ruta con el mismo aeropuerto de origen y destino',
      );
    }
  }

  async create(
    createRutaDto: CreateRutaDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createRutaDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);

    this.validarAeropuertosDiferentes(
      createRutaDto.fkAeropuertoOrigenRuta,
      createRutaDto.fkAeropuertoDestinoRuta,
    );

    await this.verificarAeropuertoOperativo(
      createRutaDto.fkAeropuertoOrigenRuta,
      'origen',
    );

    await this.verificarAeropuertoOperativo(
      createRutaDto.fkAeropuertoDestinoRuta,
      'destino',
    );

    await this.verificarCodigoRutaUnico(
      idAerolinea,
      createRutaDto.codigoRuta,
    );

    await this.verificarTrayectoUnico(
      idAerolinea,
      createRutaDto.fkAeropuertoOrigenRuta,
      createRutaDto.fkAeropuertoDestinoRuta,
    );

    const datosRuta = {
      ...createRutaDto,
      fkAerolineaRuta: idAerolinea,
    };

    return this.prisma.ruta.create({
      data: datosRuta,
      include: {
        aerolineaRuta: {
          select: this.seleccionAerolinea,
        },
        aeropuertoOrigenRuta: {
          select: this.seleccionAeropuerto,
        },
        aeropuertoDestinoRuta: {
          select: this.seleccionAeropuerto,
        },
      },
    });
  }

  async findAll(usuarioActual: UsuarioAutenticado) {
    const filtroAerolinea =
      usuarioActual.rolUsuario === RolUsuario.SUPERADMIN
        ? undefined
        : {
          fkAerolineaRuta:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.ruta.findMany({
      where: filtroAerolinea,
      include: {
        aerolineaRuta: {
          select: this.seleccionAerolinea,
        },
        aeropuertoOrigenRuta: {
          select: this.seleccionAeropuerto,
        },
        aeropuertoDestinoRuta: {
          select: this.seleccionAeropuerto,
        },
      },
      orderBy: {
        idRuta: 'asc',
      },
    });
  }

  async findOne(
    idRuta: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const rutaEncontrada = await this.prisma.ruta.findFirst({
      where: this.construirFiltroAcceso(
        idRuta,
        usuarioActual,
      ),
      include: {
        aerolineaRuta: {
          select: this.seleccionAerolinea,
        },
        aeropuertoOrigenRuta: {
          select: this.seleccionAeropuerto,
        },
        aeropuertoDestinoRuta: {
          select: this.seleccionAeropuerto,
        },
      },
    });

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta accesible con el ID ${idRuta}`,
      );
    }

    return rutaEncontrada;
  }

  async update(
    idRuta: number,
    updateRutaDto: UpdateRutaDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const rutaActual = await this.prisma.ruta.findFirst({
      where: this.construirFiltroAcceso(
        idRuta,
        usuarioActual,
      ),
    });

    if (!rutaActual) {
      throw new NotFoundException(
        `No se encontró una ruta accesible con el ID ${idRuta}`,
      );
    }

    const idAeropuertoOrigenFinal =
      updateRutaDto.fkAeropuertoOrigenRuta ??
      rutaActual.fkAeropuertoOrigenRuta;

    const idAeropuertoDestinoFinal =
      updateRutaDto.fkAeropuertoDestinoRuta ??
      rutaActual.fkAeropuertoDestinoRuta;

    const codigoRutaFinal =
      updateRutaDto.codigoRuta ?? rutaActual.codigoRuta;

    const modificaTrayecto =
      idAeropuertoOrigenFinal !==
      rutaActual.fkAeropuertoOrigenRuta ||
      idAeropuertoDestinoFinal !==
      rutaActual.fkAeropuertoDestinoRuta;

    if (modificaTrayecto) {
      const cantidadVuelos = await this.prisma.vuelo.count({
        where: {
          fkRutaVuelo: idRuta,
        },
      });

      if (cantidadVuelos > 0) {
        throw new ConflictException(
          'No se puede cambiar el origen o el destino porque la ruta tiene vuelos asociados',
        );
      }
    }

    await this.verificarAerolineaOperativa(
      rutaActual.fkAerolineaRuta,
    );

    this.validarAeropuertosDiferentes(
      idAeropuertoOrigenFinal,
      idAeropuertoDestinoFinal,
    );

    await this.verificarAeropuertoOperativo(
      idAeropuertoOrigenFinal,
      'origen',
    );

    await this.verificarAeropuertoOperativo(
      idAeropuertoDestinoFinal,
      'destino',
    );

    await this.verificarCodigoRutaUnico(
      rutaActual.fkAerolineaRuta,
      codigoRutaFinal,
      idRuta,
    );

    await this.verificarTrayectoUnico(
      rutaActual.fkAerolineaRuta,
      idAeropuertoOrigenFinal,
      idAeropuertoDestinoFinal,
      idRuta,
    );

    return this.prisma.ruta.update({
      where: {
        idRuta,
      },
      data: updateRutaDto,
      include: {
        aerolineaRuta: {
          select: this.seleccionAerolinea,
        },
        aeropuertoOrigenRuta: {
          select: this.seleccionAeropuerto,
        },
        aeropuertoDestinoRuta: {
          select: this.seleccionAeropuerto,
        },
      },
    });
  }

  async remove(
    idRuta: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const rutaEncontrada = await this.prisma.ruta.findFirst({
      where: this.construirFiltroAcceso(
        idRuta,
        usuarioActual,
      ),
    });

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta accesible con el ID ${idRuta}`,
      );
    }

    const cantidadVuelos = await this.prisma.vuelo.count({
      where: {
        fkRutaVuelo: idRuta,
      },
    });

    if (cantidadVuelos > 0) {
      throw new ConflictException(
        'No se puede eliminar la ruta porque tiene vuelos asociados. Puede cambiar su estado a INACTIVA.',
      );
    }

    return this.prisma.ruta.delete({
      where: {
        idRuta,
      },
      include: {
        aerolineaRuta: {
          select: this.seleccionAerolinea,
        },
        aeropuertoOrigenRuta: {
          select: this.seleccionAeropuerto,
        },
        aeropuertoDestinoRuta: {
          select: this.seleccionAeropuerto,
        },
      },
    });
  }
}
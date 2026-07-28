/* saas-backend/src/rutas/rutas.service.ts */
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { EstadoAerolinea, EstadoAeropuerto, } from '../generated/prisma/enums';
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
    const rutaExistente =
      await this.prisma.ruta.findFirst({
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
    const rutaExistente =
      await this.prisma.ruta.findFirst({
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

  async create(createRutaDto: CreateRutaDto) {
    await this.verificarAerolineaOperativa(
      createRutaDto.fkAerolineaRuta,
    );

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
      createRutaDto.fkAerolineaRuta,
      createRutaDto.codigoRuta,
    );

    await this.verificarTrayectoUnico(
      createRutaDto.fkAerolineaRuta,
      createRutaDto.fkAeropuertoOrigenRuta,
      createRutaDto.fkAeropuertoDestinoRuta,
    );

    return this.prisma.ruta.create({
      data: createRutaDto,
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

  async findAll() {
    return this.prisma.ruta.findMany({
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

  async findOne(idRuta: number) {
    const rutaEncontrada =
      await this.prisma.ruta.findUnique({
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

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta con el ID ${idRuta}`,
      );
    }

    return rutaEncontrada;
  }

  async update(
    idRuta: number,
    updateRutaDto: UpdateRutaDto,
  ) {
    const rutaActual =
      await this.prisma.ruta.findUnique({
        where: {
          idRuta,
        },
      });

    if (!rutaActual) {
      throw new NotFoundException(
        `No se encontró una ruta con el ID ${idRuta}`,
      );
    }

    const idAerolineaFinal =
      updateRutaDto.fkAerolineaRuta ??
      rutaActual.fkAerolineaRuta;

    const idAeropuertoOrigenFinal =
      updateRutaDto.fkAeropuertoOrigenRuta ??
      rutaActual.fkAeropuertoOrigenRuta;

    const idAeropuertoDestinoFinal =
      updateRutaDto.fkAeropuertoDestinoRuta ??
      rutaActual.fkAeropuertoDestinoRuta;

    const codigoRutaFinal =
      updateRutaDto.codigoRuta ??
      rutaActual.codigoRuta;

    const modificaRelacionPrincipal =
      idAerolineaFinal !==
      rutaActual.fkAerolineaRuta ||
      idAeropuertoOrigenFinal !==
      rutaActual.fkAeropuertoOrigenRuta ||
      idAeropuertoDestinoFinal !==
      rutaActual.fkAeropuertoDestinoRuta;

    if (modificaRelacionPrincipal) {
      const cantidadVuelos =
        await this.prisma.vuelo.count({
          where: {
            fkRutaVuelo: idRuta,
          },
        });

      if (cantidadVuelos > 0) {
        throw new ConflictException(
          'No se puede cambiar la aerolínea, el origen o el destino porque la ruta tiene vuelos asociados',
        );
      }
    }

    await this.verificarAerolineaOperativa(
      idAerolineaFinal,
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
      idAerolineaFinal,
      codigoRutaFinal,
      idRuta,
    );

    await this.verificarTrayectoUnico(
      idAerolineaFinal,
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

  async remove(idRuta: number) {
    const rutaEncontrada =
      await this.prisma.ruta.findUnique({
        where: {
          idRuta,
        },
      });

    if (!rutaEncontrada) {
      throw new NotFoundException(
        `No se encontró una ruta con el ID ${idRuta}`,
      );
    }

    const cantidadVuelos =
      await this.prisma.vuelo.count({
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
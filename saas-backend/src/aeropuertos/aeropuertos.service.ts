/* saas-backend/src/aeropuertos/aeropuertos.service.ts */
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAeropuertoDto } from './dto/create-aeropuerto.dto';
import { UpdateAeropuertoDto } from './dto/update-aeropuerto.dto';

@Injectable()
export class AeropuertosService {
  constructor(private readonly prisma: PrismaService) { }

  private async verificarCodigoIataUnico(
    codigoIataAeropuerto: string,
    idAeropuertoExcluir?: number,
  ): Promise<void> {
    const aeropuertoExistente =
      await this.prisma.aeropuerto.findFirst({
        where: {
          codigoIataAeropuerto,
          ...(idAeropuertoExcluir !== undefined
            ? {
              NOT: {
                idAeropuerto: idAeropuertoExcluir,
              },
            }
            : {}),
        },
      });

    if (aeropuertoExistente) {
      throw new ConflictException(
        `Ya existe un aeropuerto con el código IATA "${codigoIataAeropuerto}"`,
      );
    }
  }

  private async verificarCodigoIcaoUnico(
    codigoIcaoAeropuerto: string,
    idAeropuertoExcluir?: number,
  ): Promise<void> {
    const aeropuertoExistente =
      await this.prisma.aeropuerto.findFirst({
        where: {
          codigoIcaoAeropuerto,
          ...(idAeropuertoExcluir !== undefined
            ? {
              NOT: {
                idAeropuerto: idAeropuertoExcluir,
              },
            }
            : {}),
        },
      });

    if (aeropuertoExistente) {
      throw new ConflictException(
        `Ya existe un aeropuerto con el código ICAO "${codigoIcaoAeropuerto}"`,
      );
    }
  }

  async create(
    createAeropuertoDto: CreateAeropuertoDto,
  ) {
    await this.verificarCodigoIataUnico(
      createAeropuertoDto.codigoIataAeropuerto,
    );

    await this.verificarCodigoIcaoUnico(
      createAeropuertoDto.codigoIcaoAeropuerto,
    );

    return this.prisma.aeropuerto.create({
      data: createAeropuertoDto,
    });
  }

  async findAll() {
    return this.prisma.aeropuerto.findMany({
      orderBy: {
        codigoIataAeropuerto: 'asc',
      },
    });
  }

  async findOne(idAeropuerto: number) {
    const aeropuertoEncontrado =
      await this.prisma.aeropuerto.findUnique({
        where: {
          idAeropuerto,
        },
      });

    if (!aeropuertoEncontrado) {
      throw new NotFoundException(
        `No se encontró un aeropuerto con el ID ${idAeropuerto}`,
      );
    }

    return aeropuertoEncontrado;
  }

  async update(
    idAeropuerto: number,
    updateAeropuertoDto: UpdateAeropuertoDto,
  ) {
    const aeropuertoActual =
      await this.prisma.aeropuerto.findUnique({
        where: {
          idAeropuerto,
        },
      });

    if (!aeropuertoActual) {
      throw new NotFoundException(
        `No se encontró un aeropuerto con el ID ${idAeropuerto}`,
      );
    }

    const codigoIataFinal =
      updateAeropuertoDto.codigoIataAeropuerto ??
      aeropuertoActual.codigoIataAeropuerto;

    const codigoIcaoFinal =
      updateAeropuertoDto.codigoIcaoAeropuerto ??
      aeropuertoActual.codigoIcaoAeropuerto;

    await this.verificarCodigoIataUnico(
      codigoIataFinal,
      idAeropuerto,
    );

    await this.verificarCodigoIcaoUnico(
      codigoIcaoFinal,
      idAeropuerto,
    );

    return this.prisma.aeropuerto.update({
      where: {
        idAeropuerto,
      },
      data: updateAeropuertoDto,
    });
  }

  async remove(idAeropuerto: number) {
    const aeropuertoEncontrado =
      await this.prisma.aeropuerto.findUnique({
        where: {
          idAeropuerto,
        },
        select: {
          idAeropuerto: true,
          codigoIataAeropuerto: true,
          codigoIcaoAeropuerto: true,
          nombreAeropuerto: true,
          ciudadAeropuerto: true,
          paisAeropuerto: true,
          zonaHorariaAeropuerto: true,
          estadoAeropuerto: true,
          fechaCreacionAeropuerto: true,
          fechaActualizacionAeropuerto: true,
          _count: {
            select: {
              rutasOrigenAeropuerto: true,
              rutasDestinoAeropuerto: true,
            },
          },
        },
      });

    if (!aeropuertoEncontrado) {
      throw new NotFoundException(
        `No se encontró un aeropuerto con el ID ${idAeropuerto}`,
      );
    }

    const cantidadRutas =
      aeropuertoEncontrado._count
        .rutasOrigenAeropuerto +
      aeropuertoEncontrado._count
        .rutasDestinoAeropuerto;

    if (cantidadRutas > 0) {
      throw new ConflictException(
        'No se puede eliminar el aeropuerto porque está asociado a una o más rutas. Puede cambiar su estado a INACTIVO.',
      );
    }

    return this.prisma.aeropuerto.delete({
      where: {
        idAeropuerto,
      },
    });
  }
}
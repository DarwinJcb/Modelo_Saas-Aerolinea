/* saas-backend/src/aerolineas/aerolineas.service.ts */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAerolineaDto } from './dto/create-aerolinea.dto';
import { UpdateAerolineaDto } from './dto/update-aerolinea.dto';

@Injectable()
export class AerolineasService {
  constructor(private readonly prisma: PrismaService) {}

  private async verificarCampoUnico(
    condicion: Prisma.AerolineaWhereInput,
    mensajeError: string,
    idAerolineaExcluir?: number,
  ): Promise<void> {
    const aerolineaExistente = await this.prisma.aerolinea.findFirst({
      where: {
        ...condicion,
        ...(idAerolineaExcluir !== undefined
          ? {
              NOT: {
                idAerolinea: idAerolineaExcluir,
              },
            }
          : {}),
      },
    });

    if (aerolineaExistente) {
      throw new ConflictException(mensajeError);
    }
  }

  private async verificarCamposUnicos(
    datosAerolinea: CreateAerolineaDto | UpdateAerolineaDto,
    idAerolineaExcluir?: number,
  ): Promise<void> {
    if (datosAerolinea.rucAerolinea) {
      await this.verificarCampoUnico(
        {
          rucAerolinea: datosAerolinea.rucAerolinea,
        },
        `Ya existe una aerolínea con el RUC "${datosAerolinea.rucAerolinea}"`,
        idAerolineaExcluir,
      );
    }

    if (datosAerolinea.codigoIataAerolinea) {
      await this.verificarCampoUnico(
        {
          codigoIataAerolinea: datosAerolinea.codigoIataAerolinea,
        },
        `Ya existe una aerolínea con el código IATA "${datosAerolinea.codigoIataAerolinea}"`,
        idAerolineaExcluir,
      );
    }

    if (datosAerolinea.codigoIcaoAerolinea) {
      await this.verificarCampoUnico(
        {
          codigoIcaoAerolinea: datosAerolinea.codigoIcaoAerolinea,
        },
        `Ya existe una aerolínea con el código ICAO "${datosAerolinea.codigoIcaoAerolinea}"`,
        idAerolineaExcluir,
      );
    }

    if (datosAerolinea.correoAerolinea) {
      await this.verificarCampoUnico(
        {
          correoAerolinea: datosAerolinea.correoAerolinea,
        },
        `Ya existe una aerolínea con el correo "${datosAerolinea.correoAerolinea}"`,
        idAerolineaExcluir,
      );
    }
  }

  async create(createAerolineaDto: CreateAerolineaDto) {
    await this.verificarCamposUnicos(createAerolineaDto);

    return this.prisma.aerolinea.create({
      data: createAerolineaDto,
    });
  }

  async findAll() {
    return this.prisma.aerolinea.findMany({
      orderBy: {
        idAerolinea: 'asc',
      },
    });
  }

  async findOne(idAerolinea: number) {
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

    return aerolineaEncontrada;
  }

  async update(idAerolinea: number, updateAerolineaDto: UpdateAerolineaDto) {
    await this.findOne(idAerolinea);

    await this.verificarCamposUnicos(updateAerolineaDto, idAerolinea);

    return this.prisma.aerolinea.update({
      where: {
        idAerolinea,
      },
      data: updateAerolineaDto,
    });
  }

  async remove(idAerolinea: number) {
    await this.findOne(idAerolinea);

    const relacionesAerolinea = await this.prisma.aerolinea.findUnique({
      where: {
        idAerolinea,
      },
      select: {
        _count: {
          select: {
            suscripcionesAerolinea: true,
            usuariosAerolinea: true,
            avionesAerolinea: true,
            rutasAerolinea: true,
            vuelosAerolinea: true,
            pasajerosAerolinea: true,
            reservasAerolinea: true,
            boletosAerolinea: true,
          },
        },
      },
    });

    const cantidadRelaciones = Object.values(
      relacionesAerolinea?._count ?? {},
    ).reduce((total, cantidad) => total + cantidad, 0);

    if (cantidadRelaciones > 0) {
      throw new ConflictException(
        'No se puede eliminar la aerolínea porque tiene información asociada. Puede cambiar su estado a INACTIVA.',
      );
    }

    return this.prisma.aerolinea.delete({
      where: {
        idAerolinea,
      },
    });
  }
}

/* saas-backend/src/pasajeros/pasajeros.service.ts */
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { EstadoAerolinea } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';
import { UpdatePasajeroDto } from './dto/update-pasajero.dto';

@Injectable()
export class PasajerosService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly seleccionAerolinea = {
    idAerolinea: true,
    nombreComercialAerolinea: true,
    codigoIataAerolinea: true,
    correoAerolinea: true,
    estadoAerolinea: true,
  } as const;

  private async verificarAerolineaOperativa(
    idAerolinea: number,
  ): Promise<void> {
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

    if (aerolineaEncontrada.estadoAerolinea !== EstadoAerolinea.ACTIVA) {
      throw new ConflictException(
        'La aerolínea debe estar ACTIVA para gestionar pasajeros',
      );
    }
  }

  private validarFechaNacimiento(fechaNacimientoPasajero: Date): void {
    const fechaActual = new Date();

    if (fechaNacimientoPasajero > fechaActual) {
      throw new BadRequestException(
        'La fecha de nacimiento del pasajero no puede ser posterior a la fecha actual',
      );
    }
  }

  private async verificarDocumentoUnico(
    idAerolinea: number,
    tipoDocumentoPasajero: CreatePasajeroDto['tipoDocumentoPasajero'],
    numeroDocumentoPasajero: string,
    idPasajeroExcluir?: number,
  ): Promise<void> {
    const pasajeroExistente = await this.prisma.pasajero.findFirst({
      where: {
        fkAerolineaPasajero: idAerolinea,
        tipoDocumentoPasajero,
        numeroDocumentoPasajero,
        ...(idPasajeroExcluir !== undefined
          ? {
            NOT: {
              idPasajero: idPasajeroExcluir,
            },
          }
          : {}),
      },
    });

    if (pasajeroExistente) {
      throw new ConflictException(
        'La aerolínea ya tiene un pasajero registrado con el mismo tipo y número de documento',
      );
    }
  }

  async create(createPasajeroDto: CreatePasajeroDto) {
    await this.verificarAerolineaOperativa(
      createPasajeroDto.fkAerolineaPasajero,
    );

    this.validarFechaNacimiento(createPasajeroDto.fechaNacimientoPasajero);

    await this.verificarDocumentoUnico(
      createPasajeroDto.fkAerolineaPasajero,
      createPasajeroDto.tipoDocumentoPasajero,
      createPasajeroDto.numeroDocumentoPasajero,
    );

    return this.prisma.pasajero.create({
      data: createPasajeroDto,
      include: {
        aerolineaPasajero: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async findAll() {
    return this.prisma.pasajero.findMany({
      include: {
        aerolineaPasajero: {
          select: this.seleccionAerolinea,
        },
      },
      orderBy: {
        idPasajero: 'asc',
      },
    });
  }

  async findOne(idPasajero: number) {
    const pasajeroEncontrado = await this.prisma.pasajero.findUnique({
      where: {
        idPasajero,
      },
      include: {
        aerolineaPasajero: {
          select: this.seleccionAerolinea,
        },
      },
    });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero con el ID ${idPasajero}`,
      );
    }

    return pasajeroEncontrado;
  }

  async update(idPasajero: number, updatePasajeroDto: UpdatePasajeroDto) {
    const pasajeroActual = await this.prisma.pasajero.findUnique({
      where: {
        idPasajero,
      },
    });

    if (!pasajeroActual) {
      throw new NotFoundException(
        `No se encontró un pasajero con el ID ${idPasajero}`,
      );
    }

    const idAerolineaFinal =
      updatePasajeroDto.fkAerolineaPasajero ??
      pasajeroActual.fkAerolineaPasajero;

    const tipoDocumentoFinal =
      updatePasajeroDto.tipoDocumentoPasajero ??
      pasajeroActual.tipoDocumentoPasajero;

    const numeroDocumentoFinal =
      updatePasajeroDto.numeroDocumentoPasajero ??
      pasajeroActual.numeroDocumentoPasajero;

    const fechaNacimientoFinal =
      updatePasajeroDto.fechaNacimientoPasajero ??
      pasajeroActual.fechaNacimientoPasajero;

    const cambiaAerolinea =
      idAerolineaFinal !== pasajeroActual.fkAerolineaPasajero;

    if (cambiaAerolinea) {
      const cantidadReservas = await this.prisma.reserva.count({
        where: {
          fkPasajeroReserva: idPasajero,
        },
      });

      if (cantidadReservas > 0) {
        throw new ConflictException(
          'No se puede cambiar la aerolínea del pasajero porque tiene reservas asociadas',
        );
      }
    }

    await this.verificarAerolineaOperativa(idAerolineaFinal);

    this.validarFechaNacimiento(fechaNacimientoFinal);

    await this.verificarDocumentoUnico(
      idAerolineaFinal,
      tipoDocumentoFinal,
      numeroDocumentoFinal,
      idPasajero,
    );

    return this.prisma.pasajero.update({
      where: {
        idPasajero,
      },
      data: updatePasajeroDto,
      include: {
        aerolineaPasajero: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }

  async remove(idPasajero: number) {
    const pasajeroEncontrado = await this.prisma.pasajero.findUnique({
      where: {
        idPasajero,
      },
    });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero con el ID ${idPasajero}`,
      );
    }

    const cantidadReservas = await this.prisma.reserva.count({
      where: {
        fkPasajeroReserva: idPasajero,
      },
    });

    if (cantidadReservas > 0) {
      throw new ConflictException(
        'No se puede eliminar el pasajero porque tiene reservas asociadas',
      );
    }

    return this.prisma.pasajero.delete({
      where: {
        idPasajero,
      },
      include: {
        aerolineaPasajero: {
          select: this.seleccionAerolinea,
        },
      },
    });
  }
}

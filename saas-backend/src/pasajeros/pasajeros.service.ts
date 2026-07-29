/* saas-backend/src/pasajeros/pasajeros.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, RolUsuario, } from '../generated/prisma/enums';
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
    createPasajeroDto: CreatePasajeroDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createPasajeroDto.fkAerolineaPasajero === undefined ||
        createPasajeroDto.fkAerolineaPasajero === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria del pasajero',
        );
      }

      return createPasajeroDto.fkAerolineaPasajero;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createPasajeroDto.fkAerolineaPasajero !== undefined &&
      createPasajeroDto.fkAerolineaPasajero !== null &&
      createPasajeroDto.fkAerolineaPasajero !==
      idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede registrar pasajeros para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idPasajero: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idPasajero,
      };
    }

    return {
      idPasajero,
      fkAerolineaPasajero:
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
        'La aerolínea debe estar ACTIVA para gestionar pasajeros',
      );
    }
  }

  private validarFechaNacimiento(
    fechaNacimientoPasajero: Date,
  ): void {
    const fechaActual = new Date();

    if (fechaNacimientoPasajero > fechaActual) {
      throw new BadRequestException(
        'La fecha de nacimiento del pasajero no puede ser posterior a la fecha actual',
      );
    }
  }

  private async verificarDocumentoUnico(
    idAerolinea: number,
    tipoDocumentoPasajero:
      CreatePasajeroDto['tipoDocumentoPasajero'],
    numeroDocumentoPasajero: string,
    idPasajeroExcluir?: number,
  ): Promise<void> {
    const pasajeroExistente =
      await this.prisma.pasajero.findFirst({
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

  async create(
    createPasajeroDto: CreatePasajeroDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createPasajeroDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);

    this.validarFechaNacimiento(
      createPasajeroDto.fechaNacimientoPasajero,
    );

    await this.verificarDocumentoUnico(
      idAerolinea,
      createPasajeroDto.tipoDocumentoPasajero,
      createPasajeroDto.numeroDocumentoPasajero,
    );

    return this.prisma.pasajero.create({
      data: {
        ...createPasajeroDto,
        fkAerolineaPasajero: idAerolinea,
      },
      include: {
        aerolineaPasajero: {
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
          fkAerolineaPasajero:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.pasajero.findMany({
      where: filtroAerolinea,
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

  async findOne(
    idPasajero: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const pasajeroEncontrado =
      await this.prisma.pasajero.findFirst({
        where: this.construirFiltroAcceso(
          idPasajero,
          usuarioActual,
        ),
        include: {
          aerolineaPasajero: {
            select: this.seleccionAerolinea,
          },
        },
      });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero accesible con el ID ${idPasajero}`,
      );
    }

    return pasajeroEncontrado;
  }

  async update(
    idPasajero: number,
    updatePasajeroDto: UpdatePasajeroDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const pasajeroActual =
      await this.prisma.pasajero.findFirst({
        where: this.construirFiltroAcceso(
          idPasajero,
          usuarioActual,
        ),
      });

    if (!pasajeroActual) {
      throw new NotFoundException(
        `No se encontró un pasajero accesible con el ID ${idPasajero}`,
      );
    }

    const tipoDocumentoFinal =
      updatePasajeroDto.tipoDocumentoPasajero ??
      pasajeroActual.tipoDocumentoPasajero;

    const numeroDocumentoFinal =
      updatePasajeroDto.numeroDocumentoPasajero ??
      pasajeroActual.numeroDocumentoPasajero;

    const fechaNacimientoFinal =
      updatePasajeroDto.fechaNacimientoPasajero ??
      pasajeroActual.fechaNacimientoPasajero;

    await this.verificarAerolineaOperativa(
      pasajeroActual.fkAerolineaPasajero,
    );

    this.validarFechaNacimiento(fechaNacimientoFinal);

    await this.verificarDocumentoUnico(
      pasajeroActual.fkAerolineaPasajero,
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

  async remove(
    idPasajero: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const pasajeroEncontrado =
      await this.prisma.pasajero.findFirst({
        where: this.construirFiltroAcceso(
          idPasajero,
          usuarioActual,
        ),
      });

    if (!pasajeroEncontrado) {
      throw new NotFoundException(
        `No se encontró un pasajero accesible con el ID ${idPasajero}`,
      );
    }

    const cantidadReservas =
      await this.prisma.reserva.count({
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
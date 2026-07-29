/* saas-backend/src/boletos/boletos.service.ts */
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { EstadoAerolinea, EstadoBoleto, EstadoReserva, EstadoVuelo, RolUsuario, } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';

@Injectable()
export class BoletosService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly relacionesBoleto = {
    aerolineaBoleto: {
      select: {
        idAerolinea: true,
        nombreComercialAerolinea: true,
        codigoIataAerolinea: true,
        correoAerolinea: true,
        estadoAerolinea: true,
      },
    },
    reservaBoleto: {
      select: {
        idReserva: true,
        codigoReserva: true,
        estadoReserva: true,
        totalReserva: true,
        pasajeroReserva: {
          select: {
            idPasajero: true,
            tipoDocumentoPasajero: true,
            numeroDocumentoPasajero: true,
            nombresPasajero: true,
            apellidosPasajero: true,
          },
        },
        vueloReserva: {
          select: {
            idVuelo: true,
            numeroVuelo: true,
            fechaHoraSalidaVuelo: true,
            fechaHoraLlegadaVuelo: true,
            puertaEmbarqueVuelo: true,
            estadoVuelo: true,
            rutaVuelo: {
              select: {
                idRuta: true,
                codigoRuta: true,
                aeropuertoOrigenRuta: {
                  select: {
                    idAeropuerto: true,
                    codigoIataAeropuerto: true,
                    ciudadAeropuerto: true,
                    paisAeropuerto: true,
                  },
                },
                aeropuertoDestinoRuta: {
                  select: {
                    idAeropuerto: true,
                    codigoIataAeropuerto: true,
                    ciudadAeropuerto: true,
                    paisAeropuerto: true,
                  },
                },
              },
            },
          },
        },
      },
    },
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
    createBoletoDto: CreateBoletoDto,
    usuarioActual: UsuarioAutenticado,
  ): number {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      if (
        createBoletoDto.fkAerolineaBoleto === undefined ||
        createBoletoDto.fkAerolineaBoleto === null
      ) {
        throw new BadRequestException(
          'El SUPERADMIN debe indicar la aerolínea propietaria del boleto',
        );
      }

      return createBoletoDto.fkAerolineaBoleto;
    }

    const idAerolineaUsuario =
      this.obtenerIdAerolineaUsuario(usuarioActual);

    if (
      createBoletoDto.fkAerolineaBoleto !== undefined &&
      createBoletoDto.fkAerolineaBoleto !== null &&
      createBoletoDto.fkAerolineaBoleto !== idAerolineaUsuario
    ) {
      throw new ForbiddenException(
        'No puede emitir boletos para otra aerolínea',
      );
    }

    return idAerolineaUsuario;
  }

  private construirFiltroAcceso(
    idBoleto: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    if (usuarioActual.rolUsuario === RolUsuario.SUPERADMIN) {
      return {
        idBoleto,
      };
    }

    return {
      idBoleto,
      fkAerolineaBoleto:
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
        'La aerolínea debe estar ACTIVA para gestionar boletos',
      );
    }
  }

  private async obtenerReservaValidaParaEmision(
    idReserva: number,
    idAerolinea: number,
  ) {
    const reservaEncontrada =
      await this.prisma.reserva.findFirst({
        where: {
          idReserva,
          fkAerolineaReserva: idAerolinea,
        },
        include: {
          boletoReserva: {
            select: {
              idBoleto: true,
            },
          },
          vueloReserva: {
            select: {
              idVuelo: true,
              fkAerolineaVuelo: true,
              estadoVuelo: true,
              fechaHoraSalidaVuelo: true,
            },
          },
          pasajeroReserva: {
            select: {
              fkAerolineaPasajero: true,
            },
          },
        },
      });

    if (!reservaEncontrada) {
      throw new NotFoundException(
        `No se encontró una reserva accesible con el ID ${idReserva}`,
      );
    }

    if (
      reservaEncontrada.vueloReserva.fkAerolineaVuelo !==
      idAerolinea
    ) {
      throw new ConflictException(
        'El vuelo relacionado con la reserva no pertenece a la misma aerolínea',
      );
    }

    if (
      reservaEncontrada.pasajeroReserva
        .fkAerolineaPasajero !== idAerolinea
    ) {
      throw new ConflictException(
        'El pasajero relacionado con la reserva no pertenece a la misma aerolínea',
      );
    }

    if (
      reservaEncontrada.estadoReserva !==
      EstadoReserva.CONFIRMADA
    ) {
      throw new ConflictException(
        'La reserva debe estar CONFIRMADA antes de emitir el boleto',
      );
    }

    const estadoVuelo =
      reservaEncontrada.vueloReserva.estadoVuelo;

    if (
      estadoVuelo !== EstadoVuelo.PROGRAMADO &&
      estadoVuelo !== EstadoVuelo.EMBARQUE
    ) {
      throw new ConflictException(
        'El vuelo debe estar PROGRAMADO o en EMBARQUE para emitir el boleto',
      );
    }

    if (
      reservaEncontrada.vueloReserva
        .fechaHoraSalidaVuelo <= new Date()
    ) {
      throw new ConflictException(
        'No se puede emitir un boleto para un vuelo cuya salida ya ocurrió',
      );
    }

    if (reservaEncontrada.boletoReserva) {
      throw new ConflictException(
        'La reserva ya tiene un boleto emitido',
      );
    }

    return reservaEncontrada;
  }

  private async verificarNumeroBoletoUnico(
    idAerolinea: number,
    numeroBoleto: string,
    idBoletoExcluir?: number,
  ): Promise<void> {
    const boletoExistente =
      await this.prisma.boleto.findFirst({
        where: {
          fkAerolineaBoleto: idAerolinea,
          numeroBoleto,
          ...(idBoletoExcluir !== undefined
            ? {
              NOT: {
                idBoleto: idBoletoExcluir,
              },
            }
            : {}),
        },
      });

    if (boletoExistente) {
      throw new ConflictException(
        `La aerolínea ya tiene un boleto con el número "${numeroBoleto}"`,
      );
    }
  }

  private async verificarAsientoDisponible(
    idVuelo: number,
    asientoBoleto: string,
    idBoletoExcluir?: number,
  ): Promise<void> {
    const boletoExistente =
      await this.prisma.boleto.findFirst({
        where: {
          asientoBoleto,
          estadoBoleto: {
            not: EstadoBoleto.CANCELADO,
          },
          reservaBoleto: {
            is: {
              fkVueloReserva: idVuelo,
            },
          },
          ...(idBoletoExcluir !== undefined
            ? {
              NOT: {
                idBoleto: idBoletoExcluir,
              },
            }
            : {}),
        },
      });

    if (boletoExistente) {
      throw new ConflictException(
        `El asiento "${asientoBoleto}" ya está ocupado en este vuelo`,
      );
    }
  }

  async create(
    createBoletoDto: CreateBoletoDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const idAerolinea =
      this.resolverIdAerolineaCreacion(
        createBoletoDto,
        usuarioActual,
      );

    await this.verificarAerolineaOperativa(idAerolinea);

    if (
      createBoletoDto.estadoBoleto !== undefined &&
      createBoletoDto.estadoBoleto !== EstadoBoleto.EMITIDO
    ) {
      throw new BadRequestException(
        'Un boleto nuevo debe crearse con estado EMITIDO',
      );
    }

    const reservaEncontrada =
      await this.obtenerReservaValidaParaEmision(
        createBoletoDto.fkReservaBoleto,
        idAerolinea,
      );

    await this.verificarNumeroBoletoUnico(
      idAerolinea,
      createBoletoDto.numeroBoleto,
    );

    await this.verificarAsientoDisponible(
      reservaEncontrada.vueloReserva.idVuelo,
      createBoletoDto.asientoBoleto,
    );

    return this.prisma.boleto.create({
      data: {
        fkAerolineaBoleto: idAerolinea,
        fkReservaBoleto: createBoletoDto.fkReservaBoleto,
        numeroBoleto: createBoletoDto.numeroBoleto,
        asientoBoleto: createBoletoDto.asientoBoleto,
        claseBoleto: createBoletoDto.claseBoleto,
        precioFinalBoleto: createBoletoDto.precioFinalBoleto,
        estadoBoleto: EstadoBoleto.EMITIDO,
      },
      include: this.relacionesBoleto,
    });
  }

  async findAll(usuarioActual: UsuarioAutenticado) {
    const filtroAerolinea =
      usuarioActual.rolUsuario === RolUsuario.SUPERADMIN
        ? undefined
        : {
          fkAerolineaBoleto:
            this.obtenerIdAerolineaUsuario(usuarioActual),
        };

    return this.prisma.boleto.findMany({
      where: filtroAerolinea,
      include: this.relacionesBoleto,
      orderBy: {
        idBoleto: 'asc',
      },
    });
  }

  async findOne(
    idBoleto: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const boletoEncontrado =
      await this.prisma.boleto.findFirst({
        where: this.construirFiltroAcceso(
          idBoleto,
          usuarioActual,
        ),
        include: this.relacionesBoleto,
      });

    if (!boletoEncontrado) {
      throw new NotFoundException(
        `No se encontró un boleto accesible con el ID ${idBoleto}`,
      );
    }

    return boletoEncontrado;
  }

  async update(
    idBoleto: number,
    updateBoletoDto: UpdateBoletoDto,
    usuarioActual: UsuarioAutenticado,
  ) {
    const boletoActual =
      await this.prisma.boleto.findFirst({
        where: this.construirFiltroAcceso(
          idBoleto,
          usuarioActual,
        ),
        include: {
          reservaBoleto: {
            select: {
              fkVueloReserva: true,
            },
          },
        },
      });

    if (!boletoActual) {
      throw new NotFoundException(
        `No se encontró un boleto accesible con el ID ${idBoleto}`,
      );
    }

    await this.verificarAerolineaOperativa(
      boletoActual.fkAerolineaBoleto,
    );

    if (
      boletoActual.estadoBoleto ===
      EstadoBoleto.UTILIZADO
    ) {
      throw new ConflictException(
        'No se puede modificar un boleto que ya fue UTILIZADO',
      );
    }

    const estadoFinal =
      updateBoletoDto.estadoBoleto ??
      boletoActual.estadoBoleto;

    if (
      boletoActual.estadoBoleto === EstadoBoleto.CANCELADO &&
      estadoFinal !== EstadoBoleto.CANCELADO
    ) {
      throw new ConflictException(
        'Un boleto CANCELADO no puede volver a activarse',
      );
    }

    const numeroBoletoFinal =
      updateBoletoDto.numeroBoleto ??
      boletoActual.numeroBoleto;

    const asientoBoletoFinal =
      updateBoletoDto.asientoBoleto ??
      boletoActual.asientoBoleto;

    await this.verificarNumeroBoletoUnico(
      boletoActual.fkAerolineaBoleto,
      numeroBoletoFinal,
      idBoleto,
    );

    if (estadoFinal !== EstadoBoleto.CANCELADO) {
      await this.verificarAsientoDisponible(
        boletoActual.reservaBoleto.fkVueloReserva,
        asientoBoletoFinal,
        idBoleto,
      );
    }

    return this.prisma.boleto.update({
      where: {
        idBoleto,
      },
      data: updateBoletoDto,
      include: this.relacionesBoleto,
    });
  }

  async remove(
    idBoleto: number,
    usuarioActual: UsuarioAutenticado,
  ) {
    const boletoEncontrado =
      await this.prisma.boleto.findFirst({
        where: this.construirFiltroAcceso(
          idBoleto,
          usuarioActual,
        ),
      });

    if (!boletoEncontrado) {
      throw new NotFoundException(
        `No se encontró un boleto accesible con el ID ${idBoleto}`,
      );
    }

    if (
      boletoEncontrado.estadoBoleto !==
      EstadoBoleto.CANCELADO
    ) {
      throw new ConflictException(
        'Solo se puede eliminar un boleto con estado CANCELADO',
      );
    }

    return this.prisma.boleto.delete({
      where: {
        idBoleto,
      },
      include: this.relacionesBoleto,
    });
  }
}
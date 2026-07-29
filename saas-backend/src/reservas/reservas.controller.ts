/* saas-backend/src/reservas/reservas.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
  ) { }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Post()
  create(
    @Body() createReservaDto: CreateReservaDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.reservasService.create(
      createReservaDto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get()
  findAll(
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.reservasService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idReserva')
  findOne(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.reservasService.findOne(
      idReserva,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Patch(':idReserva')
  update(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
    @Body() updateReservaDto: UpdateReservaDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.reservasService.update(
      idReserva,
      updateReservaDto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
  )
  @Delete(':idReserva')
  remove(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.reservasService.remove(
      idReserva,
      usuarioActual,
    );
  }
}
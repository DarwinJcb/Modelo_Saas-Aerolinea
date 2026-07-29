/* saas-backend/src/pasajeros/pasajeros.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';
import { UpdatePasajeroDto } from './dto/update-pasajero.dto';
import { PasajerosService } from './pasajeros.service';

@Controller('pasajeros')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PasajerosController {
  constructor(
    private readonly pasajerosService: PasajerosService,
  ) { }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Post()
  create(
    @Body() createPasajeroDto: CreatePasajeroDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.pasajerosService.create(
      createPasajeroDto,
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
    return this.pasajerosService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idPasajero')
  findOne(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.pasajerosService.findOne(
      idPasajero,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Patch(':idPasajero')
  update(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
    @Body() updatePasajeroDto: UpdatePasajeroDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.pasajerosService.update(
      idPasajero,
      updatePasajeroDto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
  )
  @Delete(':idPasajero')
  remove(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.pasajerosService.remove(
      idPasajero,
      usuarioActual,
    );
  }
}
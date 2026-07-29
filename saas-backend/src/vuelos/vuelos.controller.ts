/* saas-backend/src/vuelos/vuelos.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateVueloDto } from './dto/create-vuelo.dto';
import { UpdateVueloDto } from './dto/update-vuelo.dto';
import { VuelosService } from './vuelos.service';

@Controller('vuelos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VuelosController {
  constructor(private readonly vuelosService: VuelosService) { }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Post()
  create(
    @Body() createVueloDto: CreateVueloDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.vuelosService.create(
      createVueloDto,
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
    return this.vuelosService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idVuelo')
  findOne(
    @Param('idVuelo', ParseIntPipe) idVuelo: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.vuelosService.findOne(
      idVuelo,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Patch(':idVuelo')
  update(
    @Param('idVuelo', ParseIntPipe) idVuelo: number,
    @Body() updateVueloDto: UpdateVueloDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.vuelosService.update(
      idVuelo,
      updateVueloDto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
  )
  @Delete(':idVuelo')
  remove(
    @Param('idVuelo', ParseIntPipe) idVuelo: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.vuelosService.remove(
      idVuelo,
      usuarioActual,
    );
  }
}
/* saas-backend/src/rutas/rutas.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { RutasService } from './rutas.service';

@Controller('rutas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RutasController {
  constructor(private readonly rutasService: RutasService) { }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Post()
  create(
    @Body() createRutaDto: CreateRutaDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.rutasService.create(
      createRutaDto,
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
    return this.rutasService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idRuta')
  findOne(
    @Param('idRuta', ParseIntPipe) idRuta: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.rutasService.findOne(
      idRuta,
      usuarioActual,
    );
  }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Patch(':idRuta')
  update(
    @Param('idRuta', ParseIntPipe) idRuta: number,
    @Body() updateRutaDto: UpdateRutaDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.rutasService.update(
      idRuta,
      updateRutaDto,
      usuarioActual,
    );
  }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Delete(':idRuta')
  remove(
    @Param('idRuta', ParseIntPipe) idRuta: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.rutasService.remove(
      idRuta,
      usuarioActual,
    );
  }
}
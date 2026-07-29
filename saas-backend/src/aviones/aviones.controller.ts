/* saas-backend/src/aviones/aviones.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { AvionesService } from './aviones.service';
import { CreateAvionDto } from './dto/create-avion.dto';
import { UpdateAvionDto } from './dto/update-avion.dto';

@Controller('aviones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvionesController {
  constructor(private readonly avionesService: AvionesService) { }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Post()
  create(
    @Body() createAvionDto: CreateAvionDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.avionesService.create(createAvionDto, usuarioActual);
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
    return this.avionesService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idAvion')
  findOne(
    @Param('idAvion', ParseIntPipe) idAvion: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.avionesService.findOne(idAvion, usuarioActual);
  }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Patch(':idAvion')
  update(
    @Param('idAvion', ParseIntPipe) idAvion: number,
    @Body() updateAvionDto: UpdateAvionDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.avionesService.update(
      idAvion,
      updateAvionDto,
      usuarioActual,
    );
  }

  @Roles(RolUsuario.SUPERADMIN, RolUsuario.ADMIN_AEROLINEA)
  @Delete(':idAvion')
  remove(
    @Param('idAvion', ParseIntPipe) idAvion: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.avionesService.remove(idAvion, usuarioActual);
  }
}
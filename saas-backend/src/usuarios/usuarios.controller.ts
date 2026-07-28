/* saas-backend/src/usuarios/usuarios.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Roles(
  RolUsuario.SUPERADMIN,
  RolUsuario.ADMIN_AEROLINEA,
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) { }

  @Post()
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UsuarioActual()
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.usuariosService.create(
      createUsuarioDto,
      usuarioActual,
    );
  }

  @Get()
  findAll(
    @UsuarioActual()
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.usuariosService.findAll(usuarioActual);
  }

  @Get(':idUsuario')
  findOne(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
    @UsuarioActual()
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.usuariosService.findOne(
      idUsuario,
      usuarioActual,
    );
  }

  @Patch(':idUsuario')
  update(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @UsuarioActual()
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.usuariosService.update(
      idUsuario,
      updateUsuarioDto,
      usuarioActual,
    );
  }

  @Delete(':idUsuario')
  remove(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
    @UsuarioActual()
    usuarioActual: UsuarioAutenticado,
  ) {
    return this.usuariosService.remove(
      idUsuario,
      usuarioActual,
    );
  }
}
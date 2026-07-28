/* saas-backend/src/usuarios/usuarios.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':idUsuario')
  findOne(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
  ) {
    return this.usuariosService.findOne(idUsuario);
  }

  @Patch(':idUsuario')
  update(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(idUsuario, updateUsuarioDto);
  }

  @Delete(':idUsuario')
  remove(
    @Param('idUsuario', ParseIntPipe)
    idUsuario: number,
  ) {
    return this.usuariosService.remove(idUsuario);
  }
}

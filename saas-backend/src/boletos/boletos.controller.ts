/* saas-backend/src/boletos/boletos.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { UsuarioAutenticado } from '../auth/interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { BoletosService } from './boletos.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';

@Controller('boletos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoletosController {
  constructor(
    private readonly boletosService: BoletosService,
  ) { }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Post()
  create(
    @Body() createBoletoDto: CreateBoletoDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.boletosService.create(
      createBoletoDto,
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
    return this.boletosService.findAll(usuarioActual);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idBoleto')
  findOne(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.boletosService.findOne(
      idBoleto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Patch(':idBoleto')
  update(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
    @Body() updateBoletoDto: UpdateBoletoDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.boletosService.update(
      idBoleto,
      updateBoletoDto,
      usuarioActual,
    );
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
  )
  @Delete(':idBoleto')
  remove(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    return this.boletosService.remove(
      idBoleto,
      usuarioActual,
    );
  }
}
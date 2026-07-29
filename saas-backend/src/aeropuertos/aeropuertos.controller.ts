/* saas-backend/src/aeropuertos/aeropuertos.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import { AeropuertosService } from './aeropuertos.service';
import { CreateAeropuertoDto } from './dto/create-aeropuerto.dto';
import { UpdateAeropuertoDto } from './dto/update-aeropuerto.dto';

@Controller('aeropuertos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AeropuertosController {
  constructor(
    private readonly aeropuertosService: AeropuertosService,
  ) { }

  @Roles(RolUsuario.SUPERADMIN)
  @Post()
  create(
    @Body() createAeropuertoDto: CreateAeropuertoDto,
  ) {
    return this.aeropuertosService.create(createAeropuertoDto);
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get()
  findAll() {
    return this.aeropuertosService.findAll();
  }

  @Roles(
    RolUsuario.SUPERADMIN,
    RolUsuario.ADMIN_AEROLINEA,
    RolUsuario.EMPLEADO,
  )
  @Get(':idAeropuerto')
  findOne(
    @Param('idAeropuerto', ParseIntPipe)
    idAeropuerto: number,
  ) {
    return this.aeropuertosService.findOne(idAeropuerto);
  }

  @Roles(RolUsuario.SUPERADMIN)
  @Patch(':idAeropuerto')
  update(
    @Param('idAeropuerto', ParseIntPipe)
    idAeropuerto: number,
    @Body() updateAeropuertoDto: UpdateAeropuertoDto,
  ) {
    return this.aeropuertosService.update(
      idAeropuerto,
      updateAeropuertoDto,
    );
  }

  @Roles(RolUsuario.SUPERADMIN)
  @Delete(':idAeropuerto')
  remove(
    @Param('idAeropuerto', ParseIntPipe)
    idAeropuerto: number,
  ) {
    return this.aeropuertosService.remove(idAeropuerto);
  }
}
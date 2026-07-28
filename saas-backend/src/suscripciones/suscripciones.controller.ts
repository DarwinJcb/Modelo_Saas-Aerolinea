/* saas-backend/src/suscripciones/suscripciones.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { SuscripcionesService } from './suscripciones.service';

@Roles(RolUsuario.SUPERADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(
    private readonly suscripcionesService: SuscripcionesService,
  ) { }

  @Post()
  create(
    @Body()
    createSuscripcionDto: CreateSuscripcionDto,
  ) {
    return this.suscripcionesService.create(
      createSuscripcionDto,
    );
  }

  @Get()
  findAll() {
    return this.suscripcionesService.findAll();
  }

  @Get(':idSuscripcion')
  findOne(
    @Param('idSuscripcion', ParseIntPipe)
    idSuscripcion: number,
  ) {
    return this.suscripcionesService.findOne(
      idSuscripcion,
    );
  }

  @Patch(':idSuscripcion')
  update(
    @Param('idSuscripcion', ParseIntPipe)
    idSuscripcion: number,
    @Body()
    updateSuscripcionDto: UpdateSuscripcionDto,
  ) {
    return this.suscripcionesService.update(
      idSuscripcion,
      updateSuscripcionDto,
    );
  }

  @Delete(':idSuscripcion')
  remove(
    @Param('idSuscripcion', ParseIntPipe)
    idSuscripcion: number,
  ) {
    return this.suscripcionesService.remove(
      idSuscripcion,
    );
  }
}
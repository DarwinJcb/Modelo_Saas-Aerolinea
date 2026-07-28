/* saas-backend/src/suscripciones/suscripciones.controller.ts */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { SuscripcionesService } from './suscripciones.service';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Post()
  create(@Body() createSuscripcionDto: CreateSuscripcionDto) {
    return this.suscripcionesService.create(createSuscripcionDto);
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
    return this.suscripcionesService.findOne(idSuscripcion);
  }

  @Patch(':idSuscripcion')
  update(
    @Param('idSuscripcion', ParseIntPipe)
    idSuscripcion: number,
    @Body() updateSuscripcionDto: UpdateSuscripcionDto,
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
    return this.suscripcionesService.remove(idSuscripcion);
  }
}

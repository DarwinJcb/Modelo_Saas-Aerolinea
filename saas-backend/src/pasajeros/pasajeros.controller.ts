/* saas-backend/src/pasajeros/pasajeros.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';
import { UpdatePasajeroDto } from './dto/update-pasajero.dto';
import { PasajerosService } from './pasajeros.service';

@Controller('pasajeros')
export class PasajerosController {
  constructor(private readonly pasajerosService: PasajerosService) { }

  @Post()
  create(@Body() createPasajeroDto: CreatePasajeroDto) {
    return this.pasajerosService.create(createPasajeroDto);
  }

  @Get()
  findAll() {
    return this.pasajerosService.findAll();
  }

  @Get(':idPasajero')
  findOne(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
  ) {
    return this.pasajerosService.findOne(idPasajero);
  }

  @Patch(':idPasajero')
  update(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
    @Body() updatePasajeroDto: UpdatePasajeroDto,
  ) {
    return this.pasajerosService.update(idPasajero, updatePasajeroDto);
  }

  @Delete(':idPasajero')
  remove(
    @Param('idPasajero', ParseIntPipe)
    idPasajero: number,
  ) {
    return this.pasajerosService.remove(idPasajero);
  }
}

/* saas-backend/src/aeropuertos/aeropuertos.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { AeropuertosService } from './aeropuertos.service';
import { CreateAeropuertoDto } from './dto/create-aeropuerto.dto';
import { UpdateAeropuertoDto } from './dto/update-aeropuerto.dto';

@Controller('aeropuertos')
export class AeropuertosController {
  constructor(
    private readonly aeropuertosService: AeropuertosService,
  ) { }

  @Post()
  create(
    @Body() createAeropuertoDto: CreateAeropuertoDto,
  ) {
    return this.aeropuertosService.create(
      createAeropuertoDto,
    );
  }

  @Get()
  findAll() {
    return this.aeropuertosService.findAll();
  }

  @Get(':idAeropuerto')
  findOne(
    @Param('idAeropuerto', ParseIntPipe)
    idAeropuerto: number,
  ) {
    return this.aeropuertosService.findOne(
      idAeropuerto,
    );
  }

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

  @Delete(':idAeropuerto')
  remove(
    @Param('idAeropuerto', ParseIntPipe)
    idAeropuerto: number,
  ) {
    return this.aeropuertosService.remove(
      idAeropuerto,
    );
  }
}
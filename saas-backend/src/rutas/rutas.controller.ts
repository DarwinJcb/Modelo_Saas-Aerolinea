/* saas-backend/src/rutas/rutas.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { RutasService } from './rutas.service';

@Controller('rutas')
export class RutasController {
  constructor(
    private readonly rutasService: RutasService,
  ) { }

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get(':idRuta')
  findOne(
    @Param('idRuta', ParseIntPipe)
    idRuta: number,
  ) {
    return this.rutasService.findOne(idRuta);
  }

  @Patch(':idRuta')
  update(
    @Param('idRuta', ParseIntPipe)
    idRuta: number,
    @Body() updateRutaDto: UpdateRutaDto,
  ) {
    return this.rutasService.update(
      idRuta,
      updateRutaDto,
    );
  }

  @Delete(':idRuta')
  remove(
    @Param('idRuta', ParseIntPipe)
    idRuta: number,
  ) {
    return this.rutasService.remove(idRuta);
  }
}
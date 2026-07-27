/* saas-backend/src/aeropuertos/aeropuertos.controller.ts */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AeropuertosService } from './aeropuertos.service';
import { CreateAeropuertoDto } from './dto/create-aeropuerto.dto';
import { UpdateAeropuertoDto } from './dto/update-aeropuerto.dto';

@Controller('aeropuertos')
export class AeropuertosController {
  constructor(private readonly aeropuertosService: AeropuertosService) { }

  @Post()
  create(@Body() createAeropuertoDto: CreateAeropuertoDto) {
    return this.aeropuertosService.create(createAeropuertoDto);
  }

  @Get()
  findAll() {
    return this.aeropuertosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aeropuertosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAeropuertoDto: UpdateAeropuertoDto) {
    return this.aeropuertosService.update(+id, updateAeropuertoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aeropuertosService.remove(+id);
  }
}

/* saas-backend/src/vuelos/vuelos.controller.ts */
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
import { CreateVueloDto } from './dto/create-vuelo.dto';
import { UpdateVueloDto } from './dto/update-vuelo.dto';
import { VuelosService } from './vuelos.service';

@Controller('vuelos')
export class VuelosController {
  constructor(private readonly vuelosService: VuelosService) {}

  @Post()
  create(@Body() createVueloDto: CreateVueloDto) {
    return this.vuelosService.create(createVueloDto);
  }

  @Get()
  findAll() {
    return this.vuelosService.findAll();
  }

  @Get(':idVuelo')
  findOne(
    @Param('idVuelo', ParseIntPipe)
    idVuelo: number,
  ) {
    return this.vuelosService.findOne(idVuelo);
  }

  @Patch(':idVuelo')
  update(
    @Param('idVuelo', ParseIntPipe)
    idVuelo: number,
    @Body() updateVueloDto: UpdateVueloDto,
  ) {
    return this.vuelosService.update(idVuelo, updateVueloDto);
  }

  @Delete(':idVuelo')
  remove(
    @Param('idVuelo', ParseIntPipe)
    idVuelo: number,
  ) {
    return this.vuelosService.remove(idVuelo);
  }
}

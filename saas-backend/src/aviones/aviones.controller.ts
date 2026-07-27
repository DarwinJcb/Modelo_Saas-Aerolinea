/* saas-backend/src/aviones/aviones.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { AvionesService } from './aviones.service';
import { CreateAvionDto } from './dto/create-avion.dto';
import { UpdateAvionDto } from './dto/update-avion.dto';

@Controller('aviones')
export class AvionesController {
  constructor(
    private readonly avionesService: AvionesService,
  ) { }

  @Post()
  create(@Body() createAvionDto: CreateAvionDto) {
    return this.avionesService.create(createAvionDto);
  }

  @Get()
  findAll() {
    return this.avionesService.findAll();
  }

  @Get(':idAvion')
  findOne(
    @Param('idAvion', ParseIntPipe)
    idAvion: number,
  ) {
    return this.avionesService.findOne(idAvion);
  }

  @Patch(':idAvion')
  update(
    @Param('idAvion', ParseIntPipe)
    idAvion: number,
    @Body() updateAvionDto: UpdateAvionDto,
  ) {
    return this.avionesService.update(
      idAvion,
      updateAvionDto,
    );
  }

  @Delete(':idAvion')
  remove(
    @Param('idAvion', ParseIntPipe)
    idAvion: number,
  ) {
    return this.avionesService.remove(idAvion);
  }
}
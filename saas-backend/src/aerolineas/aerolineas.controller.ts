/* saas-backend/src/aerolineas/aerolineas.controller.ts */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AerolineasService } from './aerolineas.service';
import { CreateAerolineaDto } from './dto/create-aerolinea.dto';
import { UpdateAerolineaDto } from './dto/update-aerolinea.dto';

@Controller('aerolineas')
export class AerolineasController {
  constructor(private readonly aerolineasService: AerolineasService) {}

  @Post()
  create(@Body() createAerolineaDto: CreateAerolineaDto) {
    return this.aerolineasService.create(createAerolineaDto);
  }

  @Get()
  findAll() {
    return this.aerolineasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aerolineasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAerolineaDto: UpdateAerolineaDto) {
    return this.aerolineasService.update(+id, updateAerolineaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aerolineasService.remove(+id);
  }
}

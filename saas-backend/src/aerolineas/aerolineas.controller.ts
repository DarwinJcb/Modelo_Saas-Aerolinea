/* saas-backend/src/aerolineas/aerolineas.controller.ts */
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

  @Get(':idAerolinea')
  findOne(@Param('idAerolinea', ParseIntPipe) idAerolinea: number) {
    return this.aerolineasService.findOne(idAerolinea);
  }

  @Patch(':idAerolinea')
  update(
    @Param('idAerolinea', ParseIntPipe) idAerolinea: number,
    @Body() updateAerolineaDto: UpdateAerolineaDto,
  ) {
    return this.aerolineasService.update(idAerolinea, updateAerolineaDto);
  }

  @Delete(':idAerolinea')
  remove(@Param('idAerolinea', ParseIntPipe) idAerolinea: number) {
    return this.aerolineasService.remove(idAerolinea);
  }
}

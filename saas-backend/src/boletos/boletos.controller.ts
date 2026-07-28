/* saas-backend/src/boletos/boletos.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { BoletosService } from './boletos.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';

@Controller('boletos')
export class BoletosController {
  constructor(
    private readonly boletosService: BoletosService,
  ) { }

  @Post()
  create(@Body() createBoletoDto: CreateBoletoDto) {
    return this.boletosService.create(createBoletoDto);
  }

  @Get()
  findAll() {
    return this.boletosService.findAll();
  }

  @Get(':idBoleto')
  findOne(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
  ) {
    return this.boletosService.findOne(idBoleto);
  }

  @Patch(':idBoleto')
  update(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
    @Body() updateBoletoDto: UpdateBoletoDto,
  ) {
    return this.boletosService.update(
      idBoleto,
      updateBoletoDto,
    );
  }

  @Delete(':idBoleto')
  remove(
    @Param('idBoleto', ParseIntPipe)
    idBoleto: number,
  ) {
    return this.boletosService.remove(idBoleto);
  }
}
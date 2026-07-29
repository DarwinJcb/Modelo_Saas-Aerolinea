/* saas-backend/src/reservas/reservas.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) { }

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservasService.findAll();
  }

  @Get(':idReserva')
  findOne(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
  ) {
    return this.reservasService.findOne(idReserva);
  }

  @Patch(':idReserva')
  update(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(idReserva, updateReservaDto);
  }

  @Delete(':idReserva')
  remove(
    @Param('idReserva', ParseIntPipe)
    idReserva: number,
  ) {
    return this.reservasService.remove(idReserva);
  }
}

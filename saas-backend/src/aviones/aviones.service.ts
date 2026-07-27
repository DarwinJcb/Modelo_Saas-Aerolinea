/* saas-backend/src/aviones/aviones.service.ts */
import { Injectable } from '@nestjs/common';
import { CreateAvionDto } from './dto/create-avion.dto';
import { UpdateAvionDto } from './dto/update-avion.dto';

@Injectable()
export class AvionesService {
  create(createAvioneDto: CreateAvionDto) {
    return 'This action adds a new avion';
  }

  findAll() {
    return `This action returns all aviones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} avion`;
  }

  update(id: number, updateAvionDto: UpdateAvionDto) {
    return `This action updates a #${id} avion`;
  }

  remove(id: number) {
    return `This action removes a #${id} avion`;
  }
}

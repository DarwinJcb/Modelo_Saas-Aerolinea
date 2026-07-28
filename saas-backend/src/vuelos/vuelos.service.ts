/* saas-backend/src/vuelos/vuelos.service.ts */
import { Injectable } from '@nestjs/common';
import { CreateVueloDto } from './dto/create-vuelo.dto';
import { UpdateVueloDto } from './dto/update-vuelo.dto';

@Injectable()
export class VuelosService {
  create(createVueloDto: CreateVueloDto) {
    return 'This action adds a new vuelo';
  }

  findAll() {
    return `This action returns all vuelos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vuelo`;
  }

  update(id: number, updateVueloDto: UpdateVueloDto) {
    return `This action updates a #${id} vuelo`;
  }

  remove(id: number) {
    return `This action removes a #${id} vuelo`;
  }
}

/* saas-backend/src/aeropuertos/aeropuertos.service.ts */
import { Injectable } from '@nestjs/common';
import { CreateAeropuertoDto } from './dto/create-aeropuerto.dto';
import { UpdateAeropuertoDto } from './dto/update-aeropuerto.dto';

@Injectable()
export class AeropuertosService {
  create(createAeropuertoDto: CreateAeropuertoDto) {
    return 'This action adds a new aeropuerto';
  }

  findAll() {
    return `This action returns all aeropuertos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aeropuerto`;
  }

  update(id: number, updateAeropuertoDto: UpdateAeropuertoDto) {
    return `This action updates a #${id} aeropuerto`;
  }

  remove(id: number) {
    return `This action removes a #${id} aeropuerto`;
  }
}

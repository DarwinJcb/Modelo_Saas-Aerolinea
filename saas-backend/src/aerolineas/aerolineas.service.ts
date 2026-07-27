/* saas-backend/src/aerolineas/aerolineas.service.ts */
import { Injectable } from '@nestjs/common';
import { CreateAerolineaDto } from './dto/create-aerolinea.dto';
import { UpdateAerolineaDto } from './dto/update-aerolinea.dto';

@Injectable()
export class AerolineasService {
  create(createAerolineaDto: CreateAerolineaDto) {
    return 'This action adds a new aerolinea';
  }

  findAll() {
    return `This action returns all aerolineas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aerolinea`;
  }

  update(id: number, updateAerolineaDto: UpdateAerolineaDto) {
    return `This action updates a #${id} aerolinea`;
  }

  remove(id: number) {
    return `This action removes a #${id} aerolinea`;
  }
}

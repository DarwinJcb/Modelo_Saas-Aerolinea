/* saas-backend/src/vuelos/vuelos.module.ts */
import { Module } from '@nestjs/common';
import { VuelosService } from './vuelos.service';
import { VuelosController } from './vuelos.controller';

@Module({
  controllers: [VuelosController],
  providers: [VuelosService],
})
export class VuelosModule {}

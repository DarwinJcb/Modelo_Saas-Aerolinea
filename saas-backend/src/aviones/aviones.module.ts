/* saas-backend/src/aviones/aviones.module.ts */
import { Module } from '@nestjs/common';
import { AvionesService } from './aviones.service';
import { AvionesController } from './aviones.controller';

@Module({
  controllers: [AvionesController],
  providers: [AvionesService],
})
export class AvionesModule { }

/* saas-backend/src/aerolineas/aerolineas.module.ts */
import { Module } from '@nestjs/common';
import { AerolineasService } from './aerolineas.service';
import { AerolineasController } from './aerolineas.controller';

@Module({
  controllers: [AerolineasController],
  providers: [AerolineasService],
})
export class AerolineasModule { }

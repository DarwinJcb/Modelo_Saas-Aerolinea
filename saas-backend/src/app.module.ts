/* saas-backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlanesModule } from './planes/planes.module';
import { AerolineasModule } from './aerolineas/aerolineas.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';

@Module({
  imports: [PrismaModule, PlanesModule, AerolineasModule, SuscripcionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

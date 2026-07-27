/* saas-backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlanesModule } from './planes/planes.module';
import { AerolineasModule } from './aerolineas/aerolineas.module';

@Module({
  imports: [PrismaModule, PlanesModule, AerolineasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

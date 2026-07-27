/* saas-backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlanesModule } from './planes/planes.module';

@Module({
  imports: [PrismaModule, PlanesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/* saas-backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlanesModule } from './planes/planes.module';
import { AerolineasModule } from './aerolineas/aerolineas.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { AvionesModule } from './aviones/aviones.module';

@Module({
  imports: [PrismaModule, PlanesModule, AerolineasModule, SuscripcionesModule, UsuariosModule, AuthModule, AvionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

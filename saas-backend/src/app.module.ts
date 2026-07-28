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
import { AeropuertosModule } from './aeropuertos/aeropuertos.module';
import { RutasModule } from './rutas/rutas.module';
import { VuelosModule } from './vuelos/vuelos.module';

@Module({
  imports: [PrismaModule, PlanesModule, AerolineasModule, SuscripcionesModule, UsuariosModule, AuthModule, AvionesModule, AeropuertosModule, RutasModule, VuelosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

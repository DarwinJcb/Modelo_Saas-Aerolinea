/* saas-backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { AerolineasModule } from './aerolineas/aerolineas.module';
import { AeropuertosModule } from './aeropuertos/aeropuertos.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvionesModule } from './aviones/aviones.module';
import { BoletosModule } from './boletos/boletos.module';
import { PasajerosModule } from './pasajeros/pasajeros.module';
import { PlanesModule } from './planes/planes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservasModule } from './reservas/reservas.module';
import { RutasModule } from './rutas/rutas.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VuelosModule } from './vuelos/vuelos.module';

@Module({
  imports: [
    PrismaModule,
    PlanesModule,
    AerolineasModule,
    SuscripcionesModule,
    UsuariosModule,
    AuthModule,
    AvionesModule,
    AeropuertosModule,
    RutasModule,
    VuelosModule,
    PasajerosModule,
    ReservasModule,
    BoletosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
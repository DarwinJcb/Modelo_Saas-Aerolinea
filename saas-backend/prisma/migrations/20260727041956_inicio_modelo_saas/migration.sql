-- CreateEnum
CREATE TYPE "EstadoPlan" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoAerolinea" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('PENDIENTE', 'ACTIVA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('SUPERADMIN', 'ADMIN_AEROLINEA', 'EMPLEADO');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "EstadoAvion" AS ENUM ('DISPONIBLE', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "EstadoAeropuerto" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoRuta" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoVuelo" AS ENUM ('PROGRAMADO', 'EMBARQUE', 'EN_VUELO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA', 'PASAPORTE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ClaseBoleto" AS ENUM ('ECONOMICA', 'EJECUTIVA', 'PRIMERA_CLASE');

-- CreateEnum
CREATE TYPE "EstadoBoleto" AS ENUM ('EMITIDO', 'UTILIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Plan" (
    "idPlan" SERIAL NOT NULL,
    "nombrePlan" TEXT NOT NULL,
    "descripcionPlan" TEXT,
    "precioMensualPlan" DECIMAL(10,2) NOT NULL,
    "limiteUsuariosPlan" INTEGER NOT NULL,
    "limiteAvionesPlan" INTEGER NOT NULL,
    "limiteVuelosMensualesPlan" INTEGER NOT NULL,
    "estadoPlan" "EstadoPlan" NOT NULL DEFAULT 'ACTIVO',
    "fechaCreacionPlan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionPlan" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("idPlan")
);

-- CreateTable
CREATE TABLE "Aerolinea" (
    "idAerolinea" SERIAL NOT NULL,
    "rucAerolinea" TEXT,
    "codigoIataAerolinea" TEXT,
    "codigoIcaoAerolinea" TEXT,
    "nombreComercialAerolinea" TEXT NOT NULL,
    "razonSocialAerolinea" TEXT,
    "correoAerolinea" TEXT NOT NULL,
    "telefonoAerolinea" TEXT,
    "paisAerolinea" TEXT NOT NULL DEFAULT 'Ecuador',
    "codigoPaisAerolinea" TEXT NOT NULL DEFAULT 'EC',
    "monedaAerolinea" TEXT NOT NULL DEFAULT 'USD',
    "zonaHorariaAerolinea" TEXT NOT NULL DEFAULT 'America/Guayaquil',
    "logotipoUrlAerolinea" TEXT,
    "estadoAerolinea" "EstadoAerolinea" NOT NULL DEFAULT 'ACTIVA',
    "fechaCreacionAerolinea" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionAerolinea" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aerolinea_pkey" PRIMARY KEY ("idAerolinea")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "idSuscripcion" SERIAL NOT NULL,
    "fkPlanSuscripcion" INTEGER NOT NULL,
    "fkAerolineaSuscripcion" INTEGER NOT NULL,
    "fechaInicioSuscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinSuscripcion" TIMESTAMP(3) NOT NULL,
    "estadoSuscripcion" "EstadoSuscripcion" NOT NULL DEFAULT 'ACTIVA',
    "fechaCreacionSuscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionSuscripcion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("idSuscripcion")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "fkAerolineaUsuario" INTEGER,
    "nombresUsuario" TEXT NOT NULL,
    "apellidosUsuario" TEXT NOT NULL,
    "correoUsuario" TEXT NOT NULL,
    "contrasenaUsuario" TEXT NOT NULL,
    "rolUsuario" "RolUsuario" NOT NULL DEFAULT 'EMPLEADO',
    "estadoUsuario" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "ultimoAccesoUsuario" TIMESTAMP(3),
    "fechaCreacionUsuario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionUsuario" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Avion" (
    "idAvion" SERIAL NOT NULL,
    "fkAerolineaAvion" INTEGER NOT NULL,
    "matriculaAvion" TEXT NOT NULL,
    "codigoInternoAvion" TEXT NOT NULL,
    "modeloAvion" TEXT NOT NULL,
    "fabricanteAvion" TEXT NOT NULL,
    "capacidadAvion" INTEGER NOT NULL,
    "anioFabricacionAvion" INTEGER,
    "estadoAvion" "EstadoAvion" NOT NULL DEFAULT 'DISPONIBLE',
    "fechaCreacionAvion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionAvion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avion_pkey" PRIMARY KEY ("idAvion")
);

-- CreateTable
CREATE TABLE "Aeropuerto" (
    "idAeropuerto" SERIAL NOT NULL,
    "codigoIataAeropuerto" TEXT NOT NULL,
    "codigoIcaoAeropuerto" TEXT NOT NULL,
    "nombreAeropuerto" TEXT NOT NULL,
    "ciudadAeropuerto" TEXT NOT NULL,
    "paisAeropuerto" TEXT NOT NULL,
    "zonaHorariaAeropuerto" TEXT NOT NULL,
    "estadoAeropuerto" "EstadoAeropuerto" NOT NULL DEFAULT 'ACTIVO',
    "fechaCreacionAeropuerto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionAeropuerto" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aeropuerto_pkey" PRIMARY KEY ("idAeropuerto")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "idRuta" SERIAL NOT NULL,
    "fkAerolineaRuta" INTEGER NOT NULL,
    "fkAeropuertoOrigenRuta" INTEGER NOT NULL,
    "fkAeropuertoDestinoRuta" INTEGER NOT NULL,
    "codigoRuta" TEXT NOT NULL,
    "duracionEstimadaMinutosRuta" INTEGER NOT NULL,
    "distanciaKilometrosRuta" DECIMAL(8,2),
    "estadoRuta" "EstadoRuta" NOT NULL DEFAULT 'ACTIVA',
    "fechaCreacionRuta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionRuta" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("idRuta")
);

-- CreateTable
CREATE TABLE "Vuelo" (
    "idVuelo" SERIAL NOT NULL,
    "fkAerolineaVuelo" INTEGER NOT NULL,
    "fkRutaVuelo" INTEGER NOT NULL,
    "fkAvionVuelo" INTEGER NOT NULL,
    "numeroVuelo" TEXT NOT NULL,
    "fechaHoraSalidaVuelo" TIMESTAMP(3) NOT NULL,
    "fechaHoraLlegadaVuelo" TIMESTAMP(3) NOT NULL,
    "puertaEmbarqueVuelo" TEXT,
    "precioBaseVuelo" DECIMAL(10,2) NOT NULL,
    "estadoVuelo" "EstadoVuelo" NOT NULL DEFAULT 'PROGRAMADO',
    "fechaCreacionVuelo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionVuelo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vuelo_pkey" PRIMARY KEY ("idVuelo")
);

-- CreateTable
CREATE TABLE "Pasajero" (
    "idPasajero" SERIAL NOT NULL,
    "fkAerolineaPasajero" INTEGER NOT NULL,
    "tipoDocumentoPasajero" "TipoDocumento" NOT NULL,
    "numeroDocumentoPasajero" TEXT NOT NULL,
    "nombresPasajero" TEXT NOT NULL,
    "apellidosPasajero" TEXT NOT NULL,
    "fechaNacimientoPasajero" TIMESTAMP(3) NOT NULL,
    "nacionalidadPasajero" TEXT NOT NULL,
    "correoPasajero" TEXT,
    "telefonoPasajero" TEXT,
    "fechaCreacionPasajero" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionPasajero" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pasajero_pkey" PRIMARY KEY ("idPasajero")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "idReserva" SERIAL NOT NULL,
    "fkAerolineaReserva" INTEGER NOT NULL,
    "fkVueloReserva" INTEGER NOT NULL,
    "fkPasajeroReserva" INTEGER NOT NULL,
    "fkUsuarioRegistroReserva" INTEGER,
    "codigoReserva" TEXT NOT NULL,
    "estadoReserva" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "totalReserva" DECIMAL(10,2) NOT NULL,
    "observacionReserva" TEXT,
    "fechaCreacionReserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacionReserva" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("idReserva")
);

-- CreateTable
CREATE TABLE "Boleto" (
    "idBoleto" SERIAL NOT NULL,
    "fkAerolineaBoleto" INTEGER NOT NULL,
    "fkReservaBoleto" INTEGER NOT NULL,
    "numeroBoleto" TEXT NOT NULL,
    "asientoBoleto" TEXT NOT NULL,
    "claseBoleto" "ClaseBoleto" NOT NULL DEFAULT 'ECONOMICA',
    "precioFinalBoleto" DECIMAL(10,2) NOT NULL,
    "fechaEmisionBoleto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoBoleto" "EstadoBoleto" NOT NULL DEFAULT 'EMITIDO',
    "fechaActualizacionBoleto" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("idBoleto")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_nombrePlan_key" ON "Plan"("nombrePlan");

-- CreateIndex
CREATE UNIQUE INDEX "Aerolinea_rucAerolinea_key" ON "Aerolinea"("rucAerolinea");

-- CreateIndex
CREATE UNIQUE INDEX "Aerolinea_codigoIataAerolinea_key" ON "Aerolinea"("codigoIataAerolinea");

-- CreateIndex
CREATE UNIQUE INDEX "Aerolinea_codigoIcaoAerolinea_key" ON "Aerolinea"("codigoIcaoAerolinea");

-- CreateIndex
CREATE UNIQUE INDEX "Aerolinea_correoAerolinea_key" ON "Aerolinea"("correoAerolinea");

-- CreateIndex
CREATE INDEX "Suscripcion_fkPlanSuscripcion_idx" ON "Suscripcion"("fkPlanSuscripcion");

-- CreateIndex
CREATE INDEX "Suscripcion_fkAerolineaSuscripcion_idx" ON "Suscripcion"("fkAerolineaSuscripcion");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correoUsuario_key" ON "Usuario"("correoUsuario");

-- CreateIndex
CREATE INDEX "Usuario_fkAerolineaUsuario_idx" ON "Usuario"("fkAerolineaUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Avion_matriculaAvion_key" ON "Avion"("matriculaAvion");

-- CreateIndex
CREATE INDEX "Avion_fkAerolineaAvion_idx" ON "Avion"("fkAerolineaAvion");

-- CreateIndex
CREATE UNIQUE INDEX "Avion_fkAerolineaAvion_codigoInternoAvion_key" ON "Avion"("fkAerolineaAvion", "codigoInternoAvion");

-- CreateIndex
CREATE UNIQUE INDEX "Aeropuerto_codigoIataAeropuerto_key" ON "Aeropuerto"("codigoIataAeropuerto");

-- CreateIndex
CREATE UNIQUE INDEX "Aeropuerto_codigoIcaoAeropuerto_key" ON "Aeropuerto"("codigoIcaoAeropuerto");

-- CreateIndex
CREATE INDEX "Ruta_fkAerolineaRuta_idx" ON "Ruta"("fkAerolineaRuta");

-- CreateIndex
CREATE INDEX "Ruta_fkAeropuertoOrigenRuta_idx" ON "Ruta"("fkAeropuertoOrigenRuta");

-- CreateIndex
CREATE INDEX "Ruta_fkAeropuertoDestinoRuta_idx" ON "Ruta"("fkAeropuertoDestinoRuta");

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_fkAerolineaRuta_fkAeropuertoOrigenRuta_fkAeropuertoDes_key" ON "Ruta"("fkAerolineaRuta", "fkAeropuertoOrigenRuta", "fkAeropuertoDestinoRuta");

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_fkAerolineaRuta_codigoRuta_key" ON "Ruta"("fkAerolineaRuta", "codigoRuta");

-- CreateIndex
CREATE INDEX "Vuelo_fkAerolineaVuelo_idx" ON "Vuelo"("fkAerolineaVuelo");

-- CreateIndex
CREATE INDEX "Vuelo_fkRutaVuelo_idx" ON "Vuelo"("fkRutaVuelo");

-- CreateIndex
CREATE INDEX "Vuelo_fkAvionVuelo_idx" ON "Vuelo"("fkAvionVuelo");

-- CreateIndex
CREATE UNIQUE INDEX "Vuelo_fkAerolineaVuelo_numeroVuelo_fechaHoraSalidaVuelo_key" ON "Vuelo"("fkAerolineaVuelo", "numeroVuelo", "fechaHoraSalidaVuelo");

-- CreateIndex
CREATE INDEX "Pasajero_fkAerolineaPasajero_idx" ON "Pasajero"("fkAerolineaPasajero");

-- CreateIndex
CREATE UNIQUE INDEX "Pasajero_fkAerolineaPasajero_tipoDocumentoPasajero_numeroDo_key" ON "Pasajero"("fkAerolineaPasajero", "tipoDocumentoPasajero", "numeroDocumentoPasajero");

-- CreateIndex
CREATE INDEX "Reserva_fkAerolineaReserva_idx" ON "Reserva"("fkAerolineaReserva");

-- CreateIndex
CREATE INDEX "Reserva_fkVueloReserva_idx" ON "Reserva"("fkVueloReserva");

-- CreateIndex
CREATE INDEX "Reserva_fkPasajeroReserva_idx" ON "Reserva"("fkPasajeroReserva");

-- CreateIndex
CREATE INDEX "Reserva_fkUsuarioRegistroReserva_idx" ON "Reserva"("fkUsuarioRegistroReserva");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_fkAerolineaReserva_codigoReserva_key" ON "Reserva"("fkAerolineaReserva", "codigoReserva");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_fkVueloReserva_fkPasajeroReserva_key" ON "Reserva"("fkVueloReserva", "fkPasajeroReserva");

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_fkReservaBoleto_key" ON "Boleto"("fkReservaBoleto");

-- CreateIndex
CREATE INDEX "Boleto_fkAerolineaBoleto_idx" ON "Boleto"("fkAerolineaBoleto");

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_fkAerolineaBoleto_numeroBoleto_key" ON "Boleto"("fkAerolineaBoleto", "numeroBoleto");

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_fkPlanSuscripcion_fkey" FOREIGN KEY ("fkPlanSuscripcion") REFERENCES "Plan"("idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_fkAerolineaSuscripcion_fkey" FOREIGN KEY ("fkAerolineaSuscripcion") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_fkAerolineaUsuario_fkey" FOREIGN KEY ("fkAerolineaUsuario") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avion" ADD CONSTRAINT "Avion_fkAerolineaAvion_fkey" FOREIGN KEY ("fkAerolineaAvion") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_fkAerolineaRuta_fkey" FOREIGN KEY ("fkAerolineaRuta") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_fkAeropuertoOrigenRuta_fkey" FOREIGN KEY ("fkAeropuertoOrigenRuta") REFERENCES "Aeropuerto"("idAeropuerto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_fkAeropuertoDestinoRuta_fkey" FOREIGN KEY ("fkAeropuertoDestinoRuta") REFERENCES "Aeropuerto"("idAeropuerto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vuelo" ADD CONSTRAINT "Vuelo_fkAerolineaVuelo_fkey" FOREIGN KEY ("fkAerolineaVuelo") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vuelo" ADD CONSTRAINT "Vuelo_fkRutaVuelo_fkey" FOREIGN KEY ("fkRutaVuelo") REFERENCES "Ruta"("idRuta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vuelo" ADD CONSTRAINT "Vuelo_fkAvionVuelo_fkey" FOREIGN KEY ("fkAvionVuelo") REFERENCES "Avion"("idAvion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasajero" ADD CONSTRAINT "Pasajero_fkAerolineaPasajero_fkey" FOREIGN KEY ("fkAerolineaPasajero") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_fkAerolineaReserva_fkey" FOREIGN KEY ("fkAerolineaReserva") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_fkVueloReserva_fkey" FOREIGN KEY ("fkVueloReserva") REFERENCES "Vuelo"("idVuelo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_fkPasajeroReserva_fkey" FOREIGN KEY ("fkPasajeroReserva") REFERENCES "Pasajero"("idPasajero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_fkUsuarioRegistroReserva_fkey" FOREIGN KEY ("fkUsuarioRegistroReserva") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleto" ADD CONSTRAINT "Boleto_fkAerolineaBoleto_fkey" FOREIGN KEY ("fkAerolineaBoleto") REFERENCES "Aerolinea"("idAerolinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleto" ADD CONSTRAINT "Boleto_fkReservaBoleto_fkey" FOREIGN KEY ("fkReservaBoleto") REFERENCES "Reserva"("idReserva") ON DELETE CASCADE ON UPDATE CASCADE;

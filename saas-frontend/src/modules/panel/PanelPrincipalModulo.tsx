/* saas-frontend/src/modules/panel/PanelPrincipalModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import './PanelPrincipalModulo.css'

const API_URL = 'http://localhost:3000/api'

type RolUsuario =
    | 'SUPERADMIN'
    | 'ADMIN_AEROLINEA'
    | 'EMPLEADO'
    | string

type EstadoVuelo =
    | 'PROGRAMADO'
    | 'EMBARQUE'
    | 'EN_VUELO'
    | 'FINALIZADO'
    | 'CANCELADO'
    | string

type EstadoReserva =
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'CANCELADA'
    | string

type EstadoBoleto =
    | 'EMITIDO'
    | 'UTILIZADO'
    | 'CANCELADO'
    | string

type NombreIcono =
    | 'panel'
    | 'aerolinea'
    | 'suscripcion'
    | 'usuario'
    | 'avion'
    | 'vuelo'
    | 'pasajero'
    | 'reserva'
    | 'boleto'
    | 'actualizar'
    | 'flecha'
    | 'alerta'
    | 'calendario'
    | 'reloj'
    | 'escudo'
    | 'plan'
    | 'ruta'

interface UsuarioPanel {
    idUsuario: number
    nombresUsuario: string
    apellidosUsuario: string
    correoUsuario: string
    rolUsuario: RolUsuario
    fkAerolineaUsuario: number | null
    nombreAerolinea: string | null
}

interface PanelPrincipalModuloProps {
    token: string
    usuario: UsuarioPanel
    nombreAerolinea: string
    onSeleccionarModulo: (idModulo: string) => void
    onSesionExpirada: () => void
}

interface Aerolinea {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea?: string | null
    estadoAerolinea: string
}

interface Plan {
    idPlan: number
    nombrePlan: string
    precioMensualPlan?: number | string
    limiteUsuariosPlan?: number
    limiteAvionesPlan?: number
    limiteVuelosMensualesPlan?: number
}

interface Suscripcion {
    idSuscripcion: number
    fkPlanSuscripcion: number
    fkAerolineaSuscripcion: number
    fechaInicioSuscripcion: string
    fechaFinSuscripcion: string
    estadoSuscripcion: string
    planSuscripcion: Plan
    aerolineaSuscripcion: Aerolinea
}

interface UsuarioResumen {
    idUsuario: number
    fkAerolineaUsuario: number | null
    rolUsuario: string
    estadoUsuario: string
}

interface Avion {
    idAvion: number
    fkAerolineaAvion: number
    matriculaAvion: string
    codigoInternoAvion: string
    capacidadAvion: number
    estadoAvion: string
    aerolineaAvion?: Aerolinea
}

interface Aeropuerto {
    codigoIataAeropuerto: string
    ciudadAeropuerto: string
}

interface RutaVuelo {
    codigoRuta: string
    aeropuertoOrigenRuta: Aeropuerto
    aeropuertoDestinoRuta: Aeropuerto
}

interface Vuelo {
    idVuelo: number
    fkAerolineaVuelo: number
    numeroVuelo: string
    fechaHoraSalidaVuelo: string
    fechaHoraLlegadaVuelo: string
    puertaEmbarqueVuelo: string | null
    estadoVuelo: EstadoVuelo
    aerolineaVuelo?: Aerolinea
    rutaVuelo: RutaVuelo
}

interface Pasajero {
    idPasajero: number
    fkAerolineaPasajero: number
    nombresPasajero: string
    apellidosPasajero: string
}

interface Reserva {
    idReserva: number
    fkAerolineaReserva: number
    codigoReserva: string
    estadoReserva: EstadoReserva
    totalReserva: number | string
    aerolineaReserva?: Aerolinea
    pasajeroReserva: {
        nombresPasajero: string
        apellidosPasajero: string
    }
    vueloReserva: {
        numeroVuelo: string
        fechaHoraSalidaVuelo: string
    }
    boletoReserva?: {
        idBoleto: number
        estadoBoleto: string
    } | null
}

interface Boleto {
    idBoleto: number
    fkAerolineaBoleto: number
    numeroBoleto: string
    precioFinalBoleto: number | string
    estadoBoleto: EstadoBoleto
    aerolineaBoleto?: Aerolinea
    reservaBoleto: {
        codigoReserva: string
        vueloReserva: {
            numeroVuelo: string
            fechaHoraSalidaVuelo: string
        }
    }
}

interface DatosPanel {
    aerolineas: Aerolinea[]
    suscripciones: Suscripcion[]
    usuarios: UsuarioResumen[]
    aviones: Avion[]
    vuelos: Vuelo[]
    pasajeros: Pasajero[]
    reservas: Reserva[]
    boletos: Boleto[]
    advertencias: string[]
    momentoCarga: number
}

interface ResultadoLista<T> {
    datos: T[]
    advertencia: string | null
}

interface TarjetaMetrica {
    etiqueta: string
    valor: number
    detalle: string
    icono: NombreIcono
    modulo: string
}

interface FilaTenant {
    idAerolinea: number
    nombreAerolinea: string
    codigoAerolinea: string
    estadoAerolinea: string
    plan: Plan | null
    estadoSuscripcion: string
    vigenciaSuscripcion: string
    usuarios: number
    aviones: number
    vuelosMes: number
}

interface BarraEstadoProps {
    etiqueta: string
    valor: number
    total: number
}

class SesionExpiradaError extends Error { }

const datosIniciales: DatosPanel = {
    aerolineas: [],
    suscripciones: [],
    usuarios: [],
    aviones: [],
    vuelos: [],
    pasajeros: [],
    reservas: [],
    boletos: [],
    advertencias: [],
    momentoCarga: 0,
}

function Icono({
    nombre,
    tamano = 20,
}: {
    nombre: NombreIcono
    tamano?: number
}) {
    const propiedades = {
        width: tamano,
        height: tamano,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    }

    switch (nombre) {
        case 'panel':
            return (
                <svg {...propiedades}>
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
            )
        case 'aerolinea':
            return (
                <svg {...propiedades}>
                    <path d="M4 20V9l8-5 8 5v11" />
                    <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
                    <path d="M2 20h20" />
                </svg>
            )
        case 'suscripcion':
            return (
                <svg {...propiedades}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3 9h18M7 15l2 2 4-4" />
                </svg>
            )
        case 'usuario':
            return (
                <svg {...propiedades}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" />
                </svg>
            )
        case 'avion':
            return (
                <svg {...propiedades}>
                    <path d="M3 13.2 21 5l-5.7 14-3.7-5.1L6 16z" />
                    <path d="m11.6 13.9 4.6-4.5" />
                </svg>
            )
        case 'vuelo':
            return (
                <svg {...propiedades}>
                    <path d="M4 17c4-7 8-10 16-11" />
                    <path d="m12 10 7-4-3 7-2-2-3 1z" />
                    <circle cx="4" cy="17" r="2" />
                </svg>
            )
        case 'pasajero':
            return (
                <svg {...propiedades}>
                    <rect x="4" y="3" width="16" height="18" rx="2.5" />
                    <circle cx="12" cy="9" r="3" />
                    <path d="M7.5 17c.6-2.5 2-3.8 4.5-3.8s3.9 1.3 4.5 3.8" />
                </svg>
            )
        case 'reserva':
            return (
                <svg {...propiedades}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                    <path d="m8 15 2.2 2.2L16 12" />
                </svg>
            )
        case 'boleto':
            return (
                <svg {...propiedades}>
                    <path d="M3 7.5A2.5 2.5 0 0 0 5.5 5h13A2.5 2.5 0 0 0 21 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 0 18.5 19h-13A2.5 2.5 0 0 0 3 16.5v-2a2.5 2.5 0 0 0 0-5z" />
                    <path d="M9 8v8M13 9h4M13 13h4" />
                </svg>
            )
        case 'actualizar':
            return (
                <svg {...propiedades}>
                    <path d="M20 7v5h-5" />
                    <path d="M18.5 16a8 8 0 1 1 .8-8" />
                </svg>
            )
        case 'flecha':
            return (
                <svg {...propiedades}>
                    <path d="m9 6 6 6-6 6" />
                </svg>
            )
        case 'alerta':
            return (
                <svg {...propiedades}>
                    <path d="M12 3 2.8 20h18.4z" />
                    <path d="M12 9v5M12 17h.01" />
                </svg>
            )
        case 'calendario':
            return (
                <svg {...propiedades}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                </svg>
            )
        case 'reloj':
            return (
                <svg {...propiedades}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'escudo':
            return (
                <svg {...propiedades}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
                    <path d="m8.5 12 2.3 2.3 4.8-5" />
                </svg>
            )
        case 'plan':
            return (
                <svg {...propiedades}>
                    <path d="M7 3h8l4 4v14H7z" />
                    <path d="M15 3v5h5M10 12h6M10 16h5" />
                </svg>
            )
        case 'ruta':
            return (
                <svg {...propiedades}>
                    <circle cx="5" cy="18" r="2.5" />
                    <circle cx="19" cy="6" r="2.5" />
                    <path d="M7.5 18c4 0 1.5-7 6-7h1.5" />
                    <path d="m12.5 7.5 2.5 3.5-4 1" />
                </svg>
            )
    }
}

async function leerRespuesta(response: Response): Promise<unknown> {
    const texto = await response.text()

    if (!texto) {
        return null
    }

    try {
        return JSON.parse(texto) as unknown
    } catch {
        return texto
    }
}

function obtenerMensaje(
    respuesta: unknown,
    alternativo: string,
): string {
    if (typeof respuesta !== 'object' || respuesta === null) {
        return alternativo
    }

    const objeto = respuesta as Record<string, unknown>

    if (typeof objeto.message === 'string') {
        return objeto.message
    }

    if (
        Array.isArray(objeto.message) &&
        objeto.message.every(
            (elemento) => typeof elemento === 'string',
        )
    ) {
        return objeto.message.join('. ')
    }

    if (typeof objeto.error === 'string') {
        return objeto.error
    }

    return alternativo
}

async function solicitarLista<T>(
    ruta: string,
    token: string,
    signal?: AbortSignal,
): Promise<T[]> {
    const response = await fetch(`${API_URL}${ruta}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        signal,
    })

    const respuesta = await leerRespuesta(response)

    if (response.status === 401) {
        throw new SesionExpiradaError()
    }

    if (!response.ok) {
        throw new Error(
            obtenerMensaje(
                respuesta,
                `No fue posible consultar ${ruta}.`,
            ),
        )
    }

    return Array.isArray(respuesta)
        ? (respuesta as T[])
        : []
}

async function cargarListaSegura<T>(
    ruta: string,
    etiqueta: string,
    token: string,
    signal?: AbortSignal,
): Promise<ResultadoLista<T>> {
    try {
        return {
            datos: await solicitarLista<T>(ruta, token, signal),
            advertencia: null,
        }
    } catch (error: unknown) {
        if (
            error instanceof SesionExpiradaError ||
            (error instanceof DOMException &&
                error.name === 'AbortError')
        ) {
            throw error
        }

        return {
            datos: [],
            advertencia:
                error instanceof Error
                    ? `${etiqueta}: ${error.message}`
                    : `${etiqueta}: no fue posible cargar los datos.`,
        }
    }
}

async function cargarDatosPanel(
    token: string,
    rolUsuario: RolUsuario,
    signal?: AbortSignal,
): Promise<DatosPanel> {
    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const puedeConsultarUsuarios =
        esSuperadmin || rolUsuario === 'ADMIN_AEROLINEA'

    const resultadoVacio = <T,>(): Promise<ResultadoLista<T>> =>
        Promise.resolve({
            datos: [],
            advertencia: null,
        })

    const [
        aerolineas,
        suscripciones,
        usuarios,
        aviones,
        vuelos,
        pasajeros,
        reservas,
        boletos,
    ] = await Promise.all([
        esSuperadmin
            ? cargarListaSegura<Aerolinea>(
                '/aerolineas',
                'Aerolíneas',
                token,
                signal,
            )
            : resultadoVacio<Aerolinea>(),
        esSuperadmin
            ? cargarListaSegura<Suscripcion>(
                '/suscripciones',
                'Suscripciones',
                token,
                signal,
            )
            : resultadoVacio<Suscripcion>(),
        puedeConsultarUsuarios
            ? cargarListaSegura<UsuarioResumen>(
                '/usuarios',
                'Usuarios',
                token,
                signal,
            )
            : resultadoVacio<UsuarioResumen>(),
        cargarListaSegura<Avion>(
            '/aviones',
            'Aviones',
            token,
            signal,
        ),
        cargarListaSegura<Vuelo>(
            '/vuelos',
            'Vuelos',
            token,
            signal,
        ),
        cargarListaSegura<Pasajero>(
            '/pasajeros',
            'Pasajeros',
            token,
            signal,
        ),
        cargarListaSegura<Reserva>(
            '/reservas',
            'Reservas',
            token,
            signal,
        ),
        cargarListaSegura<Boleto>(
            '/boletos',
            'Boletos',
            token,
            signal,
        ),
    ])

    const resultados = [
        aerolineas,
        suscripciones,
        usuarios,
        aviones,
        vuelos,
        pasajeros,
        reservas,
        boletos,
    ]

    return {
        aerolineas: aerolineas.datos,
        suscripciones: suscripciones.datos,
        usuarios: usuarios.datos,
        aviones: aviones.datos,
        vuelos: vuelos.datos,
        pasajeros: pasajeros.datos,
        reservas: reservas.datos,
        boletos: boletos.datos,
        advertencias: resultados
            .map((resultado) => resultado.advertencia)
            .filter(
                (advertencia): advertencia is string =>
                    advertencia !== null,
            ),
        momentoCarga: Date.now(),
    }
}

function normalizarFecha(fechaIso: string): number {
    const fecha = new Date(fechaIso).getTime()

    return Number.isNaN(fecha) ? 0 : fecha
}

function formatearFecha(fechaIso: string): string {
    const fecha = new Date(fechaIso)

    if (Number.isNaN(fecha.getTime())) {
        return 'Fecha no válida'
    }

    return new Intl.DateTimeFormat('es-EC', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }).format(fecha)
}

function formatearHora(fechaIso: string): string {
    const fecha = new Date(fechaIso)

    if (Number.isNaN(fecha.getTime())) {
        return '--:--'
    }

    return new Intl.DateTimeFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(fecha)
}

function formatearMoneda(valor: number | string): string {
    const numero = Number(valor)

    if (!Number.isFinite(numero)) {
        return '$0,00'
    }

    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(numero)
}

function etiquetaRol(rol: RolUsuario): string {
    switch (rol) {
        case 'SUPERADMIN':
            return 'Superadministrador'
        case 'ADMIN_AEROLINEA':
            return 'Administrador de aerolínea'
        case 'EMPLEADO':
            return 'Empleado'
        default:
            return rol.replaceAll('_', ' ')
    }
}

function etiquetaEstado(estado: string): string {
    return estado
        .toLocaleLowerCase('es')
        .replaceAll('_', ' ')
        .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
}

function esFechaDentro(
    fechaInicio: string,
    fechaFin: string,
    momento: number,
): boolean {
    const inicio = normalizarFecha(fechaInicio)
    const fin = normalizarFecha(fechaFin)

    return inicio > 0 && fin > 0 && inicio <= momento && fin >= momento
}

function esMismoMes(fechaIso: string, momento: number): boolean {
    const fecha = new Date(fechaIso)
    const referencia = new Date(momento)

    return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.getFullYear() === referencia.getFullYear() &&
        fecha.getMonth() === referencia.getMonth()
    )
}

function calcularPorcentaje(valor: number, limite?: number): number {
    if (!limite || limite <= 0) {
        return 0
    }

    return Math.min(100, Math.round((valor / limite) * 100))
}

function obtenerSaludo(momento: number): string {
    const hora = new Date(momento).getHours()

    if (hora < 12) {
        return 'Buenos días'
    }

    if (hora < 19) {
        return 'Buenas tardes'
    }

    return 'Buenas noches'
}

function BarraEstado({
    etiqueta,
    valor,
    total,
}: BarraEstadoProps) {
    const porcentaje =
        total > 0 ? Math.round((valor / total) * 100) : 0

    return (
        <div className="panel-real-barra">
            <div className="panel-real-barra__datos">
                <span>{etiqueta}</span>
                <strong>{valor}</strong>
            </div>

            <div className="panel-real-barra__pista">
                <span style={{ width: `${porcentaje}%` }} />
            </div>
        </div>
    )
}

function obtenerVigenciaSuscripcion(
    suscripcion: Suscripcion | null,
    momento: number,
): string {
    if (!suscripcion) {
        return 'SIN_SUSCRIPCION'
    }

    if (suscripcion.estadoSuscripcion !== 'ACTIVA') {
        return suscripcion.estadoSuscripcion
    }

    const inicio = normalizarFecha(
        suscripcion.fechaInicioSuscripcion,
    )
    const fin = normalizarFecha(
        suscripcion.fechaFinSuscripcion,
    )

    if (inicio > momento) {
        return 'POR_INICIAR'
    }

    if (fin < momento) {
        return 'PERIODO_FINALIZADO'
    }

    return 'VIGENTE'
}

function obtenerSuscripcionPrincipal(
    suscripciones: Suscripcion[],
    idAerolinea: number,
): Suscripcion | null {
    const candidatas = suscripciones
        .filter(
            (suscripcion) =>
                suscripcion.fkAerolineaSuscripcion === idAerolinea,
        )
        .sort(
            (a, b) =>
                normalizarFecha(b.fechaFinSuscripcion) -
                normalizarFecha(a.fechaFinSuscripcion),
        )

    return (
        candidatas.find(
            (suscripcion) =>
                suscripcion.estadoSuscripcion === 'ACTIVA',
        ) ??
        candidatas[0] ??
        null
    )
}

export function PanelPrincipalModulo({
    token,
    usuario,
    nombreAerolinea,
    onSeleccionarModulo,
    onSesionExpirada,
}: PanelPrincipalModuloProps) {
    const [datos, setDatos] =
        useState<DatosPanel>(() => ({
            ...datosIniciales,
            momentoCarga: Date.now(),
        }))
    const [cargando, setCargando] = useState(true)
    const [mensajeError, setMensajeError] = useState('')

    const esSuperadmin = usuario.rolUsuario === 'SUPERADMIN'
    const esAdministrador =
        usuario.rolUsuario === 'ADMIN_AEROLINEA'

    useEffect(() => {
        const controlador = new AbortController()
        let activo = true

        cargarDatosPanel(
            token,
            usuario.rolUsuario,
            controlador.signal,
        )
            .then((respuesta) => {
                if (!activo) {
                    return
                }

                setDatos(respuesta)
                setMensajeError('')
            })
            .catch((error: unknown) => {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return
                }

                if (error instanceof SesionExpiradaError) {
                    onSesionExpirada()
                    return
                }

                if (activo) {
                    setMensajeError(
                        error instanceof Error
                            ? error.message
                            : 'No fue posible cargar el panel principal.',
                    )
                }
            })
            .finally(() => {
                if (activo) {
                    setCargando(false)
                }
            })

        return () => {
            activo = false
            controlador.abort()
        }
    }, [token, usuario.rolUsuario, onSesionExpirada])

    const resumen = useMemo(() => {
        const momento =
            datos.momentoCarga > 0
                ? datos.momentoCarga
                : 1

        const vuelosProximos = datos.vuelos
            .filter((vuelo) => {
                const salida = normalizarFecha(
                    vuelo.fechaHoraSalidaVuelo,
                )

                return (
                    salida > momento &&
                    (vuelo.estadoVuelo === 'PROGRAMADO' ||
                        vuelo.estadoVuelo === 'EMBARQUE')
                )
            })
            .sort(
                (a, b) =>
                    normalizarFecha(a.fechaHoraSalidaVuelo) -
                    normalizarFecha(b.fechaHoraSalidaVuelo),
            )

        const reservasRecientes = [...datos.reservas]
            .sort((a, b) => b.idReserva - a.idReserva)
            .slice(0, 5)

        const aerolineasActivas = datos.aerolineas.filter(
            (aerolinea) =>
                aerolinea.estadoAerolinea === 'ACTIVA',
        )

        const suscripcionesVigentes = datos.suscripciones.filter(
            (suscripcion) =>
                suscripcion.estadoSuscripcion === 'ACTIVA' &&
                esFechaDentro(
                    suscripcion.fechaInicioSuscripcion,
                    suscripcion.fechaFinSuscripcion,
                    momento,
                ),
        )

        const suscripcionesActivasFueraPeriodo =
            datos.suscripciones.filter(
                (suscripcion) =>
                    suscripcion.estadoSuscripcion === 'ACTIVA' &&
                    !esFechaDentro(
                        suscripcion.fechaInicioSuscripcion,
                        suscripcion.fechaFinSuscripcion,
                        momento,
                    ),
            )

        const usuariosActivos = datos.usuarios.filter(
            (elemento) => elemento.estadoUsuario === 'ACTIVO',
        )

        const avionesDisponibles = datos.aviones.filter(
            (avion) => avion.estadoAvion === 'DISPONIBLE',
        )

        const reservasConfirmadas = datos.reservas.filter(
            (reserva) =>
                reserva.estadoReserva === 'CONFIRMADA',
        )

        const reservasPendientes = datos.reservas.filter(
            (reserva) => reserva.estadoReserva === 'PENDIENTE',
        )

        const boletosEmitidos = datos.boletos.filter(
            (boleto) => boleto.estadoBoleto === 'EMITIDO',
        )

        const metricas: TarjetaMetrica[] = esSuperadmin
            ? [
                {
                    etiqueta: 'Aerolíneas activas',
                    valor: aerolineasActivas.length,
                    detalle: `${datos.aerolineas.length} tenants registrados`,
                    icono: 'aerolinea',
                    modulo: 'aerolineas',
                },
                {
                    etiqueta: 'Suscripciones vigentes',
                    valor: suscripcionesVigentes.length,
                    detalle:
                        suscripcionesActivasFueraPeriodo.length > 0
                            ? `${suscripcionesActivasFueraPeriodo.length} requieren revisión`
                            : 'Periodos activos verificados',
                    icono: 'suscripcion',
                    modulo: 'suscripciones',
                },
                {
                    etiqueta: 'Usuarios activos',
                    valor: usuariosActivos.length,
                    detalle: `${datos.usuarios.length} cuentas registradas`,
                    icono: 'usuario',
                    modulo: 'usuarios',
                },
                {
                    etiqueta: 'Vuelos próximos',
                    valor: vuelosProximos.length,
                    detalle: 'Programados o en embarque',
                    icono: 'vuelo',
                    modulo: 'vuelos',
                },
            ]
            : esAdministrador
                ? [
                    {
                        etiqueta: 'Usuarios activos',
                        valor: usuariosActivos.length,
                        detalle: `${datos.usuarios.length} cuentas del tenant`,
                        icono: 'usuario',
                        modulo: 'usuarios',
                    },
                    {
                        etiqueta: 'Aviones disponibles',
                        valor: avionesDisponibles.length,
                        detalle: `${datos.aviones.length} aeronaves registradas`,
                        icono: 'avion',
                        modulo: 'aviones',
                    },
                    {
                        etiqueta: 'Vuelos próximos',
                        valor: vuelosProximos.length,
                        detalle: 'Programados o en embarque',
                        icono: 'vuelo',
                        modulo: 'vuelos',
                    },
                    {
                        etiqueta: 'Reservas confirmadas',
                        valor: reservasConfirmadas.length,
                        detalle: `${datos.reservas.length} reservas totales`,
                        icono: 'reserva',
                        modulo: 'reservas',
                    },
                ]
                : [
                    {
                        etiqueta: 'Pasajeros registrados',
                        valor: datos.pasajeros.length,
                        detalle: 'Disponibles para reservas',
                        icono: 'pasajero',
                        modulo: 'pasajeros',
                    },
                    {
                        etiqueta: 'Vuelos próximos',
                        valor: vuelosProximos.length,
                        detalle: 'Programados o en embarque',
                        icono: 'vuelo',
                        modulo: 'vuelos',
                    },
                    {
                        etiqueta: 'Reservas pendientes',
                        valor: reservasPendientes.length,
                        detalle: `${datos.reservas.length} reservas totales`,
                        icono: 'reserva',
                        modulo: 'reservas',
                    },
                    {
                        etiqueta: 'Boletos emitidos',
                        valor: boletosEmitidos.length,
                        detalle: `${datos.boletos.length} boletos totales`,
                        icono: 'boleto',
                        modulo: 'boletos',
                    },
                ]

        const filasTenant: FilaTenant[] = datos.aerolineas
            .map((aerolinea) => {
                const suscripcion = obtenerSuscripcionPrincipal(
                    datos.suscripciones,
                    aerolinea.idAerolinea,
                )

                return {
                    idAerolinea: aerolinea.idAerolinea,
                    nombreAerolinea:
                        aerolinea.nombreComercialAerolinea,
                    codigoAerolinea:
                        aerolinea.codigoIataAerolinea ??
                        `#${aerolinea.idAerolinea}`,
                    estadoAerolinea: aerolinea.estadoAerolinea,
                    plan:
                        suscripcion?.estadoSuscripcion === 'ACTIVA'
                            ? suscripcion.planSuscripcion
                            : null,
                    estadoSuscripcion:
                        suscripcion?.estadoSuscripcion ??
                        'SIN_SUSCRIPCION',
                    vigenciaSuscripcion:
                        aerolinea.estadoAerolinea === 'ACTIVA'
                            ? obtenerVigenciaSuscripcion(
                                suscripcion,
                                momento,
                            )
                            : aerolinea.estadoAerolinea,
                    usuarios: datos.usuarios.filter(
                        (elemento) =>
                            elemento.fkAerolineaUsuario ===
                            aerolinea.idAerolinea,
                    ).length,
                    aviones: datos.aviones.filter(
                        (avion) =>
                            avion.fkAerolineaAvion ===
                            aerolinea.idAerolinea,
                    ).length,
                    vuelosMes: datos.vuelos.filter(
                        (vuelo) =>
                            vuelo.fkAerolineaVuelo ===
                            aerolinea.idAerolinea &&
                            esMismoMes(
                                vuelo.fechaHoraSalidaVuelo,
                                momento,
                            ),
                    ).length,
                }
            })
            .sort((a, b) => {
                const prioridadA =
                    a.estadoAerolinea === 'ACTIVA' ? 0 : 1
                const prioridadB =
                    b.estadoAerolinea === 'ACTIVA' ? 0 : 1

                if (prioridadA !== prioridadB) {
                    return prioridadA - prioridadB
                }

                return a.nombreAerolinea.localeCompare(
                    b.nombreAerolinea,
                    'es',
                )
            })

        return {
            momento,
            vuelosProximos,
            reservasRecientes,
            aerolineasActivas,
            suscripcionesVigentes,
            suscripcionesActivasFueraPeriodo,
            usuariosActivos,
            avionesDisponibles,
            reservasConfirmadas,
            reservasPendientes,
            boletosEmitidos,
            metricas,
            filasTenant,
        }
    }, [
        datos,
        esSuperadmin,
        esAdministrador,
    ])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const respuesta = await cargarDatosPanel(
                token,
                usuario.rolUsuario,
            )

            setDatos(respuesta)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible actualizar el panel.',
            )
        } finally {
            setCargando(false)
        }
    }

    const fechaActual = new Intl.DateTimeFormat('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(
        new Date(
            resumen.momento > 1
                ? resumen.momento
                : 0,
        ),
    )

    const accesosRapidos = esSuperadmin
        ? [
            {
                id: 'aerolineas',
                nombre: 'Aerolíneas',
                descripcion: 'Administrar tenants',
                icono: 'aerolinea' as NombreIcono,
            },
            {
                id: 'suscripciones',
                nombre: 'Suscripciones',
                descripcion: 'Revisar vigencias',
                icono: 'suscripcion' as NombreIcono,
            },
            {
                id: 'usuarios',
                nombre: 'Usuarios',
                descripcion: 'Gestionar cuentas',
                icono: 'usuario' as NombreIcono,
            },
            {
                id: 'vuelos',
                nombre: 'Vuelos',
                descripcion: 'Consultar operación',
                icono: 'vuelo' as NombreIcono,
            },
        ]
        : esAdministrador
            ? [
                {
                    id: 'usuarios',
                    nombre: 'Usuarios',
                    descripcion: 'Gestionar equipo',
                    icono: 'usuario' as NombreIcono,
                },
                {
                    id: 'aviones',
                    nombre: 'Aviones',
                    descripcion: 'Administrar flota',
                    icono: 'avion' as NombreIcono,
                },
                {
                    id: 'vuelos',
                    nombre: 'Vuelos',
                    descripcion: 'Programar operación',
                    icono: 'vuelo' as NombreIcono,
                },
                {
                    id: 'reservas',
                    nombre: 'Reservas',
                    descripcion: 'Revisar solicitudes',
                    icono: 'reserva' as NombreIcono,
                },
            ]
            : [
                {
                    id: 'vuelos',
                    nombre: 'Vuelos',
                    descripcion: 'Consultar programación',
                    icono: 'vuelo' as NombreIcono,
                },
                {
                    id: 'pasajeros',
                    nombre: 'Pasajeros',
                    descripcion: 'Gestionar registros',
                    icono: 'pasajero' as NombreIcono,
                },
                {
                    id: 'reservas',
                    nombre: 'Reservas',
                    descripcion: 'Atender solicitudes',
                    icono: 'reserva' as NombreIcono,
                },
                {
                    id: 'boletos',
                    nombre: 'Boletos',
                    descripcion: 'Emitir y consultar',
                    icono: 'boleto' as NombreIcono,
                },
            ]

    return (
        <section className="panel-real">
            <header className="panel-real-bienvenida">
                <div className="panel-real-bienvenida__texto">
                    <span className="panel-real-bienvenida__fecha">
                        {fechaActual}
                    </span>

                    <h2>
                        {obtenerSaludo(resumen.momento)},{' '}
                        {usuario.nombresUsuario}
                    </h2>

                    <p>
                        {esSuperadmin
                            ? 'Vista global del servicio SaaS, sus tenants y la operación consolidada.'
                            : `Resumen operativo de ${nombreAerolinea}, limitado a los datos autorizados para tu rol.`}
                    </p>

                    <div className="panel-real-bienvenida__insignias">
                        <span>
                            <Icono nombre="escudo" tamano={16} />
                            {etiquetaRol(usuario.rolUsuario)}
                        </span>

                        <span>
                            <Icono
                                nombre={
                                    esSuperadmin
                                        ? 'aerolinea'
                                        : 'ruta'
                                }
                                tamano={16}
                            />
                            {esSuperadmin
                                ? 'Todos los tenants'
                                : 'Tenant aislado'}
                        </span>
                    </div>
                </div>

                <div className="panel-real-bienvenida__acciones">
                    <button
                        type="button"
                        className="panel-real-boton-actualizar"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        {cargando ? 'Actualizando' : 'Actualizar datos'}
                    </button>

                    <div className="panel-real-bienvenida__grafico">
                        <div className="panel-real-orbita panel-real-orbita--uno" />
                        <div className="panel-real-orbita panel-real-orbita--dos" />
                        <span>
                            <Icono nombre="avion" tamano={54} />
                        </span>
                    </div>
                </div>
            </header>

            {mensajeError && (
                <div
                    className="panel-real-mensaje panel-real-mensaje--error"
                    role="alert"
                >
                    <Icono nombre="alerta" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {datos.advertencias.length > 0 && (
                <div
                    className="panel-real-mensaje panel-real-mensaje--advertencia"
                    role="status"
                >
                    <Icono nombre="alerta" />
                    <div>
                        <strong>El panel se cargó parcialmente</strong>
                        <span>
                            {datos.advertencias.join(' · ')}
                        </span>
                    </div>
                </div>
            )}

            <div className="panel-real-metricas">
                {resumen.metricas.map((metrica) => (
                    <button
                        key={metrica.etiqueta}
                        type="button"
                        className="panel-real-metrica"
                        onClick={() =>
                            onSeleccionarModulo(metrica.modulo)
                        }
                    >
                        <span className="panel-real-metrica__icono">
                            <Icono
                                nombre={metrica.icono}
                                tamano={23}
                            />
                        </span>

                        <span className="panel-real-metrica__contenido">
                            <small>{metrica.etiqueta}</small>
                            <strong>
                                {cargando ? '—' : metrica.valor}
                            </strong>
                            <span>{metrica.detalle}</span>
                        </span>

                        <Icono
                            nombre="flecha"
                            tamano={17}
                        />
                    </button>
                ))}
            </div>

            {esSuperadmin && (
                <section className="panel-real-seccion panel-real-seccion--tenant">
                    <div className="panel-real-seccion__encabezado">
                        <div>
                            <span className="panel-real-subtitulo">
                                Control multi-tenant
                            </span>
                            <h3>Uso de límites SaaS por aerolínea</h3>
                            <p>
                                Compara el consumo actual con los límites del
                                plan asociado a cada tenant.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="panel-real-enlace"
                            onClick={() =>
                                onSeleccionarModulo('suscripciones')
                            }
                        >
                            Gestionar suscripciones
                            <Icono nombre="flecha" tamano={17} />
                        </button>
                    </div>

                    {cargando ? (
                        <div className="panel-real-cargando">
                            <span />
                            <strong>Cargando tenants</strong>
                        </div>
                    ) : resumen.filasTenant.length === 0 ? (
                        <div className="panel-real-vacio">
                            <Icono nombre="aerolinea" tamano={34} />
                            <strong>No existen aerolíneas registradas</strong>
                            <span>
                                Registra un tenant para visualizar su consumo.
                            </span>
                        </div>
                    ) : (
                        <div className="panel-real-tenants">
                            {resumen.filasTenant.map((fila) => (
                                <article
                                    key={fila.idAerolinea}
                                    className="panel-real-tenant"
                                >
                                    <div className="panel-real-tenant__identidad">
                                        <span className="panel-real-tenant__codigo">
                                            {fila.codigoAerolinea}
                                        </span>

                                        <div>
                                            <h4>{fila.nombreAerolinea}</h4>
                                            <span>
                                                {fila.plan
                                                    ? fila.plan.nombrePlan
                                                    : 'Sin plan activo'}
                                            </span>
                                        </div>

                                        <span
                                            className={`panel-real-estado panel-real-estado--${fila.vigenciaSuscripcion.toLocaleLowerCase('es')}`}
                                        >
                                            {etiquetaEstado(
                                                fila.vigenciaSuscripcion,
                                            )}
                                        </span>
                                    </div>

                                    <div className="panel-real-tenant__consumos">
                                        <div>
                                            <span>
                                                Usuarios
                                                <strong>
                                                    {fila.usuarios}/
                                                    {fila.plan?.limiteUsuariosPlan ??
                                                        '—'}
                                                </strong>
                                            </span>
                                            <div>
                                                <i
                                                    style={{
                                                        width: `${calcularPorcentaje(
                                                            fila.usuarios,
                                                            fila.plan?.limiteUsuariosPlan,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <span>
                                                Aviones
                                                <strong>
                                                    {fila.aviones}/
                                                    {fila.plan?.limiteAvionesPlan ??
                                                        '—'}
                                                </strong>
                                            </span>
                                            <div>
                                                <i
                                                    style={{
                                                        width: `${calcularPorcentaje(
                                                            fila.aviones,
                                                            fila.plan?.limiteAvionesPlan,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <span>
                                                Vuelos del mes
                                                <strong>
                                                    {fila.vuelosMes}/
                                                    {fila.plan
                                                        ?.limiteVuelosMensualesPlan ??
                                                        '—'}
                                                </strong>
                                            </span>
                                            <div>
                                                <i
                                                    style={{
                                                        width: `${calcularPorcentaje(
                                                            fila.vuelosMes,
                                                            fila.plan
                                                                ?.limiteVuelosMensualesPlan,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <div className="panel-real-columnas">
                <section className="panel-real-seccion">
                    <div className="panel-real-seccion__encabezado">
                        <div>
                            <span className="panel-real-subtitulo">
                                Programación
                            </span>
                            <h3>Próximos vuelos</h3>
                            <p>
                                Salidas futuras en estado programado o
                                embarque.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="panel-real-enlace"
                            onClick={() =>
                                onSeleccionarModulo('vuelos')
                            }
                        >
                            Ver vuelos
                            <Icono nombre="flecha" tamano={17} />
                        </button>
                    </div>

                    {cargando ? (
                        <div className="panel-real-cargando">
                            <span />
                            <strong>Cargando vuelos</strong>
                        </div>
                    ) : resumen.vuelosProximos.length === 0 ? (
                        <div className="panel-real-vacio">
                            <Icono nombre="vuelo" tamano={34} />
                            <strong>No hay vuelos próximos</strong>
                            <span>
                                La programación futura aparecerá en esta
                                sección.
                            </span>
                        </div>
                    ) : (
                        <div className="panel-real-listado">
                            {resumen.vuelosProximos
                                .slice(0, 5)
                                .map((vuelo) => (
                                    <article
                                        key={vuelo.idVuelo}
                                        className="panel-real-vuelo"
                                    >
                                        <span className="panel-real-vuelo__icono">
                                            <Icono nombre="vuelo" />
                                        </span>

                                        <div className="panel-real-vuelo__principal">
                                            <div>
                                                <strong>{vuelo.numeroVuelo}</strong>
                                                {esSuperadmin &&
                                                    vuelo.aerolineaVuelo && (
                                                        <span>
                                                            {
                                                                vuelo.aerolineaVuelo
                                                                    .nombreComercialAerolinea
                                                            }
                                                        </span>
                                                    )}
                                            </div>

                                            <p>
                                                {
                                                    vuelo.rutaVuelo
                                                        .aeropuertoOrigenRuta
                                                        .codigoIataAeropuerto
                                                }
                                                <span>→</span>
                                                {
                                                    vuelo.rutaVuelo
                                                        .aeropuertoDestinoRuta
                                                        .codigoIataAeropuerto
                                                }
                                            </p>
                                        </div>

                                        <div className="panel-real-vuelo__fecha">
                                            <span>
                                                <Icono
                                                    nombre="calendario"
                                                    tamano={15}
                                                />
                                                {formatearFecha(
                                                    vuelo.fechaHoraSalidaVuelo,
                                                )}
                                            </span>
                                            <span>
                                                <Icono
                                                    nombre="reloj"
                                                    tamano={15}
                                                />
                                                {formatearHora(
                                                    vuelo.fechaHoraSalidaVuelo,
                                                )}
                                            </span>
                                        </div>

                                        <span
                                            className={`panel-real-estado panel-real-estado--${vuelo.estadoVuelo.toLocaleLowerCase('es')}`}
                                        >
                                            {etiquetaEstado(
                                                vuelo.estadoVuelo,
                                            )}
                                        </span>
                                    </article>
                                ))}
                        </div>
                    )}
                </section>

                <section className="panel-real-seccion">
                    <div className="panel-real-seccion__encabezado">
                        <div>
                            <span className="panel-real-subtitulo">
                                Distribución actual
                            </span>
                            <h3>Estado operativo</h3>
                            <p>
                                Resumen de vuelos, reservas y boletos
                                visibles para tu sesión.
                            </p>
                        </div>
                    </div>

                    <div className="panel-real-distribuciones">
                        <div className="panel-real-distribucion">
                            <div className="panel-real-distribucion__titulo">
                                <span>
                                    <Icono nombre="vuelo" tamano={18} />
                                    Vuelos
                                </span>
                                <strong>{datos.vuelos.length}</strong>
                            </div>

                            <BarraEstado
                                etiqueta="Programados"
                                valor={
                                    datos.vuelos.filter(
                                        (vuelo) =>
                                            vuelo.estadoVuelo === 'PROGRAMADO',
                                    ).length
                                }
                                total={datos.vuelos.length}
                            />
                            <BarraEstado
                                etiqueta="En operación"
                                valor={
                                    datos.vuelos.filter(
                                        (vuelo) =>
                                            vuelo.estadoVuelo === 'EMBARQUE' ||
                                            vuelo.estadoVuelo === 'EN_VUELO',
                                    ).length
                                }
                                total={datos.vuelos.length}
                            />
                            <BarraEstado
                                etiqueta="Finalizados"
                                valor={
                                    datos.vuelos.filter(
                                        (vuelo) =>
                                            vuelo.estadoVuelo === 'FINALIZADO',
                                    ).length
                                }
                                total={datos.vuelos.length}
                            />
                        </div>

                        <div className="panel-real-distribucion">
                            <div className="panel-real-distribucion__titulo">
                                <span>
                                    <Icono nombre="reserva" tamano={18} />
                                    Reservas
                                </span>
                                <strong>{datos.reservas.length}</strong>
                            </div>

                            <BarraEstado
                                etiqueta="Pendientes"
                                valor={resumen.reservasPendientes.length}
                                total={datos.reservas.length}
                            />
                            <BarraEstado
                                etiqueta="Confirmadas"
                                valor={resumen.reservasConfirmadas.length}
                                total={datos.reservas.length}
                            />
                            <BarraEstado
                                etiqueta="Canceladas"
                                valor={
                                    datos.reservas.filter(
                                        (reserva) =>
                                            reserva.estadoReserva === 'CANCELADA',
                                    ).length
                                }
                                total={datos.reservas.length}
                            />
                        </div>

                        <div className="panel-real-distribucion">
                            <div className="panel-real-distribucion__titulo">
                                <span>
                                    <Icono nombre="boleto" tamano={18} />
                                    Boletos
                                </span>
                                <strong>{datos.boletos.length}</strong>
                            </div>

                            <BarraEstado
                                etiqueta="Emitidos"
                                valor={resumen.boletosEmitidos.length}
                                total={datos.boletos.length}
                            />
                            <BarraEstado
                                etiqueta="Utilizados"
                                valor={
                                    datos.boletos.filter(
                                        (boleto) =>
                                            boleto.estadoBoleto === 'UTILIZADO',
                                    ).length
                                }
                                total={datos.boletos.length}
                            />
                            <BarraEstado
                                etiqueta="Cancelados"
                                valor={
                                    datos.boletos.filter(
                                        (boleto) =>
                                            boleto.estadoBoleto === 'CANCELADO',
                                    ).length
                                }
                                total={datos.boletos.length}
                            />
                        </div>
                    </div>
                </section>
            </div>

            <div className="panel-real-columnas panel-real-columnas--inferior">
                <section className="panel-real-seccion">
                    <div className="panel-real-seccion__encabezado">
                        <div>
                            <span className="panel-real-subtitulo">
                                Actividad reciente
                            </span>
                            <h3>Últimas reservas registradas</h3>
                            <p>
                                Ordenadas por su identificador de registro.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="panel-real-enlace"
                            onClick={() =>
                                onSeleccionarModulo('reservas')
                            }
                        >
                            Ver reservas
                            <Icono nombre="flecha" tamano={17} />
                        </button>
                    </div>

                    {cargando ? (
                        <div className="panel-real-cargando">
                            <span />
                            <strong>Cargando reservas</strong>
                        </div>
                    ) : resumen.reservasRecientes.length === 0 ? (
                        <div className="panel-real-vacio">
                            <Icono nombre="reserva" tamano={34} />
                            <strong>No existen reservas</strong>
                            <span>
                                Las reservas nuevas aparecerán en esta lista.
                            </span>
                        </div>
                    ) : (
                        <div className="panel-real-listado">
                            {resumen.reservasRecientes.map(
                                (reserva) => (
                                    <article
                                        key={reserva.idReserva}
                                        className="panel-real-reserva"
                                    >
                                        <span className="panel-real-reserva__codigo">
                                            {reserva.codigoReserva}
                                        </span>

                                        <div className="panel-real-reserva__datos">
                                            <strong>
                                                {
                                                    reserva.pasajeroReserva
                                                        .nombresPasajero
                                                }{' '}
                                                {
                                                    reserva.pasajeroReserva
                                                        .apellidosPasajero
                                                }
                                            </strong>
                                            <span>
                                                Vuelo{' '}
                                                {
                                                    reserva.vueloReserva
                                                        .numeroVuelo
                                                }
                                                {esSuperadmin &&
                                                    reserva.aerolineaReserva && (
                                                        <>
                                                            {' '}
                                                            ·{' '}
                                                            {
                                                                reserva
                                                                    .aerolineaReserva
                                                                    .nombreComercialAerolinea
                                                            }
                                                        </>
                                                    )}
                                            </span>
                                        </div>

                                        <strong className="panel-real-reserva__total">
                                            {formatearMoneda(
                                                reserva.totalReserva,
                                            )}
                                        </strong>

                                        <span
                                            className={`panel-real-estado panel-real-estado--${reserva.estadoReserva.toLocaleLowerCase('es')}`}
                                        >
                                            {etiquetaEstado(
                                                reserva.estadoReserva,
                                            )}
                                        </span>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </section>

                <section className="panel-real-seccion">
                    <div className="panel-real-seccion__encabezado">
                        <div>
                            <span className="panel-real-subtitulo">
                                Navegación
                            </span>
                            <h3>Accesos rápidos</h3>
                            <p>
                                Módulos principales disponibles para tu rol.
                            </p>
                        </div>
                    </div>

                    <div className="panel-real-accesos">
                        {accesosRapidos.map((acceso) => (
                            <button
                                key={acceso.id}
                                type="button"
                                onClick={() =>
                                    onSeleccionarModulo(acceso.id)
                                }
                            >
                                <span>
                                    <Icono
                                        nombre={acceso.icono}
                                        tamano={22}
                                    />
                                </span>

                                <div>
                                    <strong>{acceso.nombre}</strong>
                                    <small>{acceso.descripcion}</small>
                                </div>

                                <Icono
                                    nombre="flecha"
                                    tamano={17}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="panel-real-sesion">
                        <span>
                            <Icono nombre="escudo" tamano={19} />
                        </span>

                        <div>
                            <strong>Sesión protegida</strong>
                            <p>
                                {esSuperadmin
                                    ? 'Los indicadores globales consolidan datos de todos los tenants.'
                                    : 'Todas las consultas fueron filtradas por la aerolínea asociada al JWT.'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}

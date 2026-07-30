/* saas-frontend/src/modules/boletos/BoletosModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './BoletosModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoBoleto = 'EMITIDO' | 'UTILIZADO' | 'CANCELADO'
type ClaseBoleto =
    | 'ECONOMICA'
    | 'EJECUTIVA'
    | 'PRIMERA_CLASE'
type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
type EstadoVuelo =
    | 'PROGRAMADO'
    | 'EMBARQUE'
    | 'EN_VUELO'
    | 'FINALIZADO'
    | 'CANCELADO'
type FiltroEstado = 'TODOS' | EstadoBoleto
type FiltroClase = 'TODAS' | ClaseBoleto

type IconoNombre =
    | 'boleto'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'vuelo'
    | 'pasajero'
    | 'calendario'
    | 'reloj'
    | 'asiento'
    | 'dinero'
    | 'aerolinea'
    | 'reserva'
    | 'clase'
    | 'documento'
    | 'regenerar'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea: string
    estadoAerolinea: string
}

interface AeropuertoResumen {
    idAeropuerto: number
    codigoIataAeropuerto: string
    ciudadAeropuerto: string
    paisAeropuerto: string
}

interface RutaResumen {
    idRuta: number
    codigoRuta: string
    aeropuertoOrigenRuta: AeropuertoResumen
    aeropuertoDestinoRuta: AeropuertoResumen
}

interface VueloResumen {
    idVuelo: number
    numeroVuelo: string
    fechaHoraSalidaVuelo: string
    fechaHoraLlegadaVuelo: string
    puertaEmbarqueVuelo: string | null
    estadoVuelo: EstadoVuelo
    rutaVuelo: RutaResumen
}

interface PasajeroResumen {
    idPasajero: number
    tipoDocumentoPasajero: string
    numeroDocumentoPasajero: string
    nombresPasajero: string
    apellidosPasajero: string
}

interface BoletoLigero {
    idBoleto: number
    numeroBoleto: string
    asientoBoleto: string
    claseBoleto: ClaseBoleto
    estadoBoleto: EstadoBoleto
}

interface ReservaResumen {
    idReserva: number
    fkAerolineaReserva: number
    codigoReserva: string
    estadoReserva: EstadoReserva
    totalReserva: number | string
    aerolineaReserva: AerolineaResumen
    pasajeroReserva: PasajeroResumen
    vueloReserva: VueloResumen
    boletoReserva: BoletoLigero | null
}

interface Boleto {
    idBoleto: number
    fkAerolineaBoleto: number
    fkReservaBoleto: number
    numeroBoleto: string
    asientoBoleto: string
    claseBoleto: ClaseBoleto
    precioFinalBoleto: number | string
    estadoBoleto: EstadoBoleto
    aerolineaBoleto: AerolineaResumen
    reservaBoleto: {
        idReserva: number
        codigoReserva: string
        estadoReserva: EstadoReserva
        totalReserva: number | string
        pasajeroReserva: PasajeroResumen
        vueloReserva: VueloResumen
    }
}

interface FormularioBoleto {
    fkAerolineaBoleto: string
    fkReservaBoleto: string
    numeroBoleto: string
    asientoBoleto: string
    claseBoleto: ClaseBoleto
    precioFinalBoleto: string
    estadoBoleto: EstadoBoleto
}

interface BoletosModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    boletos: Boleto[]
    reservas: ReservaResumen[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioBoleto = {
    fkAerolineaBoleto: '',
    fkReservaBoleto: '',
    numeroBoleto: '',
    asientoBoleto: '',
    claseBoleto: 'ECONOMICA',
    precioFinalBoleto: '',
    estadoBoleto: 'EMITIDO',
}

const estadosBoleto: EstadoBoleto[] = [
    'EMITIDO',
    'UTILIZADO',
    'CANCELADO',
]

const clasesBoleto: ClaseBoleto[] = [
    'ECONOMICA',
    'EJECUTIVA',
    'PRIMERA_CLASE',
]

function Icono({
    nombre,
    tamano = 20,
}: {
    nombre: IconoNombre
    tamano?: number
}) {
    const props = {
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
        case 'boleto':
            return (
                <svg {...props}>
                    <path d="M3 7.5A2.5 2.5 0 0 0 5.5 5h13A2.5 2.5 0 0 0 21 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 0 18.5 19h-13A2.5 2.5 0 0 0 3 16.5v-2a2.5 2.5 0 0 0 0-5z" />
                    <path d="M9 8v8M13 9h4M13 13h4" />
                </svg>
            )
        case 'buscar':
            return (
                <svg {...props}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                </svg>
            )
        case 'agregar':
            return (
                <svg {...props}>
                    <path d="M12 5v14M5 12h14" />
                </svg>
            )
        case 'editar':
            return (
                <svg {...props}>
                    <path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2z" />
                    <path d="m14.5 7.1 2.8 2.8" />
                </svg>
            )
        case 'eliminar':
            return (
                <svg {...props}>
                    <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
                    <path d="M10 11v5M14 11v5" />
                </svg>
            )
        case 'actualizar':
            return (
                <svg {...props}>
                    <path d="M20 7v5h-5" />
                    <path d="M18.5 16a8 8 0 1 1 .8-8" />
                </svg>
            )
        case 'cerrar':
            return (
                <svg {...props}>
                    <path d="M6 6l12 12M18 6 6 18" />
                </svg>
            )
        case 'informacion':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                </svg>
            )
        case 'alerta':
            return (
                <svg {...props}>
                    <path d="M12 3 2.8 20h18.4z" />
                    <path d="M12 9v5M12 17h.01" />
                </svg>
            )
        case 'vuelo':
            return (
                <svg {...props}>
                    <path d="M4 17c4-7 8-10 16-11" />
                    <path d="m12 10 7-4-3 7-2-2-3 1z" />
                    <circle cx="4" cy="17" r="2" />
                </svg>
            )
        case 'pasajero':
            return (
                <svg {...props}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" />
                </svg>
            )
        case 'calendario':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                </svg>
            )
        case 'reloj':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'asiento':
            return (
                <svg {...props}>
                    <path d="M7 11V7a3 3 0 0 1 6 0v4" />
                    <path d="M5 11h10a3 3 0 0 1 3 3v4H7a2 2 0 0 1-2-2z" />
                    <path d="M7 18v3M17 18v3" />
                </svg>
            )
        case 'dinero':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M7 12h.01M17 12h.01" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        case 'aerolinea':
            return (
                <svg {...props}>
                    <path d="M4 20V9l8-5 8 5v11" />
                    <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
                    <path d="M2 20h20" />
                </svg>
            )
        case 'reserva':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                    <path d="m8 15 2.2 2.2L16 12" />
                </svg>
            )
        case 'clase':
            return (
                <svg {...props}>
                    <path d="M4 18h16M6 14h12M8 10h8M10 6h4" />
                </svg>
            )
        case 'documento':
            return (
                <svg {...props}>
                    <rect x="4" y="3" width="16" height="18" rx="2.5" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
            )
        case 'regenerar':
            return (
                <svg {...props}>
                    <path d="M20 7v5h-5" />
                    <path d="M18.5 16a8 8 0 1 1 .8-8" />
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

async function solicitar<T>(
    ruta: string,
    token: string,
    opciones: RequestInit = {},
): Promise<T> {
    const headers = new Headers(opciones.headers)
    headers.set('Authorization', `Bearer ${token}`)

    if (opciones.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers,
    })

    const respuesta = await leerRespuesta(response)

    if (response.status === 401) {
        throw new SesionExpiradaError()
    }

    if (!response.ok) {
        throw new Error(
            obtenerMensaje(
                respuesta,
                'No fue posible completar la operación.',
            ),
        )
    }

    return respuesta as T
}

function normalizarBusqueda(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')
}

function ordenarBoletos(lista: Boleto[]): Boleto[] {
    return [...lista].sort((a, b) => b.idBoleto - a.idBoleto)
}

function ordenarReservas(
    lista: ReservaResumen[],
): ReservaResumen[] {
    return [...lista].sort(
        (a, b) =>
            new Date(a.vueloReserva.fechaHoraSalidaVuelo).getTime() -
            new Date(b.vueloReserva.fechaHoraSalidaVuelo).getTime(),
    )
}

function ordenarAerolineas(
    lista: AerolineaResumen[],
): AerolineaResumen[] {
    return [...lista].sort((a, b) =>
        a.nombreComercialAerolinea.localeCompare(
            b.nombreComercialAerolinea,
            'es',
        ),
    )
}

function etiquetaEstado(estado: EstadoBoleto): string {
    switch (estado) {
        case 'EMITIDO':
            return 'Emitido'
        case 'UTILIZADO':
            return 'Utilizado'
        case 'CANCELADO':
            return 'Cancelado'
    }
}

function etiquetaClase(clase: ClaseBoleto): string {
    switch (clase) {
        case 'ECONOMICA':
            return 'Económica'
        case 'EJECUTIVA':
            return 'Ejecutiva'
        case 'PRIMERA_CLASE':
            return 'Primera clase'
    }
}

function formatearPrecio(precio: number | string): string {
    const valor = Number(precio)

    if (!Number.isFinite(valor)) {
        return '$0,00'
    }

    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(valor)
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
        year: 'numeric',
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

function nombreCompletoPasajero(
    pasajero: PasajeroResumen,
): string {
    return `${pasajero.nombresPasajero} ${pasajero.apellidosPasajero}`
        .trim()
}

function obtenerIniciales(
    pasajero: PasajeroResumen,
): string {
    const primera = pasajero.nombresPasajero.trim().charAt(0)
    const segunda = pasajero.apellidosPasajero.trim().charAt(0)

    return `${primera}${segunda || primera}`.toUpperCase()
}

function esReservaElegible(
    reserva: ReservaResumen,
): boolean {
    const estadoVuelo = reserva.vueloReserva.estadoVuelo
    const vueloAdmiteEmision =
        estadoVuelo === 'PROGRAMADO' ||
        estadoVuelo === 'EMBARQUE'

    return (
        reserva.estadoReserva === 'CONFIRMADA' &&
        reserva.boletoReserva === null &&
        vueloAdmiteEmision &&
        new Date(
            reserva.vueloReserva.fechaHoraSalidaVuelo,
        ).getTime() > Date.now()
    )
}

function generarNumeroBoleto(
    codigoIata?: string,
): string {
    const prefijo =
        codigoIata?.trim().toUpperCase() || 'TKT'
    const sufijo = Date.now()
        .toString(36)
        .slice(-8)
        .toUpperCase()

    return `${prefijo}-${sufijo}`.slice(0, 30)
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudBoletos = solicitar<Boleto[]>(
        '/boletos',
        token,
        { signal },
    )
    const solicitudReservas = solicitar<ReservaResumen[]>(
        '/reservas',
        token,
        { signal },
    )
    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [boletos, reservas, aerolineas] =
        await Promise.all([
            solicitudBoletos,
            solicitudReservas,
            solicitudAerolineas,
        ])

    return {
        boletos: ordenarBoletos(
            Array.isArray(boletos) ? boletos : [],
        ),
        reservas: ordenarReservas(
            Array.isArray(reservas) ? reservas : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function BoletosModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: BoletosModuloProps) {
    const [boletos, setBoletos] = useState<Boleto[]>([])
    const [reservas, setReservas] = useState<
        ReservaResumen[]
    >([])
    const [aerolineas, setAerolineas] = useState<
        AerolineaResumen[]
    >([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('TODOS')
    const [filtroClase, setFiltroClase] =
        useState<FiltroClase>('TODAS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [boletoEdicion, setBoletoEdicion] =
        useState<Boleto | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioBoleto>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [boletoEliminar, setBoletoEliminar] =
        useState<Boleto | null>(null)

    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const esEmpleado = rolUsuario === 'EMPLEADO'
    const puedeCrear =
        rolUsuario === 'SUPERADMIN' ||
        rolUsuario === 'ADMIN_AEROLINEA' ||
        rolUsuario === 'EMPLEADO'
    const puedeEditar = puedeCrear
    const puedeEliminar =
        rolUsuario === 'SUPERADMIN' ||
        rolUsuario === 'ADMIN_AEROLINEA'

    useEffect(() => {
        const controlador = new AbortController()
        let activo = true

        cargarDatosModulo(
            token,
            esSuperadmin,
            controlador.signal,
        )
            .then((datos) => {
                if (!activo) {
                    return
                }

                setBoletos(datos.boletos)
                setReservas(datos.reservas)
                setAerolineas(datos.aerolineas)
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
                            : 'No fue posible cargar los boletos.',
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
    }, [token, esSuperadmin, onSesionExpirada])

    useEffect(() => {
        if (!mensajeExito) {
            return
        }

        const temporizador = window.setTimeout(
            () => setMensajeExito(''),
            3500,
        )

        return () => window.clearTimeout(temporizador)
    }, [mensajeExito])

    const aerolineasActivas = useMemo(
        () =>
            aerolineas.filter(
                (aerolinea) =>
                    aerolinea.estadoAerolinea === 'ACTIVA',
            ),
        [aerolineas],
    )

    const reservasElegibles = useMemo(
        () => reservas.filter(esReservaElegible),
        [reservas],
    )

    const puedeAbrirCreacion = useMemo(() => {
        if (!puedeCrear) {
            return false
        }

        if (!esSuperadmin) {
            return reservasElegibles.length > 0
        }

        return aerolineasActivas.some((aerolinea) =>
            reservasElegibles.some(
                (reserva) =>
                    reserva.fkAerolineaReserva ===
                    aerolinea.idAerolinea,
            ),
        )
    }, [
        puedeCrear,
        esSuperadmin,
        reservasElegibles,
        aerolineasActivas,
    ])

    const boletosFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return boletos.filter((boleto) => {
            if (
                filtroEstado !== 'TODOS' &&
                boleto.estadoBoleto !== filtroEstado
            ) {
                return false
            }

            if (
                filtroClase !== 'TODAS' &&
                boleto.claseBoleto !== filtroClase
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                boleto.fkAerolineaBoleto !==
                Number(filtroAerolinea)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            const reserva = boleto.reservaBoleto
            const vuelo = reserva.vueloReserva
            const pasajero = reserva.pasajeroReserva

            return normalizarBusqueda(
                [
                    boleto.numeroBoleto,
                    boleto.asientoBoleto,
                    etiquetaClase(boleto.claseBoleto),
                    boleto.aerolineaBoleto
                        .nombreComercialAerolinea,
                    boleto.aerolineaBoleto
                        .codigoIataAerolinea,
                    reserva.codigoReserva,
                    vuelo.numeroVuelo,
                    vuelo.rutaVuelo.codigoRuta,
                    vuelo.rutaVuelo.aeropuertoOrigenRuta
                        .codigoIataAeropuerto,
                    vuelo.rutaVuelo.aeropuertoDestinoRuta
                        .codigoIataAeropuerto,
                    nombreCompletoPasajero(pasajero),
                    pasajero.numeroDocumentoPasajero,
                ].join(' '),
            ).includes(texto)
        })
    }, [
        boletos,
        busqueda,
        filtroEstado,
        filtroClase,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const emitidos = boletos.filter(
            (boleto) => boleto.estadoBoleto === 'EMITIDO',
        ).length
        const utilizados = boletos.filter(
            (boleto) => boleto.estadoBoleto === 'UTILIZADO',
        ).length
        const cancelados = boletos.filter(
            (boleto) => boleto.estadoBoleto === 'CANCELADO',
        ).length

        return {
            total: boletos.length,
            emitidos,
            utilizados,
            cancelados,
        }
    }, [boletos])

    const idAerolineaFormulario = useMemo(() => {
        if (boletoEdicion) {
            return boletoEdicion.fkAerolineaBoleto
        }

        if (esSuperadmin) {
            return formulario.fkAerolineaBoleto
                ? Number(formulario.fkAerolineaBoleto)
                : null
        }

        return reservasElegibles[0]?.fkAerolineaReserva ?? null
    }, [
        boletoEdicion,
        esSuperadmin,
        formulario.fkAerolineaBoleto,
        reservasElegibles,
    ])

    const reservasFormulario = useMemo(
        () =>
            reservasElegibles.filter(
                (reserva) =>
                    idAerolineaFormulario === null ||
                    reserva.fkAerolineaReserva ===
                    idAerolineaFormulario,
            ),
        [reservasElegibles, idAerolineaFormulario],
    )

    const reservaSeleccionada = useMemo(
        () =>
            reservas.find(
                (reserva) =>
                    reserva.idReserva ===
                    Number(formulario.fkReservaBoleto),
            ) ?? null,
        [reservas, formulario.fkReservaBoleto],
    )

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

            setBoletos(datos.boletos)
            setReservas(datos.reservas)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar los boletos.',
            )
        } finally {
            setCargando(false)
        }
    }

    function crearFormularioDesdeReserva(
        reserva: ReservaResumen | undefined,
        idAerolinea: number | null,
    ): FormularioBoleto {
        const aerolinea =
            reserva?.aerolineaReserva ??
            aerolineas.find(
                (elemento) =>
                    elemento.idAerolinea === idAerolinea,
            )

        return {
            ...formularioInicial,
            fkAerolineaBoleto:
                idAerolinea === null
                    ? ''
                    : String(idAerolinea),
            fkReservaBoleto: reserva
                ? String(reserva.idReserva)
                : '',
            numeroBoleto: reserva
                ? generarNumeroBoleto(
                    aerolinea?.codigoIataAerolinea,
                )
                : '',
            precioFinalBoleto: reserva
                ? String(reserva.totalReserva)
                : '',
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        let idAerolinea: number | null = null

        if (esSuperadmin) {
            const aerolineaConReserva =
                aerolineasActivas.find((aerolinea) =>
                    reservasElegibles.some(
                        (reserva) =>
                            reserva.fkAerolineaReserva ===
                            aerolinea.idAerolinea,
                    ),
                )

            idAerolinea =
                aerolineasActivas.length === 1
                    ? aerolineasActivas[0].idAerolinea
                    : aerolineaConReserva?.idAerolinea ?? null
        } else {
            idAerolinea =
                reservasElegibles[0]?.fkAerolineaReserva ??
                null
        }

        const primeraReserva = reservasElegibles.find(
            (reserva) =>
                idAerolinea === null ||
                reserva.fkAerolineaReserva === idAerolinea,
        )

        setBoletoEdicion(null)
        setFormulario(
            crearFormularioDesdeReserva(
                primeraReserva,
                idAerolinea,
            ),
        )
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(boleto: Boleto) {
        if (boleto.estadoBoleto === 'UTILIZADO') {
            return
        }

        setBoletoEdicion(boleto)
        setFormulario({
            fkAerolineaBoleto: String(
                boleto.fkAerolineaBoleto,
            ),
            fkReservaBoleto: String(
                boleto.fkReservaBoleto,
            ),
            numeroBoleto: boleto.numeroBoleto,
            asientoBoleto: boleto.asientoBoleto,
            claseBoleto: boleto.claseBoleto,
            precioFinalBoleto: String(
                boleto.precioFinalBoleto,
            ),
            estadoBoleto: boleto.estadoBoleto,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setBoletoEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioBoleto>(
        campo: K,
        valor: FormularioBoleto[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function cambiarAerolinea(idAerolinea: string) {
        const idNumerico = idAerolinea
            ? Number(idAerolinea)
            : null
        const primeraReserva = reservasElegibles.find(
            (reserva) =>
                idNumerico !== null &&
                reserva.fkAerolineaReserva === idNumerico,
        )

        setFormulario(
            crearFormularioDesdeReserva(
                primeraReserva,
                idNumerico,
            ),
        )
    }

    function cambiarReserva(idReserva: string) {
        const reserva = reservasElegibles.find(
            (elemento) =>
                elemento.idReserva === Number(idReserva),
        )

        setFormulario((actual) => ({
            ...actual,
            fkReservaBoleto: idReserva,
            numeroBoleto: reserva
                ? generarNumeroBoleto(
                    reserva.aerolineaReserva
                        .codigoIataAerolinea,
                )
                : '',
            precioFinalBoleto: reserva
                ? String(reserva.totalReserva)
                : '',
        }))
    }

    function regenerarNumeroBoleto() {
        const aerolinea =
            reservaSeleccionada?.aerolineaReserva ??
            aerolineas.find(
                (elemento) =>
                    elemento.idAerolinea ===
                    idAerolineaFormulario,
            )

        cambiarCampo(
            'numeroBoleto',
            generarNumeroBoleto(
                aerolinea?.codigoIataAerolinea,
            ),
        )
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            boletoEdicion === null &&
            !formulario.fkAerolineaBoleto
        ) {
            return 'Selecciona la aerolínea propietaria del boleto.'
        }

        if (
            boletoEdicion === null &&
            !formulario.fkReservaBoleto
        ) {
            return 'Selecciona una reserva confirmada.'
        }

        if (
            !/^[A-Z0-9-]{5,30}$/.test(
                formulario.numeroBoleto,
            )
        ) {
            return 'El número del boleto debe tener entre 5 y 30 caracteres y usar solo letras, números o guiones.'
        }

        if (
            !/^[1-9][0-9]{0,2}[A-Z]$/.test(
                formulario.asientoBoleto,
            )
        ) {
            return 'El asiento debe tener un formato válido, por ejemplo 8A o 25C.'
        }

        const precio = Number(formulario.precioFinalBoleto)

        if (
            !Number.isFinite(precio) ||
            precio < 0 ||
            precio > 99999999.99
        ) {
            return 'El precio final debe estar entre 0 y 99999999.99.'
        }

        const decimales =
            formulario.precioFinalBoleto.split('.')[1]

        if (decimales && decimales.length > 2) {
            return 'El precio final puede tener máximo 2 decimales.'
        }

        if (
            boletoEdicion?.estadoBoleto === 'CANCELADO' &&
            formulario.estadoBoleto !== 'CANCELADO'
        ) {
            return 'Un boleto CANCELADO no puede volver a activarse.'
        }

        return null
    }

    async function guardar(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault()

        const errorValidacion = validarFormulario()

        if (errorValidacion) {
            setErrorFormulario(errorValidacion)
            return
        }

        setGuardando(true)
        setErrorFormulario('')

        const esEdicion = boletoEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                fkReservaBoleto: Number(
                    formulario.fkReservaBoleto,
                ),
                numeroBoleto:
                    formulario.numeroBoleto.trim(),
                asientoBoleto:
                    formulario.asientoBoleto.trim(),
                claseBoleto: formulario.claseBoleto,
                precioFinalBoleto: Number(
                    formulario.precioFinalBoleto,
                ),
                estadoBoleto: 'EMITIDO' as EstadoBoleto,
                ...(esSuperadmin
                    ? {
                        fkAerolineaBoleto: Number(
                            formulario.fkAerolineaBoleto,
                        ),
                    }
                    : {}),
            }
        } else {
            datos = {}

            if (
                formulario.numeroBoleto.trim() !==
                boletoEdicion.numeroBoleto
            ) {
                datos.numeroBoleto =
                    formulario.numeroBoleto.trim()
            }

            if (
                formulario.asientoBoleto.trim() !==
                boletoEdicion.asientoBoleto
            ) {
                datos.asientoBoleto =
                    formulario.asientoBoleto.trim()
            }

            if (
                formulario.claseBoleto !==
                boletoEdicion.claseBoleto
            ) {
                datos.claseBoleto = formulario.claseBoleto
            }

            if (
                Number(formulario.precioFinalBoleto) !==
                Number(boletoEdicion.precioFinalBoleto)
            ) {
                datos.precioFinalBoleto = Number(
                    formulario.precioFinalBoleto,
                )
            }

            if (
                formulario.estadoBoleto !==
                boletoEdicion.estadoBoleto
            ) {
                datos.estadoBoleto =
                    formulario.estadoBoleto
            }

            if (Object.keys(datos).length === 0) {
                setGuardando(false)
                setErrorFormulario(
                    'No existen cambios para guardar.',
                )
                return
            }
        }

        try {
            const boletoGuardado = await solicitar<Boleto>(
                esEdicion
                    ? `/boletos/${boletoEdicion.idBoleto}`
                    : '/boletos',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setBoletos((lista) =>
                ordenarBoletos([
                    ...lista.filter(
                        (boleto) =>
                            boleto.idBoleto !==
                            boletoGuardado.idBoleto,
                    ),
                    boletoGuardado,
                ]),
            )

            if (!esEdicion) {
                setReservas((lista) =>
                    lista.map((reserva) =>
                        reserva.idReserva ===
                            boletoGuardado.fkReservaBoleto
                            ? {
                                ...reserva,
                                boletoReserva: {
                                    idBoleto:
                                        boletoGuardado.idBoleto,
                                    numeroBoleto:
                                        boletoGuardado.numeroBoleto,
                                    asientoBoleto:
                                        boletoGuardado.asientoBoleto,
                                    claseBoleto:
                                        boletoGuardado.claseBoleto,
                                    estadoBoleto:
                                        boletoGuardado.estadoBoleto,
                                },
                            }
                            : reserva,
                    ),
                )
            }

            setFormularioAbierto(false)
            setBoletoEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Boleto actualizado correctamente.'
                    : 'Boleto emitido correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el boleto.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!boletoEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(
                `/boletos/${boletoEliminar.idBoleto}`,
                token,
                { method: 'DELETE' },
            )

            setBoletos((lista) =>
                lista.filter(
                    (boleto) =>
                        boleto.idBoleto !==
                        boletoEliminar.idBoleto,
                ),
            )
            setReservas((lista) =>
                lista.map((reserva) =>
                    reserva.idReserva ===
                        boletoEliminar.fkReservaBoleto
                        ? {
                            ...reserva,
                            boletoReserva: null,
                        }
                        : reserva,
                ),
            )
            setBoletoEliminar(null)
            setMensajeExito(
                'Boleto eliminado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el boleto.',
            )
            setBoletoEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="boletos-modulo">
            <header className="boletos-cabecera">
                <div className="boletos-cabecera__texto">
                    <span className="boletos-etiqueta">
                        Emisión y control
                    </span>
                    <h2>Gestión de Boletos</h2>
                    <p>
                        Emite documentos de viaje, asigna
                        asientos y controla su estado dentro
                        de cada tenant.
                    </p>
                </div>

                <div className="boletos-cabecera__acciones">
                    <button
                        type="button"
                        className="boletos-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        ACTUALIZAR
                    </button>

                    {puedeCrear && (
                        <button
                            type="button"
                            className="boletos-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Emitir un nuevo boleto'
                                    : 'Se necesita una reserva confirmada, sin boleto y con vuelo futuro'
                            }
                        >
                            <Icono nombre="agregar" />
                            NUEVO BOLETO
                        </button>
                    )}
                </div>
            </header>

            {esEmpleado && (
                <div className="boletos-aviso boletos-aviso--operacion">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>
                            Emisión de boletos habilitada
                        </strong>
                        <span>
                            Puedes emitir y actualizar boletos
                            de {nombreAerolinea}. La eliminación
                            corresponde a los administradores.
                        </span>
                    </div>
                </div>
            )}

            {puedeCrear &&
                !puedeAbrirCreacion &&
                !cargando && (
                    <div className="boletos-aviso boletos-aviso--advertencia">
                        <Icono nombre="alerta" tamano={21} />
                        <div>
                            <strong>
                                No hay reservas listas para emisión
                            </strong>
                            <span>
                                Debe existir una reserva CONFIRMADA,
                                sin boleto y con un vuelo futuro en
                                estado PROGRAMADO o EMBARQUE.
                            </span>
                        </div>
                    </div>
                )}

            {mensajeExito && (
                <div className="boletos-mensaje boletos-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="boletos-mensaje boletos-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="boletos-resumen">
                <article>
                    <span>Total de boletos</span>
                    <strong>{resumen.total}</strong>
                    <small>Documentos registrados</small>
                </article>
                <article>
                    <span>Emitidos</span>
                    <strong>{resumen.emitidos}</strong>
                    <small className="boletos-texto-emitido">
                        Vigentes para viaje
                    </small>
                </article>
                <article>
                    <span>Utilizados</span>
                    <strong>{resumen.utilizados}</strong>
                    <small>Viajes completados</small>
                </article>
                <article>
                    <span>Cancelados</span>
                    <strong>{resumen.cancelados}</strong>
                    <small>Documentos anulados</small>
                </article>
            </div>

            <section className="boletos-catalogo">
                <div className="boletos-filtros">
                    <label className="boletos-buscador">
                        <Icono nombre="buscar" tamano={20} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(
                                    evento.target.value,
                                )
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por boleto, reserva, pasajero, vuelo, asiento o aerolínea'
                                    : 'Buscar por boleto, reserva, pasajero, vuelo o asiento'
                            }
                        />
                    </label>

                    <label className="boletos-selector-filtro">
                        <span>Estado</span>
                        <select
                            value={filtroEstado}
                            onChange={(evento) =>
                                setFiltroEstado(
                                    evento.target
                                        .value as FiltroEstado,
                                )
                            }
                        >
                            <option value="TODOS">
                                Todos
                            </option>
                            {estadosBoleto.map((estado) => (
                                <option
                                    key={estado}
                                    value={estado}
                                >
                                    {etiquetaEstado(estado)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="boletos-selector-filtro">
                        <span>Clase</span>
                        <select
                            value={filtroClase}
                            onChange={(evento) =>
                                setFiltroClase(
                                    evento.target
                                        .value as FiltroClase,
                                )
                            }
                        >
                            <option value="TODAS">
                                Todas
                            </option>
                            {clasesBoleto.map((clase) => (
                                <option
                                    key={clase}
                                    value={clase}
                                >
                                    {etiquetaClase(clase)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="boletos-selector-filtro">
                            <span>Aerolínea</span>
                            <select
                                value={filtroAerolinea}
                                onChange={(evento) =>
                                    setFiltroAerolinea(
                                        evento.target.value,
                                    )
                                }
                            >
                                <option value="TODAS">
                                    Todas
                                </option>
                                {aerolineas.map((aerolinea) => (
                                    <option
                                        key={
                                            aerolinea.idAerolinea
                                        }
                                        value={
                                            aerolinea.idAerolinea
                                        }
                                    >
                                        {
                                            aerolinea.nombreComercialAerolinea
                                        }
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <span className="boletos-resultados">
                        {boletosFiltrados.length}{' '}
                        {boletosFiltrados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="boletos-estado-vacio">
                        <span className="boletos-cargador" />
                        <strong>Cargando boletos</strong>
                        <p>
                            Consultando los documentos emitidos.
                        </p>
                    </div>
                ) : boletosFiltrados.length === 0 ? (
                    <div className="boletos-estado-vacio">
                        <span className="boletos-estado-vacio__icono">
                            <Icono
                                nombre="boleto"
                                tamano={35}
                            />
                        </span>
                        <strong>
                            {boletos.length === 0
                                ? 'No existen boletos emitidos'
                                : 'No hay boletos que coincidan con los filtros'}
                        </strong>
                        <p>
                            {boletos.length === 0
                                ? 'El catálogo todavía no contiene documentos de viaje.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {boletos.length === 0 &&
                            puedeAbrirCreacion && (
                                <button
                                    type="button"
                                    className="boletos-boton-principal"
                                    onClick={abrirCreacion}
                                >
                                    <Icono nombre="agregar" />
                                    Emitir el primero
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="boletos-tabla-contenedor">
                        <table className="boletos-tabla">
                            <thead>
                                <tr>
                                    <th>Boleto</th>
                                    <th>Pasajero y reserva</th>
                                    <th>Vuelo</th>
                                    <th>Asiento y clase</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boletosFiltrados.map(
                                    (boleto) => {
                                        const reserva =
                                            boleto.reservaBoleto
                                        const pasajero =
                                            reserva.pasajeroReserva
                                        const vuelo =
                                            reserva.vueloReserva

                                        return (
                                            <tr
                                                key={
                                                    boleto.idBoleto
                                                }
                                            >
                                                <td data-label="Boleto">
                                                    <div className="boletos-identidad">
                                                        <span className="boletos-identidad__icono">
                                                            <Icono
                                                                nombre="boleto"
                                                                tamano={
                                                                    21
                                                                }
                                                            />
                                                        </span>
                                                        <div>
                                                            <strong>
                                                                {
                                                                    boleto.numeroBoleto
                                                                }
                                                            </strong>
                                                            <span>
                                                                ID #
                                                                {
                                                                    boleto.idBoleto
                                                                }
                                                            </span>
                                                            {esSuperadmin && (
                                                                <small>
                                                                    {
                                                                        boleto
                                                                            .aerolineaBoleto
                                                                            .nombreComercialAerolinea
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td data-label="Pasajero y reserva">
                                                    <div className="boletos-pasajero">
                                                        <span className="boletos-pasajero__avatar">
                                                            {obtenerIniciales(
                                                                pasajero,
                                                            )}
                                                        </span>
                                                        <div>
                                                            <strong>
                                                                {nombreCompletoPasajero(
                                                                    pasajero,
                                                                )}
                                                            </strong>
                                                            <span>
                                                                {
                                                                    pasajero.numeroDocumentoPasajero
                                                                }
                                                            </span>
                                                            <small>
                                                                Reserva{' '}
                                                                {
                                                                    reserva.codigoReserva
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td data-label="Vuelo">
                                                    <div className="boletos-vuelo">
                                                        <div>
                                                            <Icono
                                                                nombre="vuelo"
                                                                tamano={
                                                                    17
                                                                }
                                                            />
                                                            <strong>
                                                                {
                                                                    vuelo.numeroVuelo
                                                                }
                                                            </strong>
                                                        </div>
                                                        <span>
                                                            {
                                                                vuelo
                                                                    .rutaVuelo
                                                                    .aeropuertoOrigenRuta
                                                                    .codigoIataAeropuerto
                                                            }{' '}
                                                            →{' '}
                                                            {
                                                                vuelo
                                                                    .rutaVuelo
                                                                    .aeropuertoDestinoRuta
                                                                    .codigoIataAeropuerto
                                                            }
                                                        </span>
                                                        <small>
                                                            {formatearFecha(
                                                                vuelo.fechaHoraSalidaVuelo,
                                                            )}{' '}
                                                            ·{' '}
                                                            {formatearHora(
                                                                vuelo.fechaHoraSalidaVuelo,
                                                            )}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td data-label="Asiento y clase">
                                                    <div className="boletos-asiento">
                                                        <span className="boletos-asiento__numero">
                                                            {
                                                                boleto.asientoBoleto
                                                            }
                                                        </span>
                                                        <div>
                                                            <strong>
                                                                {etiquetaClase(
                                                                    boleto.claseBoleto,
                                                                )}
                                                            </strong>
                                                            <span>
                                                                {formatearPrecio(
                                                                    boleto.precioFinalBoleto,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td data-label="Estado">
                                                    <span
                                                        className={`boletos-insignia boletos-insignia--${boleto.estadoBoleto.toLowerCase()}`}
                                                    >
                                                        <i />
                                                        {etiquetaEstado(
                                                            boleto.estadoBoleto,
                                                        )}
                                                    </span>
                                                </td>

                                                <td data-label="Acciones">
                                                    <div className="boletos-acciones-fila">
                                                        {puedeEditar &&
                                                            boleto.estadoBoleto !==
                                                            'UTILIZADO' && (
                                                                <button
                                                                    type="button"
                                                                    className="boletos-boton-icono"
                                                                    onClick={() =>
                                                                        abrirEdicion(
                                                                            boleto,
                                                                        )
                                                                    }
                                                                    aria-label={`Editar boleto ${boleto.numeroBoleto}`}
                                                                    title="Editar boleto"
                                                                >
                                                                    <Icono
                                                                        nombre="editar"
                                                                        tamano={
                                                                            19
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {puedeEliminar &&
                                                            boleto.estadoBoleto ===
                                                            'CANCELADO' && (
                                                                <button
                                                                    type="button"
                                                                    className="boletos-boton-icono boletos-boton-icono--peligro"
                                                                    onClick={() =>
                                                                        setBoletoEliminar(
                                                                            boleto,
                                                                        )
                                                                    }
                                                                    aria-label={`Eliminar boleto ${boleto.numeroBoleto}`}
                                                                    title="Eliminar boleto cancelado"
                                                                >
                                                                    <Icono
                                                                        nombre="eliminar"
                                                                        tamano={
                                                                            19
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {boleto.estadoBoleto ===
                                                            'UTILIZADO' && (
                                                                <span className="boletos-accion-bloqueada">
                                                                    Cerrado
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div
                    className="boletos-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target ===
                            evento.currentTarget
                        ) {
                            cerrarFormulario()
                        }
                    }}
                >
                    <section
                        className="boletos-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="boletos-formulario-titulo"
                    >
                        <header className="boletos-modal__cabecera">
                            <div className="boletos-modal__titulo">
                                <span className="boletos-modal__icono">
                                    <Icono
                                        nombre="boleto"
                                        tamano={24}
                                    />
                                </span>
                                <div>
                                    <span>
                                        {boletoEdicion
                                            ? 'Actualización del documento'
                                            : 'Nueva emisión'}
                                    </span>
                                    <h3 id="boletos-formulario-titulo">
                                        {boletoEdicion
                                            ? `Editar ${boletoEdicion.numeroBoleto}`
                                            : 'Emitir boleto'}
                                    </h3>
                                    <p>
                                        Relaciona la reserva,
                                        asigna el asiento y define
                                        la tarifa final.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="boletos-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono
                                    nombre="cerrar"
                                    tamano={23}
                                />
                            </button>
                        </header>

                        <form
                            className="boletos-formulario"
                            onSubmit={guardar}
                        >
                            {esSuperadmin &&
                                boletoEdicion === null ? (
                                <label className="boletos-campo boletos-campo--completo">
                                    <span>
                                        Aerolínea propietaria
                                    </span>
                                    <select
                                        value={
                                            formulario.fkAerolineaBoleto
                                        }
                                        onChange={(evento) =>
                                            cambiarAerolinea(
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">
                                            Selecciona una aerolínea
                                        </option>
                                        {aerolineasActivas.map(
                                            (aerolinea) => (
                                                <option
                                                    key={
                                                        aerolinea.idAerolinea
                                                    }
                                                    value={
                                                        aerolinea.idAerolinea
                                                    }
                                                    disabled={
                                                        !reservasElegibles.some(
                                                            (
                                                                reserva,
                                                            ) =>
                                                                reserva.fkAerolineaReserva ===
                                                                aerolinea.idAerolinea,
                                                        )
                                                    }
                                                >
                                                    {
                                                        aerolinea.nombreComercialAerolinea
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        aerolinea.codigoIataAerolinea
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>
                            ) : (
                                <div className="boletos-propietario">
                                    <Icono
                                        nombre="aerolinea"
                                        tamano={20}
                                    />
                                    <div>
                                        <span>
                                            Aerolínea propietaria
                                        </span>
                                        <strong>
                                            {boletoEdicion
                                                ? boletoEdicion
                                                    .aerolineaBoleto
                                                    .nombreComercialAerolinea
                                                : nombreAerolinea}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            {boletoEdicion === null ? (
                                <label className="boletos-campo boletos-campo--completo">
                                    <span>
                                        Reserva confirmada
                                    </span>
                                    <select
                                        value={
                                            formulario.fkReservaBoleto
                                        }
                                        onChange={(evento) =>
                                            cambiarReserva(
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando ||
                                            (esSuperadmin &&
                                                !formulario.fkAerolineaBoleto)
                                        }
                                    >
                                        <option value="">
                                            Selecciona una reserva
                                        </option>
                                        {reservasFormulario.map(
                                            (reserva) => (
                                                <option
                                                    key={
                                                        reserva.idReserva
                                                    }
                                                    value={
                                                        reserva.idReserva
                                                    }
                                                >
                                                    {
                                                        reserva.codigoReserva
                                                    }{' '}
                                                    ·{' '}
                                                    {nombreCompletoPasajero(
                                                        reserva.pasajeroReserva,
                                                    )}{' '}
                                                    ·{' '}
                                                    {
                                                        reserva
                                                            .vueloReserva
                                                            .numeroVuelo
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <small>
                                        Solo aparecen reservas
                                        confirmadas, sin boleto y con
                                        vuelo futuro.
                                    </small>
                                </label>
                            ) : (
                                <div className="boletos-reserva-fija">
                                    <Icono
                                        nombre="reserva"
                                        tamano={20}
                                    />
                                    <div>
                                        <span>
                                            Reserva relacionada
                                        </span>
                                        <strong>
                                            {
                                                boletoEdicion
                                                    .reservaBoleto
                                                    .codigoReserva
                                            }
                                        </strong>
                                        <small>
                                            La reserva no puede
                                            cambiarse después de emitir
                                            el boleto.
                                        </small>
                                    </div>
                                </div>
                            )}

                            {(reservaSeleccionada ||
                                boletoEdicion) && (
                                    <div className="boletos-vista-previa">
                                        <div className="boletos-vista-previa__pasajero">
                                            <span className="boletos-pasajero__avatar">
                                                {obtenerIniciales(
                                                    reservaSeleccionada
                                                        ?.pasajeroReserva ??
                                                    boletoEdicion!
                                                        .reservaBoleto
                                                        .pasajeroReserva,
                                                )}
                                            </span>
                                            <div>
                                                <span>Pasajero</span>
                                                <strong>
                                                    {nombreCompletoPasajero(
                                                        reservaSeleccionada
                                                            ?.pasajeroReserva ??
                                                        boletoEdicion!
                                                            .reservaBoleto
                                                            .pasajeroReserva,
                                                    )}
                                                </strong>
                                                <small>
                                                    {
                                                        (
                                                            reservaSeleccionada
                                                                ?.pasajeroReserva ??
                                                            boletoEdicion!
                                                                .reservaBoleto
                                                                .pasajeroReserva
                                                        )
                                                            .numeroDocumentoPasajero
                                                    }
                                                </small>
                                            </div>
                                        </div>

                                        <div className="boletos-vista-previa__vuelo">
                                            <span>Vuelo</span>
                                            <strong>
                                                {
                                                    (
                                                        reservaSeleccionada
                                                            ?.vueloReserva ??
                                                        boletoEdicion!
                                                            .reservaBoleto
                                                            .vueloReserva
                                                    ).numeroVuelo
                                                }
                                            </strong>
                                            <small>
                                                {
                                                    (
                                                        reservaSeleccionada
                                                            ?.vueloReserva ??
                                                        boletoEdicion!
                                                            .reservaBoleto
                                                            .vueloReserva
                                                    ).rutaVuelo
                                                        .aeropuertoOrigenRuta
                                                        .codigoIataAeropuerto
                                                }{' '}
                                                →{' '}
                                                {
                                                    (
                                                        reservaSeleccionada
                                                            ?.vueloReserva ??
                                                        boletoEdicion!
                                                            .reservaBoleto
                                                            .vueloReserva
                                                    ).rutaVuelo
                                                        .aeropuertoDestinoRuta
                                                        .codigoIataAeropuerto
                                                }
                                            </small>
                                        </div>

                                        <div className="boletos-vista-previa__fecha">
                                            <Icono
                                                nombre="calendario"
                                                tamano={18}
                                            />
                                            <div>
                                                <span>Salida</span>
                                                <strong>
                                                    {formatearFecha(
                                                        (
                                                            reservaSeleccionada
                                                                ?.vueloReserva ??
                                                            boletoEdicion!
                                                                .reservaBoleto
                                                                .vueloReserva
                                                        )
                                                            .fechaHoraSalidaVuelo,
                                                    )}
                                                </strong>
                                                <small>
                                                    {formatearHora(
                                                        (
                                                            reservaSeleccionada
                                                                ?.vueloReserva ??
                                                            boletoEdicion!
                                                                .reservaBoleto
                                                                .vueloReserva
                                                        )
                                                            .fechaHoraSalidaVuelo,
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="boletos-formulario__rejilla">
                                <label className="boletos-campo">
                                    <span>
                                        Número de boleto
                                    </span>
                                    <div className="boletos-campo-codigo">
                                        <input
                                            type="text"
                                            value={
                                                formulario.numeroBoleto
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'numeroBoleto',
                                                    evento.target.value
                                                        .toUpperCase()
                                                        .replace(
                                                            /[^A-Z0-9-]/g,
                                                            '',
                                                        ),
                                                )
                                            }
                                            placeholder="DJ-TKT001"
                                            minLength={5}
                                            maxLength={30}
                                            required
                                            disabled={guardando}
                                        />
                                        <button
                                            type="button"
                                            onClick={
                                                regenerarNumeroBoleto
                                            }
                                            disabled={
                                                guardando ||
                                                (!reservaSeleccionada &&
                                                    !boletoEdicion)
                                            }
                                            aria-label="Generar otro número de boleto"
                                            title="Generar otro número"
                                        >
                                            <Icono
                                                nombre="regenerar"
                                                tamano={18}
                                            />
                                        </button>
                                    </div>
                                    <small>
                                        Único dentro de la
                                        aerolínea.
                                    </small>
                                </label>

                                <label className="boletos-campo">
                                    <span>Asiento</span>
                                    <div className="boletos-campo-con-icono">
                                        <Icono
                                            nombre="asiento"
                                            tamano={19}
                                        />
                                        <input
                                            type="text"
                                            value={
                                                formulario.asientoBoleto
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'asientoBoleto',
                                                    evento.target.value
                                                        .toUpperCase()
                                                        .replace(
                                                            /[^0-9A-Z]/g,
                                                            '',
                                                        )
                                                        .slice(
                                                            0,
                                                            4,
                                                        ),
                                                )
                                            }
                                            placeholder="8A"
                                            minLength={2}
                                            maxLength={4}
                                            required
                                            disabled={guardando}
                                        />
                                    </div>
                                    <small>
                                        Debe estar libre en el
                                        vuelo.
                                    </small>
                                </label>
                            </div>

                            <div className="boletos-formulario__rejilla">
                                <label className="boletos-campo">
                                    <span>Clase</span>
                                    <select
                                        value={
                                            formulario.claseBoleto
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'claseBoleto',
                                                evento.target
                                                    .value as ClaseBoleto,
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        {clasesBoleto.map(
                                            (clase) => (
                                                <option
                                                    key={clase}
                                                    value={clase}
                                                >
                                                    {etiquetaClase(
                                                        clase,
                                                    )}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="boletos-campo">
                                    <span>Precio final</span>
                                    <div className="boletos-campo-con-unidad">
                                        <span>$</span>
                                        <input
                                            type="number"
                                            value={
                                                formulario.precioFinalBoleto
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'precioFinalBoleto',
                                                    evento.target.value,
                                                )
                                            }
                                            min="0"
                                            max="99999999.99"
                                            step="0.01"
                                            placeholder="79.90"
                                            required
                                            disabled={guardando}
                                        />
                                        <small>USD</small>
                                    </div>
                                    <small>
                                        Se propone el total de la
                                        reserva.
                                    </small>
                                </label>
                            </div>

                            <label className="boletos-campo boletos-campo--completo">
                                <span>Estado</span>
                                <select
                                    value={
                                        formulario.estadoBoleto
                                    }
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'estadoBoleto',
                                            evento.target
                                                .value as EstadoBoleto,
                                        )
                                    }
                                    disabled={
                                        guardando ||
                                        boletoEdicion === null
                                    }
                                >
                                    {(
                                        boletoEdicion
                                            ?.estadoBoleto ===
                                            'CANCELADO'
                                            ? [
                                                'CANCELADO',
                                            ]
                                            : estadosBoleto
                                    ).map((estado) => (
                                        <option
                                            key={estado}
                                            value={estado}
                                        >
                                            {etiquetaEstado(
                                                estado as EstadoBoleto,
                                            )}
                                        </option>
                                    ))}
                                </select>
                                <small>
                                    {boletoEdicion === null
                                        ? 'Los boletos nuevos se registran como EMITIDOS.'
                                        : 'Los boletos utilizados no pueden modificarse y los cancelados no pueden reactivarse.'}
                                </small>
                            </label>

                            {errorFormulario && (
                                <div
                                    className="boletos-mensaje boletos-mensaje--error"
                                    role="alert"
                                >
                                    <Icono
                                        nombre="alerta"
                                        tamano={19}
                                    />
                                    <span>
                                        {errorFormulario}
                                    </span>
                                </div>
                            )}

                            <footer className="boletos-modal__acciones">
                                <button
                                    type="button"
                                    className="boletos-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="boletos-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="boletos-cargador boletos-cargador--boton" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    boletoEdicion
                                                        ? 'editar'
                                                        : 'agregar'
                                                }
                                            />
                                            {boletoEdicion
                                                ? 'Guardar cambios'
                                                : 'Emitir boleto'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {boletoEliminar && (
                <div
                    className="boletos-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target ===
                            evento.currentTarget
                        ) {
                            setBoletoEliminar(null)
                        }
                    }}
                >
                    <section
                        className="boletos-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="boletos-eliminar-titulo"
                    >
                        <span className="boletos-confirmacion__icono">
                            <Icono
                                nombre="eliminar"
                                tamano={26}
                            />
                        </span>
                        <span className="boletos-etiqueta">
                            Eliminar documento
                        </span>
                        <h3 id="boletos-eliminar-titulo">
                            ¿Eliminar{' '}
                            {boletoEliminar.numeroBoleto}?
                        </h3>
                        <p>
                            Esta acción elimina definitivamente
                            el boleto cancelado. La reserva
                            quedará disponible para una nueva
                            emisión.
                        </p>
                        <div className="boletos-confirmacion__detalle">
                            <strong>
                                {
                                    boletoEliminar
                                        .reservaBoleto
                                        .pasajeroReserva
                                        .nombresPasajero
                                }{' '}
                                {
                                    boletoEliminar
                                        .reservaBoleto
                                        .pasajeroReserva
                                        .apellidosPasajero
                                }
                            </strong>
                            <span>
                                Reserva{' '}
                                {
                                    boletoEliminar
                                        .reservaBoleto
                                        .codigoReserva
                                }{' '}
                                · Asiento{' '}
                                {
                                    boletoEliminar.asientoBoleto
                                }
                            </span>
                        </div>
                        <div className="boletos-confirmacion__acciones">
                            <button
                                type="button"
                                className="boletos-boton-secundario"
                                onClick={() =>
                                    setBoletoEliminar(null)
                                }
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="boletos-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                <Icono nombre="eliminar" />
                                {eliminando
                                    ? 'Eliminando'
                                    : 'Eliminar boleto'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

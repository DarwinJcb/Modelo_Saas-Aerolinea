/* saas-frontend/src/modules/reservas/ReservasModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './ReservasModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
type EstadoVuelo =
    | 'PROGRAMADO'
    | 'EMBARQUE'
    | 'EN_VUELO'
    | 'FINALIZADO'
    | 'CANCELADO'
type FiltroEstado = 'TODAS' | EstadoReserva
type FiltroPeriodo = 'TODOS' | 'PROXIMOS' | 'PASADOS'

type IconoNombre =
    | 'reserva'
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
    | 'dinero'
    | 'aerolinea'
    | 'boleto'
    | 'usuario'
    | 'asientos'
    | 'documento'

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

interface AvionResumen {
    idAvion: number
    matriculaAvion: string
    modeloAvion: string
    capacidadAvion: number
    estadoAvion: string
}

interface VueloResumen {
    idVuelo: number
    fkAerolineaVuelo?: number
    numeroVuelo: string
    fechaHoraSalidaVuelo: string
    fechaHoraLlegadaVuelo: string
    precioBaseVuelo: number | string
    estadoVuelo: EstadoVuelo
    rutaVuelo: RutaResumen
    avionVuelo: AvionResumen
    aerolineaVuelo?: AerolineaResumen
}

interface PasajeroResumen {
    idPasajero: number
    fkAerolineaPasajero?: number
    tipoDocumentoPasajero: string
    numeroDocumentoPasajero: string
    nombresPasajero: string
    apellidosPasajero: string
    correoPasajero: string | null
    telefonoPasajero: string | null
    aerolineaPasajero?: AerolineaResumen
}

interface UsuarioResumen {
    idUsuario: number
    nombresUsuario: string
    apellidosUsuario: string
    correoUsuario: string
    rolUsuario: string
    estadoUsuario: string
}

interface BoletoResumen {
    idBoleto: number
    numeroBoleto: string
    asientoBoleto: string
    claseBoleto: string
    estadoBoleto: string
}

interface Reserva {
    idReserva: number
    fkAerolineaReserva: number
    fkVueloReserva: number
    fkPasajeroReserva: number
    fkUsuarioRegistroReserva: number | null
    codigoReserva: string
    estadoReserva: EstadoReserva
    totalReserva: number | string
    observacionReserva: string | null
    aerolineaReserva: AerolineaResumen
    vueloReserva: VueloResumen
    pasajeroReserva: PasajeroResumen
    usuarioRegistroReserva: UsuarioResumen | null
    boletoReserva: BoletoResumen | null
}

interface FormularioReserva {
    fkAerolineaReserva: string
    fkVueloReserva: string
    fkPasajeroReserva: string
    codigoReserva: string
    estadoReserva: EstadoReserva
    totalReserva: string
    observacionReserva: string
}

interface ReservasModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    reservas: Reserva[]
    vuelos: VueloResumen[]
    pasajeros: PasajeroResumen[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error {}

const formularioInicial: FormularioReserva = {
    fkAerolineaReserva: '',
    fkVueloReserva: '',
    fkPasajeroReserva: '',
    codigoReserva: '',
    estadoReserva: 'PENDIENTE',
    totalReserva: '',
    observacionReserva: '',
}

const estadosReserva: EstadoReserva[] = [
    'PENDIENTE',
    'CONFIRMADA',
    'CANCELADA',
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
        case 'reserva':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                    <path d="m8 15 2.2 2.2L16 12" />
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
        case 'boleto':
            return (
                <svg {...props}>
                    <path d="M3 7.5A2.5 2.5 0 0 0 5.5 5h13A2.5 2.5 0 0 0 21 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 0 18.5 19h-13A2.5 2.5 0 0 0 3 16.5v-2a2.5 2.5 0 0 0 0-5z" />
                    <path d="M9 8v8M13 9h4M13 13h4" />
                </svg>
            )
        case 'usuario':
            return (
                <svg {...props}>
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3.5 18c.5-3.3 2.3-5 5.5-5s5 1.7 5.5 5" />
                    <path d="M16 8h5M18.5 5.5v5" />
                </svg>
            )
        case 'asientos':
            return (
                <svg {...props}>
                    <path d="M7 11V7a3 3 0 0 1 6 0v4" />
                    <path d="M5 11h10a3 3 0 0 1 3 3v4H7a2 2 0 0 1-2-2z" />
                    <path d="M7 18v3M17 18v3" />
                </svg>
            )
        case 'documento':
            return (
                <svg {...props}>
                    <rect x="4" y="3" width="16" height="18" rx="2.5" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
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

function ordenarReservas(lista: Reserva[]): Reserva[] {
    return [...lista].sort(
        (a, b) => b.idReserva - a.idReserva,
    )
}

function ordenarVuelos(
    lista: VueloResumen[],
): VueloResumen[] {
    return [...lista].sort(
        (a, b) =>
            new Date(a.fechaHoraSalidaVuelo).getTime() -
            new Date(b.fechaHoraSalidaVuelo).getTime(),
    )
}

function ordenarPasajeros(
    lista: PasajeroResumen[],
): PasajeroResumen[] {
    return [...lista].sort((a, b) => {
        const comparacionApellidos =
            a.apellidosPasajero.localeCompare(
                b.apellidosPasajero,
                'es',
            )

        if (comparacionApellidos !== 0) {
            return comparacionApellidos
        }

        return a.nombresPasajero.localeCompare(
            b.nombresPasajero,
            'es',
        )
    })
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

function etiquetaEstado(
    estado: EstadoReserva,
): string {
    switch (estado) {
        case 'PENDIENTE':
            return 'Pendiente'
        case 'CONFIRMADA':
            return 'Confirmada'
        case 'CANCELADA':
            return 'Cancelada'
    }
}

function formatearPrecio(
    precio: number | string,
): string {
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

function nombreCompletoUsuario(
    usuario: UsuarioResumen,
): string {
    return `${usuario.nombresUsuario} ${usuario.apellidosUsuario}`
        .trim()
}

function obtenerIniciales(
    pasajero: PasajeroResumen,
): string {
    const primera =
        pasajero.nombresPasajero.trim().charAt(0)
    const segunda =
        pasajero.apellidosPasajero.trim().charAt(0)

    return `${primera}${segunda || primera}`.toUpperCase()
}

function obtenerIdAerolineaVuelo(
    vuelo: VueloResumen,
): number | null {
    if (
        typeof vuelo.fkAerolineaVuelo === 'number' &&
        Number.isFinite(vuelo.fkAerolineaVuelo)
    ) {
        return vuelo.fkAerolineaVuelo
    }

    return vuelo.aerolineaVuelo?.idAerolinea ?? null
}

function obtenerIdAerolineaPasajero(
    pasajero: PasajeroResumen,
): number | null {
    if (
        typeof pasajero.fkAerolineaPasajero === 'number' &&
        Number.isFinite(pasajero.fkAerolineaPasajero)
    ) {
        return pasajero.fkAerolineaPasajero
    }

    return pasajero.aerolineaPasajero?.idAerolinea ?? null
}

function esVueloReservable(
    vuelo: VueloResumen,
): boolean {
    return (
        vuelo.estadoVuelo === 'PROGRAMADO' &&
        new Date(vuelo.fechaHoraSalidaVuelo).getTime() >
            Date.now()
    )
}

function generarCodigoReserva(
    codigoIata: string | undefined,
): string {
    const prefijo =
        codigoIata?.trim().toUpperCase() || 'RSV'
    const sufijo = Date.now()
        .toString(36)
        .slice(-6)
        .toUpperCase()

    return `${prefijo}-${sufijo}`.slice(0, 20)
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudReservas = solicitar<Reserva[]>(
        '/reservas',
        token,
        { signal },
    )
    const solicitudVuelos = solicitar<VueloResumen[]>(
        '/vuelos',
        token,
        { signal },
    )
    const solicitudPasajeros = solicitar<PasajeroResumen[]>(
        '/pasajeros',
        token,
        { signal },
    )
    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [reservas, vuelos, pasajeros, aerolineas] =
        await Promise.all([
            solicitudReservas,
            solicitudVuelos,
            solicitudPasajeros,
            solicitudAerolineas,
        ])

    return {
        reservas: ordenarReservas(
            Array.isArray(reservas) ? reservas : [],
        ),
        vuelos: ordenarVuelos(
            Array.isArray(vuelos) ? vuelos : [],
        ),
        pasajeros: ordenarPasajeros(
            Array.isArray(pasajeros) ? pasajeros : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function ReservasModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: ReservasModuloProps) {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [vuelos, setVuelos] = useState<VueloResumen[]>([])
    const [pasajeros, setPasajeros] = useState<
        PasajeroResumen[]
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
        useState<FiltroEstado>('TODAS')
    const [filtroPeriodo, setFiltroPeriodo] =
        useState<FiltroPeriodo>('TODOS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [reservaEdicion, setReservaEdicion] =
        useState<Reserva | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioReserva>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [reservaEliminar, setReservaEliminar] =
        useState<Reserva | null>(null)

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

                setReservas(datos.reservas)
                setVuelos(datos.vuelos)
                setPasajeros(datos.pasajeros)
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
                            : 'No fue posible cargar las reservas.',
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

    const vuelosReservables = useMemo(
        () => vuelos.filter(esVueloReservable),
        [vuelos],
    )

    const ocupacionPorVuelo = useMemo(() => {
        const ocupacion = new Map<number, number>()

        for (const reserva of reservas) {
            if (reserva.estadoReserva === 'CANCELADA') {
                continue
            }

            ocupacion.set(
                reserva.fkVueloReserva,
                (ocupacion.get(reserva.fkVueloReserva) ?? 0) + 1,
            )
        }

        return ocupacion
    }, [reservas])

    const vuelosConCupo = useMemo(
        () =>
            vuelosReservables.filter((vuelo) => {
                const ocupados =
                    ocupacionPorVuelo.get(vuelo.idVuelo) ?? 0

                return ocupados < vuelo.avionVuelo.capacidadAvion
            }),
        [vuelosReservables, ocupacionPorVuelo],
    )

    const puedeAbrirCreacion = useMemo(() => {
        if (!puedeCrear || pasajeros.length === 0) {
            return false
        }

        function existeCombinacion(
            idAerolinea: number | null,
        ): boolean {
            return vuelosConCupo.some((vuelo) => {
                if (
                    idAerolinea !== null &&
                    obtenerIdAerolineaVuelo(vuelo) !==
                        idAerolinea
                ) {
                    return false
                }

                return pasajeros.some((pasajero) => {
                    const perteneceAerolinea =
                        idAerolinea === null ||
                        obtenerIdAerolineaPasajero(
                            pasajero,
                        ) === idAerolinea

                    const yaReservado = reservas.some(
                        (reserva) =>
                            reserva.fkVueloReserva ===
                                vuelo.idVuelo &&
                            reserva.fkPasajeroReserva ===
                                pasajero.idPasajero,
                    )

                    return perteneceAerolinea && !yaReservado
                })
            })
        }

        if (!esSuperadmin) {
            return existeCombinacion(null)
        }

        return aerolineasActivas.some((aerolinea) =>
            existeCombinacion(aerolinea.idAerolinea),
        )
    }, [
        puedeCrear,
        pasajeros,
        esSuperadmin,
        vuelosConCupo,
        aerolineasActivas,
        reservas,
    ])

    const reservasFiltradas = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())
        const ahora = new Date()

        return reservas.filter((reserva) => {
            if (
                filtroEstado !== 'TODAS' &&
                reserva.estadoReserva !== filtroEstado
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                reserva.fkAerolineaReserva !==
                    Number(filtroAerolinea)
            ) {
                return false
            }

            const salida = new Date(
                reserva.vueloReserva.fechaHoraSalidaVuelo,
            )

            if (
                filtroPeriodo === 'PROXIMOS' &&
                salida < ahora
            ) {
                return false
            }

            if (
                filtroPeriodo === 'PASADOS' &&
                salida >= ahora
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            const boleto = reserva.boletoReserva

            return normalizarBusqueda(
                [
                    reserva.codigoReserva,
                    reserva.aerolineaReserva
                        .nombreComercialAerolinea,
                    reserva.aerolineaReserva
                        .codigoIataAerolinea,
                    reserva.vueloReserva.numeroVuelo,
                    reserva.vueloReserva.rutaVuelo.codigoRuta,
                    reserva.vueloReserva.rutaVuelo
                        .aeropuertoOrigenRuta
                        .codigoIataAeropuerto,
                    reserva.vueloReserva.rutaVuelo
                        .aeropuertoDestinoRuta
                        .codigoIataAeropuerto,
                    nombreCompletoPasajero(
                        reserva.pasajeroReserva,
                    ),
                    reserva.pasajeroReserva
                        .numeroDocumentoPasajero,
                    boleto?.numeroBoleto ?? '',
                    boleto?.asientoBoleto ?? '',
                    reserva.observacionReserva ?? '',
                ].join(' '),
            ).includes(texto)
        })
    }, [
        reservas,
        busqueda,
        filtroEstado,
        filtroPeriodo,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const pendientes = reservas.filter(
            (reserva) =>
                reserva.estadoReserva === 'PENDIENTE',
        ).length
        const confirmadas = reservas.filter(
            (reserva) =>
                reserva.estadoReserva === 'CONFIRMADA',
        ).length
        const canceladas = reservas.filter(
            (reserva) =>
                reserva.estadoReserva === 'CANCELADA',
        ).length
        const conBoleto = reservas.filter(
            (reserva) => reserva.boletoReserva !== null,
        ).length

        return {
            total: reservas.length,
            pendientes,
            confirmadas,
            canceladas,
            conBoleto,
        }
    }, [reservas])

    const idAerolineaFormulario = useMemo(() => {
        if (reservaEdicion) {
            return reservaEdicion.fkAerolineaReserva
        }

        if (esSuperadmin) {
            return formulario.fkAerolineaReserva
                ? Number(formulario.fkAerolineaReserva)
                : null
        }

        const vuelo = vuelos.find(
            (elemento) =>
                elemento.idVuelo ===
                Number(formulario.fkVueloReserva),
        )

        return vuelo
            ? obtenerIdAerolineaVuelo(vuelo)
            : null
    }, [
        reservaEdicion,
        esSuperadmin,
        formulario.fkAerolineaReserva,
        formulario.fkVueloReserva,
        vuelos,
    ])

    const vuelosFormulario = useMemo(() => {
        return vuelos.filter((vuelo) => {
            const perteneceAerolinea =
                !esSuperadmin ||
                idAerolineaFormulario === null ||
                obtenerIdAerolineaVuelo(vuelo) ===
                    idAerolineaFormulario

            const esActual =
                reservaEdicion?.fkVueloReserva ===
                vuelo.idVuelo

            const ocupados =
                ocupacionPorVuelo.get(vuelo.idVuelo) ?? 0
            const tieneCupo =
                ocupados < vuelo.avionVuelo.capacidadAvion
            const tienePasajeroDisponible = pasajeros.some(
                (pasajero) => {
                    const perteneceAlMismoTenant =
                        idAerolineaFormulario === null ||
                        obtenerIdAerolineaPasajero(
                            pasajero,
                        ) === idAerolineaFormulario

                    if (!perteneceAlMismoTenant) {
                        return false
                    }

                    const esRelacionActual =
                        reservaEdicion?.fkVueloReserva ===
                            vuelo.idVuelo &&
                        reservaEdicion
                            ?.fkPasajeroReserva ===
                            pasajero.idPasajero

                    return (
                        esRelacionActual ||
                        !reservas.some(
                            (reserva) =>
                                reserva.fkVueloReserva ===
                                    vuelo.idVuelo &&
                                reserva.fkPasajeroReserva ===
                                    pasajero.idPasajero &&
                                reserva.idReserva !==
                                    reservaEdicion?.idReserva,
                        )
                    )
                },
            )

            return (
                perteneceAerolinea &&
                (esActual ||
                    (esVueloReservable(vuelo) &&
                        tieneCupo &&
                        tienePasajeroDisponible))
            )
        })
    }, [
        vuelos,
        esSuperadmin,
        idAerolineaFormulario,
        reservaEdicion,
        ocupacionPorVuelo,
        pasajeros,
        reservas,
    ])

    const pasajerosFormulario = useMemo(() => {
        return pasajeros.filter((pasajero) => {
            const perteneceAerolinea =
                !esSuperadmin ||
                idAerolineaFormulario === null ||
                obtenerIdAerolineaPasajero(pasajero) ===
                    idAerolineaFormulario

            if (!perteneceAerolinea) {
                return false
            }

            const idVuelo = Number(
                formulario.fkVueloReserva,
            )

            if (!idVuelo) {
                return true
            }

            const esRelacionActual =
                reservaEdicion?.fkVueloReserva === idVuelo &&
                reservaEdicion?.fkPasajeroReserva ===
                    pasajero.idPasajero

            if (esRelacionActual) {
                return true
            }

            return !reservas.some(
                (reserva) =>
                    reserva.fkVueloReserva === idVuelo &&
                    reserva.fkPasajeroReserva ===
                        pasajero.idPasajero &&
                    reserva.idReserva !==
                        reservaEdicion?.idReserva,
            )
        })
    }, [
        pasajeros,
        esSuperadmin,
        idAerolineaFormulario,
        reservaEdicion,
        formulario.fkVueloReserva,
        reservas,
    ])

    const vueloSeleccionado = vuelos.find(
        (vuelo) =>
            vuelo.idVuelo ===
            Number(formulario.fkVueloReserva),
    )
    const pasajeroSeleccionado = pasajeros.find(
        (pasajero) =>
            pasajero.idPasajero ===
            Number(formulario.fkPasajeroReserva),
    )

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

            setReservas(datos.reservas)
            setVuelos(datos.vuelos)
            setPasajeros(datos.pasajeros)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar las reservas.',
            )
        } finally {
            setCargando(false)
        }
    }

    function obtenerPrimerosRecursos(
        idAerolinea: number | null,
    ): {
        idVuelo: string
        idPasajero: string
        total: string
    } {
        let primerVuelo: VueloResumen | undefined
        let primerPasajero: PasajeroResumen | undefined

        for (const vuelo of vuelosConCupo) {
            if (
                idAerolinea !== null &&
                obtenerIdAerolineaVuelo(vuelo) !==
                    idAerolinea
            ) {
                continue
            }

            const pasajeroDisponible = pasajeros.find(
                (pasajero) => {
                    const perteneceAerolinea =
                        idAerolinea === null ||
                        obtenerIdAerolineaPasajero(
                            pasajero,
                        ) === idAerolinea

                    const yaReservado = reservas.some(
                        (reserva) =>
                            reserva.fkVueloReserva ===
                                vuelo.idVuelo &&
                            reserva.fkPasajeroReserva ===
                                pasajero.idPasajero,
                    )

                    return perteneceAerolinea && !yaReservado
                },
            )

            if (pasajeroDisponible) {
                primerVuelo = vuelo
                primerPasajero = pasajeroDisponible
                break
            }
        }

        return {
            idVuelo: primerVuelo
                ? String(primerVuelo.idVuelo)
                : '',
            idPasajero: primerPasajero
                ? String(primerPasajero.idPasajero)
                : '',
            total: primerVuelo
                ? String(primerVuelo.precioBaseVuelo)
                : '',
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        let idAerolinea: number | null = null
        let aerolineaSeleccionada:
            | AerolineaResumen
            | undefined

        if (esSuperadmin) {
            aerolineaSeleccionada =
                aerolineasActivas.find((aerolinea) => {
                    const recursos =
                        obtenerPrimerosRecursos(
                            aerolinea.idAerolinea,
                        )

                    return Boolean(
                        recursos.idVuelo &&
                        recursos.idPasajero,
                    )
                })

            idAerolinea =
                aerolineasActivas.length === 1
                    ? aerolineasActivas[0].idAerolinea
                    : aerolineaSeleccionada?.idAerolinea ??
                        null
        }

        const recursos =
            obtenerPrimerosRecursos(idAerolinea)
        const vueloInicial = vuelos.find(
            (vuelo) =>
                vuelo.idVuelo ===
                Number(recursos.idVuelo),
        )
        const aerolineaCodigo = esSuperadmin
            ? aerolineas.find(
                (aerolinea) =>
                    aerolinea.idAerolinea === idAerolinea,
            )?.codigoIataAerolinea
            : vueloInicial?.aerolineaVuelo
                ?.codigoIataAerolinea

        setReservaEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaReserva:
                idAerolinea === null
                    ? ''
                    : String(idAerolinea),
            fkVueloReserva: recursos.idVuelo,
            fkPasajeroReserva: recursos.idPasajero,
            codigoReserva:
                generarCodigoReserva(aerolineaCodigo),
            totalReserva: recursos.total,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(reserva: Reserva) {
        setReservaEdicion(reserva)
        setFormulario({
            fkAerolineaReserva: String(
                reserva.fkAerolineaReserva,
            ),
            fkVueloReserva: String(
                reserva.fkVueloReserva,
            ),
            fkPasajeroReserva: String(
                reserva.fkPasajeroReserva,
            ),
            codigoReserva: reserva.codigoReserva,
            estadoReserva: reserva.estadoReserva,
            totalReserva: String(reserva.totalReserva),
            observacionReserva:
                reserva.observacionReserva ?? '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setReservaEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioReserva>(
        campo: K,
        valor: FormularioReserva[K],
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
        const recursos =
            obtenerPrimerosRecursos(idNumerico)
        const codigoIata = aerolineas.find(
            (aerolinea) =>
                aerolinea.idAerolinea === idNumerico,
        )?.codigoIataAerolinea

        setFormulario((actual) => ({
            ...actual,
            fkAerolineaReserva: idAerolinea,
            fkVueloReserva: recursos.idVuelo,
            fkPasajeroReserva: recursos.idPasajero,
            codigoReserva:
                generarCodigoReserva(codigoIata),
            totalReserva: recursos.total,
        }))
    }

    function cambiarVuelo(idVuelo: string) {
        const vuelo = vuelos.find(
            (elemento) =>
                elemento.idVuelo === Number(idVuelo),
        )
        const pasajerosDisponibles = pasajeros.filter(
            (pasajero) => {
                const perteneceAerolinea =
                    !esSuperadmin ||
                    idAerolineaFormulario === null ||
                    obtenerIdAerolineaPasajero(
                        pasajero,
                    ) === idAerolineaFormulario

                if (!perteneceAerolinea) {
                    return false
                }

                const esRelacionActual =
                    reservaEdicion?.fkVueloReserva ===
                        Number(idVuelo) &&
                    reservaEdicion?.fkPasajeroReserva ===
                        pasajero.idPasajero

                return (
                    esRelacionActual ||
                    !reservas.some(
                        (reserva) =>
                            reserva.fkVueloReserva ===
                                Number(idVuelo) &&
                            reserva.fkPasajeroReserva ===
                                pasajero.idPasajero &&
                            reserva.idReserva !==
                                reservaEdicion?.idReserva,
                    )
                )
            },
        )

        setFormulario((actual) => {
            const pasajeroActualDisponible =
                pasajerosDisponibles.some(
                    (pasajero) =>
                        pasajero.idPasajero ===
                        Number(
                            actual.fkPasajeroReserva,
                        ),
                )

            return {
                ...actual,
                fkVueloReserva: idVuelo,
                fkPasajeroReserva:
                    pasajeroActualDisponible
                        ? actual.fkPasajeroReserva
                        : pasajerosDisponibles[0]
                            ? String(
                                pasajerosDisponibles[0]
                                    .idPasajero,
                            )
                            : '',
                totalReserva: vuelo
                    ? String(vuelo.precioBaseVuelo)
                    : actual.totalReserva,
            }
        })
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            reservaEdicion === null &&
            !formulario.fkAerolineaReserva
        ) {
            return 'Selecciona la aerolínea propietaria de la reserva.'
        }

        if (!formulario.fkVueloReserva) {
            return 'Selecciona el vuelo de la reserva.'
        }

        if (!formulario.fkPasajeroReserva) {
            return 'Selecciona el pasajero de la reserva.'
        }

        if (
            !/^[A-Z0-9-]{5,20}$/.test(
                formulario.codigoReserva,
            )
        ) {
            return 'El código debe tener entre 5 y 20 caracteres y usar solo letras, números o guiones.'
        }

        const total = Number(formulario.totalReserva)

        if (!Number.isFinite(total) || total < 0) {
            return 'El total de la reserva debe ser un número mayor o igual a cero.'
        }

        const decimales =
            formulario.totalReserva.split('.')[1]

        if (decimales && decimales.length > 2) {
            return 'El total de la reserva puede tener máximo 2 decimales.'
        }

        if (
            formulario.observacionReserva.length > 500
        ) {
            return 'La observación no puede superar los 500 caracteres.'
        }

        const vuelo = vuelos.find(
            (elemento) =>
                elemento.idVuelo ===
                Number(formulario.fkVueloReserva),
        )
        const pasajero = pasajeros.find(
            (elemento) =>
                elemento.idPasajero ===
                Number(formulario.fkPasajeroReserva),
        )

        if (!vuelo) {
            return 'El vuelo seleccionado ya no está disponible.'
        }

        if (!pasajero) {
            return 'El pasajero seleccionado ya no está disponible.'
        }

        const cambiaRelacion =
            reservaEdicion === null ||
            Number(formulario.fkVueloReserva) !==
                reservaEdicion.fkVueloReserva ||
            Number(formulario.fkPasajeroReserva) !==
                reservaEdicion.fkPasajeroReserva

        const reactiva =
            reservaEdicion?.estadoReserva ===
                'CANCELADA' &&
            formulario.estadoReserva !== 'CANCELADA'

        const cambiaAEstadoNoCancelado =
            reservaEdicion !== null &&
            formulario.estadoReserva !==
                reservaEdicion.estadoReserva &&
            formulario.estadoReserva !== 'CANCELADA'

        if (
            (cambiaRelacion ||
                reactiva ||
                cambiaAEstadoNoCancelado) &&
            !esVueloReservable(vuelo)
        ) {
            return 'El vuelo debe estar PROGRAMADO y con salida futura para registrar o reactivar la reserva.'
        }

        if (formulario.estadoReserva !== 'CANCELADA') {
            let ocupados =
                ocupacionPorVuelo.get(vuelo.idVuelo) ?? 0

            const reservaActualOcupaCupo =
                reservaEdicion !== null &&
                reservaEdicion.fkVueloReserva ===
                    vuelo.idVuelo &&
                reservaEdicion.estadoReserva !==
                    'CANCELADA'

            if (reservaActualOcupaCupo) {
                ocupados -= 1
            }

            if (
                ocupados >=
                vuelo.avionVuelo.capacidadAvion
            ) {
                return 'El vuelo ya no tiene capacidad disponible.'
            }
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

        const esEdicion = reservaEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                fkVueloReserva: Number(
                    formulario.fkVueloReserva,
                ),
                fkPasajeroReserva: Number(
                    formulario.fkPasajeroReserva,
                ),
                codigoReserva:
                    formulario.codigoReserva.trim(),
                estadoReserva: formulario.estadoReserva,
                totalReserva: Number(
                    formulario.totalReserva,
                ),
                observacionReserva:
                    formulario.observacionReserva.trim() ||
                    undefined,
                ...(esSuperadmin
                    ? {
                        fkAerolineaReserva: Number(
                            formulario.fkAerolineaReserva,
                        ),
                    }
                    : {}),
            }
        } else {
            datos = {}

            if (
                Number(formulario.fkVueloReserva) !==
                reservaEdicion.fkVueloReserva
            ) {
                datos.fkVueloReserva = Number(
                    formulario.fkVueloReserva,
                )
            }

            if (
                Number(formulario.fkPasajeroReserva) !==
                reservaEdicion.fkPasajeroReserva
            ) {
                datos.fkPasajeroReserva = Number(
                    formulario.fkPasajeroReserva,
                )
            }

            if (
                formulario.codigoReserva.trim() !==
                reservaEdicion.codigoReserva
            ) {
                datos.codigoReserva =
                    formulario.codigoReserva.trim()
            }

            if (
                formulario.estadoReserva !==
                reservaEdicion.estadoReserva
            ) {
                datos.estadoReserva =
                    formulario.estadoReserva
            }

            if (
                Number(formulario.totalReserva) !==
                Number(reservaEdicion.totalReserva)
            ) {
                datos.totalReserva = Number(
                    formulario.totalReserva,
                )
            }

            if (
                formulario.observacionReserva.trim() !==
                (reservaEdicion.observacionReserva ?? '')
            ) {
                datos.observacionReserva =
                    formulario.observacionReserva.trim()
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
            const reservaGuardada =
                await solicitar<Reserva>(
                    esEdicion
                        ? `/reservas/${reservaEdicion.idReserva}`
                        : '/reservas',
                    token,
                    {
                        method: esEdicion
                            ? 'PATCH'
                            : 'POST',
                        body: JSON.stringify(datos),
                    },
                )

            setReservas((lista) =>
                ordenarReservas([
                    ...lista.filter(
                        (reserva) =>
                            reserva.idReserva !==
                            reservaGuardada.idReserva,
                    ),
                    reservaGuardada,
                ]),
            )
            setFormularioAbierto(false)
            setReservaEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Reserva actualizada correctamente.'
                    : 'Reserva registrada correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar la reserva.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!reservaEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar<Reserva>(
                `/reservas/${reservaEliminar.idReserva}`,
                token,
                { method: 'DELETE' },
            )

            setReservas((lista) =>
                lista.filter(
                    (reserva) =>
                        reserva.idReserva !==
                        reservaEliminar.idReserva,
                ),
            )
            setReservaEliminar(null)
            setMensajeExito(
                'Reserva eliminada correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar la reserva.',
            )
            setReservaEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    const aerolineaFormulario = aerolineas.find(
        (aerolinea) =>
            aerolinea.idAerolinea ===
            idAerolineaFormulario,
    )

    return (
        <section className="reservas-modulo">
            <header className="reservas-cabecera">
                <div className="reservas-cabecera__texto">
                    <span className="reservas-etiqueta">
                        Control comercial por aerolínea
                    </span>
                    <h2>Gestión de reservas</h2>
                    <p>
                        Vincula pasajeros con vuelos, controla la
                        disponibilidad y administra el estado de cada
                        operación.
                    </p>
                </div>

                <div className="reservas-cabecera__acciones">
                    <button
                        type="button"
                        className="reservas-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    {puedeCrear && (
                        <button
                            type="button"
                            className="reservas-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Registrar una nueva reserva'
                                    : 'Se necesita un vuelo programado con cupo y al menos un pasajero de la misma aerolínea'
                            }
                        >
                            <Icono nombre="agregar" />
                            Nueva reserva
                        </button>
                    )}
                </div>
            </header>

            {esEmpleado && (
                <div className="reservas-aviso reservas-aviso--operacion">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>
                            Gestión de reservas habilitada
                        </strong>
                        <span>
                            Puedes registrar y actualizar reservas de{' '}
                            {nombreAerolinea}. La eliminación
                            corresponde a los administradores.
                        </span>
                    </div>
                </div>
            )}

            {puedeCrear &&
                !puedeAbrirCreacion &&
                !cargando && (
                    <div className="reservas-aviso reservas-aviso--advertencia">
                        <Icono nombre="alerta" tamano={21} />
                        <div>
                            <strong>
                                Faltan recursos para reservar
                            </strong>
                            <span>
                                Debe existir un vuelo PROGRAMADO con
                                salida futura y cupo disponible, además
                                de un pasajero de la misma aerolínea.
                            </span>
                        </div>
                    </div>
                )}

            {mensajeExito && (
                <div className="reservas-mensaje reservas-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="reservas-mensaje reservas-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="reservas-resumen">
                <article>
                    <span>Total de reservas</span>
                    <strong>{resumen.total}</strong>
                    <small>Registros del alcance actual</small>
                </article>
                <article>
                    <span>Pendientes</span>
                    <strong>{resumen.pendientes}</strong>
                    <small className="reservas-texto-pendiente">
                        Requieren seguimiento
                    </small>
                </article>
                <article>
                    <span>Confirmadas</span>
                    <strong>{resumen.confirmadas}</strong>
                    <small className="reservas-texto-confirmado">
                        Operaciones activas
                    </small>
                </article>
                <article>
                    <span>Canceladas</span>
                    <strong>{resumen.canceladas}</strong>
                    <small>
                        {resumen.conBoleto} con boleto emitido
                    </small>
                </article>
            </div>

            <section className="reservas-catalogo">
                <div className="reservas-filtros">
                    <label className="reservas-buscador">
                        <Icono nombre="buscar" tamano={20} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por código, aerolínea, pasajero, vuelo o boleto'
                                    : 'Buscar por código, pasajero, vuelo o boleto'
                            }
                        />
                    </label>

                    <label className="reservas-selector-filtro">
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
                            <option value="TODAS">
                                Todas
                            </option>
                            {estadosReserva.map((estado) => (
                                <option
                                    key={estado}
                                    value={estado}
                                >
                                    {etiquetaEstado(estado)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="reservas-selector-filtro">
                        <span>Periodo</span>
                        <select
                            value={filtroPeriodo}
                            onChange={(evento) =>
                                setFiltroPeriodo(
                                    evento.target
                                        .value as FiltroPeriodo,
                                )
                            }
                        >
                            <option value="TODOS">
                                Todos
                            </option>
                            <option value="PROXIMOS">
                                Próximos
                            </option>
                            <option value="PASADOS">
                                Pasados
                            </option>
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="reservas-selector-filtro">
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
                                {aerolineas.map(
                                    (aerolinea) => (
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
                                    ),
                                )}
                            </select>
                        </label>
                    )}

                    <span className="reservas-resultados">
                        {reservasFiltradas.length}{' '}
                        {reservasFiltradas.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="reservas-estado-vacio">
                        <span className="reservas-cargador" />
                        <strong>Cargando reservas</strong>
                        <p>
                            Consultando las operaciones
                            comerciales.
                        </p>
                    </div>
                ) : reservasFiltradas.length === 0 ? (
                    <div className="reservas-estado-vacio">
                        <span className="reservas-estado-vacio__icono">
                            <Icono
                                nombre="reserva"
                                tamano={35}
                            />
                        </span>
                        <strong>
                            {reservas.length === 0
                                ? 'No existen reservas registradas'
                                : 'No hay reservas que coincidan con los filtros'}
                        </strong>
                        <p>
                            {reservas.length === 0
                                ? 'El catálogo todavía no contiene operaciones de reserva.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {reservas.length === 0 &&
                            puedeAbrirCreacion && (
                                <button
                                    type="button"
                                    className="reservas-boton-principal"
                                    onClick={abrirCreacion}
                                >
                                    <Icono nombre="agregar" />
                                    Registrar la primera
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="reservas-tabla-contenedor">
                        <table className="reservas-tabla">
                            <thead>
                                <tr>
                                    <th>Reserva</th>
                                    <th>Pasajero</th>
                                    <th>Vuelo y trayecto</th>
                                    <th>Estado y total</th>
                                    <th>Seguimiento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasFiltradas.map(
                                    (reserva) => (
                                        <tr
                                            key={
                                                reserva.idReserva
                                            }
                                        >
                                            <td data-label="Reserva">
                                                <div className="reservas-identidad">
                                                    <span className="reservas-identidad__icono">
                                                        <Icono
                                                            nombre="reserva"
                                                            tamano={
                                                                21
                                                            }
                                                        />
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {
                                                                reserva.codigoReserva
                                                            }
                                                        </strong>
                                                        <span>
                                                            ID #
                                                            {
                                                                reserva.idReserva
                                                            }
                                                        </span>
                                                        {esSuperadmin && (
                                                            <small>
                                                                {
                                                                    reserva
                                                                        .aerolineaReserva
                                                                        .nombreComercialAerolinea
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td data-label="Pasajero">
                                                <div className="reservas-pasajero">
                                                    <span>
                                                        {obtenerIniciales(
                                                            reserva.pasajeroReserva,
                                                        )}
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {nombreCompletoPasajero(
                                                                reserva.pasajeroReserva,
                                                            )}
                                                        </strong>
                                                        <small>
                                                            {
                                                                reserva
                                                                    .pasajeroReserva
                                                                    .tipoDocumentoPasajero
                                                            }{' '}
                                                            ·{' '}
                                                            {
                                                                reserva
                                                                    .pasajeroReserva
                                                                    .numeroDocumentoPasajero
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td data-label="Vuelo y trayecto">
                                                <div className="reservas-vuelo">
                                                    <div>
                                                        <strong>
                                                            {
                                                                reserva
                                                                    .vueloReserva
                                                                    .numeroVuelo
                                                            }
                                                        </strong>
                                                        <span>
                                                            {
                                                                reserva
                                                                    .vueloReserva
                                                                    .rutaVuelo
                                                                    .aeropuertoOrigenRuta
                                                                    .codigoIataAeropuerto
                                                            }{' '}
                                                            →{' '}
                                                            {
                                                                reserva
                                                                    .vueloReserva
                                                                    .rutaVuelo
                                                                    .aeropuertoDestinoRuta
                                                                    .codigoIataAeropuerto
                                                            }
                                                        </span>
                                                    </div>
                                                    <small>
                                                        {formatearFecha(
                                                            reserva
                                                                .vueloReserva
                                                                .fechaHoraSalidaVuelo,
                                                        )}{' '}
                                                        ·{' '}
                                                        {formatearHora(
                                                            reserva
                                                                .vueloReserva
                                                                .fechaHoraSalidaVuelo,
                                                        )}
                                                    </small>
                                                </div>
                                            </td>

                                            <td data-label="Estado y total">
                                                <div className="reservas-estado-columna">
                                                    <span
                                                        className={`reservas-insignia reservas-insignia--${reserva.estadoReserva.toLowerCase()}`}
                                                    >
                                                        <i />
                                                        {etiquetaEstado(
                                                            reserva.estadoReserva,
                                                        )}
                                                    </span>
                                                    <strong>
                                                        {formatearPrecio(
                                                            reserva.totalReserva,
                                                        )}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td data-label="Seguimiento">
                                                <div className="reservas-seguimiento">
                                                    <div>
                                                        <Icono
                                                            nombre="boleto"
                                                            tamano={
                                                                17
                                                            }
                                                        />
                                                        <span>
                                                            {reserva.boletoReserva
                                                                ? `Boleto ${reserva.boletoReserva.numeroBoleto}`
                                                                : 'Sin boleto'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Icono
                                                            nombre="usuario"
                                                            tamano={
                                                                17
                                                            }
                                                        />
                                                        <span>
                                                            {reserva.usuarioRegistroReserva
                                                                ? nombreCompletoUsuario(
                                                                    reserva.usuarioRegistroReserva,
                                                                )
                                                                : 'Registro global'}
                                                        </span>
                                                    </div>
                                                    {reserva.observacionReserva && (
                                                        <small
                                                            title={
                                                                reserva.observacionReserva
                                                            }
                                                        >
                                                            {
                                                                reserva.observacionReserva
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </td>

                                            <td data-label="Acciones">
                                                <div className="reservas-acciones-fila">
                                                    {puedeEditar && (
                                                        <button
                                                            type="button"
                                                            className="reservas-boton-icono"
                                                            onClick={() =>
                                                                abrirEdicion(
                                                                    reserva,
                                                                )
                                                            }
                                                            aria-label={`Editar reserva ${reserva.codigoReserva}`}
                                                            title="Editar reserva"
                                                        >
                                                            <Icono
                                                                nombre="editar"
                                                                tamano={
                                                                    19
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                                    {puedeEliminar && (
                                                        <button
                                                            type="button"
                                                            className="reservas-boton-icono reservas-boton-icono--peligro"
                                                            onClick={() =>
                                                                setReservaEliminar(
                                                                    reserva,
                                                                )
                                                            }
                                                            aria-label={`Eliminar reserva ${reserva.codigoReserva}`}
                                                            title="Eliminar reserva"
                                                        >
                                                            <Icono
                                                                nombre="eliminar"
                                                                tamano={
                                                                    19
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div
                    className="reservas-modal-capa"
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
                        className="reservas-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reservas-formulario-titulo"
                    >
                        <header className="reservas-modal__cabecera">
                            <div className="reservas-modal__titulo">
                                <span className="reservas-modal__icono">
                                    <Icono
                                        nombre="reserva"
                                        tamano={24}
                                    />
                                </span>
                                <div>
                                    <span>
                                        {reservaEdicion
                                            ? 'Actualización comercial'
                                            : 'Nueva operación'}
                                    </span>
                                    <h3 id="reservas-formulario-titulo">
                                        {reservaEdicion
                                            ? `Editar ${reservaEdicion.codigoReserva}`
                                            : 'Registrar reserva'}
                                    </h3>
                                    <p>
                                        Selecciona el vuelo, el
                                        pasajero y los datos de la
                                        operación.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="reservas-modal__cerrar"
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
                            className="reservas-formulario"
                            onSubmit={guardar}
                        >
                            {esSuperadmin &&
                            reservaEdicion === null ? (
                                <label className="reservas-campo reservas-campo--completo">
                                    <span>
                                        Aerolínea propietaria
                                    </span>
                                    <select
                                        value={
                                            formulario.fkAerolineaReserva
                                        }
                                        onChange={(evento) =>
                                            cambiarAerolinea(
                                                evento.target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">
                                            Selecciona una
                                            aerolínea
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
                                <div className="reservas-propietario">
                                    <Icono
                                        nombre="aerolinea"
                                        tamano={20}
                                    />
                                    <div>
                                        <span>
                                            Aerolínea
                                            propietaria
                                        </span>
                                        <strong>
                                            {reservaEdicion
                                                ? reservaEdicion
                                                    .aerolineaReserva
                                                    .nombreComercialAerolinea
                                                : nombreAerolinea}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className="reservas-formulario__rejilla">
                                <label className="reservas-campo">
                                    <span>Vuelo</span>
                                    <select
                                        value={
                                            formulario.fkVueloReserva
                                        }
                                        onChange={(evento) =>
                                            cambiarVuelo(
                                                evento.target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando ||
                                            Boolean(
                                                reservaEdicion
                                                    ?.boletoReserva,
                                            ) ||
                                            (esSuperadmin &&
                                                reservaEdicion ===
                                                    null &&
                                                !formulario.fkAerolineaReserva)
                                        }
                                    >
                                        <option value="">
                                            Selecciona un vuelo
                                        </option>
                                        {vuelosFormulario.map(
                                            (vuelo) => {
                                                const ocupados =
                                                    ocupacionPorVuelo.get(
                                                        vuelo.idVuelo,
                                                    ) ?? 0

                                                return (
                                                    <option
                                                        key={
                                                            vuelo.idVuelo
                                                        }
                                                        value={
                                                            vuelo.idVuelo
                                                        }
                                                    >
                                                        {
                                                            vuelo.numeroVuelo
                                                        }{' '}
                                                        ·{' '}
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
                                                        }{' '}
                                                        ·{' '}
                                                        {ocupados}
                                                        /
                                                        {
                                                            vuelo
                                                                .avionVuelo
                                                                .capacidadAvion
                                                        }{' '}
                                                        ocupados
                                                        {!esVueloReservable(
                                                            vuelo,
                                                        )
                                                            ? ' · NO RESERVABLE'
                                                            : ''}
                                                    </option>
                                                )
                                            },
                                        )}
                                    </select>
                                </label>

                                <label className="reservas-campo">
                                    <span>Pasajero</span>
                                    <select
                                        value={
                                            formulario.fkPasajeroReserva
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkPasajeroReserva',
                                                evento.target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando ||
                                            Boolean(
                                                reservaEdicion
                                                    ?.boletoReserva,
                                            ) ||
                                            (esSuperadmin &&
                                                reservaEdicion ===
                                                    null &&
                                                !formulario.fkAerolineaReserva)
                                        }
                                    >
                                        <option value="">
                                            Selecciona un
                                            pasajero
                                        </option>
                                        {pasajerosFormulario.map(
                                            (pasajero) => (
                                                <option
                                                    key={
                                                        pasajero.idPasajero
                                                    }
                                                    value={
                                                        pasajero.idPasajero
                                                    }
                                                >
                                                    {nombreCompletoPasajero(
                                                        pasajero,
                                                    )}{' '}
                                                    ·{' '}
                                                    {
                                                        pasajero.numeroDocumentoPasajero
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>
                            </div>

                            {reservaEdicion?.boletoReserva && (
                                <div className="reservas-aviso reservas-aviso--informacion">
                                    <Icono
                                        nombre="boleto"
                                        tamano={21}
                                    />
                                    <div>
                                        <strong>
                                            Reserva con boleto
                                            emitido
                                        </strong>
                                        <span>
                                            El vuelo y el
                                            pasajero no pueden
                                            cambiarse porque existe
                                            el boleto{' '}
                                            {
                                                reservaEdicion
                                                    .boletoReserva
                                                    .numeroBoleto
                                            }
                                            .
                                        </span>
                                    </div>
                                </div>
                            )}

                            {vueloSeleccionado &&
                                pasajeroSeleccionado && (
                                    <div className="reservas-vista-previa">
                                        <div className="reservas-vista-previa__vuelo">
                                            <span>
                                                <Icono
                                                    nombre="vuelo"
                                                    tamano={
                                                        18
                                                    }
                                                />
                                                Vuelo
                                            </span>
                                            <strong>
                                                {
                                                    vueloSeleccionado.numeroVuelo
                                                }
                                            </strong>
                                            <small>
                                                {
                                                    vueloSeleccionado
                                                        .rutaVuelo
                                                        .aeropuertoOrigenRuta
                                                        .codigoIataAeropuerto
                                                }{' '}
                                                →{' '}
                                                {
                                                    vueloSeleccionado
                                                        .rutaVuelo
                                                        .aeropuertoDestinoRuta
                                                        .codigoIataAeropuerto
                                                }{' '}
                                                ·{' '}
                                                {formatearFecha(
                                                    vueloSeleccionado.fechaHoraSalidaVuelo,
                                                )}{' '}
                                                ·{' '}
                                                {formatearHora(
                                                    vueloSeleccionado.fechaHoraSalidaVuelo,
                                                )}
                                            </small>
                                        </div>

                                        <div className="reservas-vista-previa__pasajero">
                                            <span>
                                                <Icono
                                                    nombre="pasajero"
                                                    tamano={
                                                        18
                                                    }
                                                />
                                                Pasajero
                                            </span>
                                            <strong>
                                                {nombreCompletoPasajero(
                                                    pasajeroSeleccionado,
                                                )}
                                            </strong>
                                            <small>
                                                {
                                                    pasajeroSeleccionado.tipoDocumentoPasajero
                                                }{' '}
                                                ·{' '}
                                                {
                                                    pasajeroSeleccionado.numeroDocumentoPasajero
                                                }
                                            </small>
                                        </div>

                                        <div className="reservas-vista-previa__capacidad">
                                            <Icono
                                                nombre="asientos"
                                                tamano={20}
                                            />
                                            <div>
                                                <strong>
                                                    {ocupacionPorVuelo.get(
                                                        vueloSeleccionado.idVuelo,
                                                    ) ?? 0}
                                                    /
                                                    {
                                                        vueloSeleccionado
                                                            .avionVuelo
                                                            .capacidadAvion
                                                    }
                                                </strong>
                                                <span>
                                                    ocupados
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="reservas-formulario__rejilla">
                                <label className="reservas-campo">
                                    <span>
                                        Código de reserva
                                    </span>
                                    <div className="reservas-campo-codigo">
                                        <input
                                            type="text"
                                            value={
                                                formulario.codigoReserva
                                            }
                                            onChange={(
                                                evento,
                                            ) =>
                                                cambiarCampo(
                                                    'codigoReserva',
                                                    evento.target.value
                                                        .toUpperCase()
                                                        .replace(
                                                            /[^A-Z0-9-]/g,
                                                            '',
                                                        ),
                                                )
                                            }
                                            placeholder="DJ-R001"
                                            minLength={5}
                                            maxLength={20}
                                            required
                                            disabled={
                                                guardando
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarCampo(
                                                    'codigoReserva',
                                                    generarCodigoReserva(
                                                        aerolineaFormulario?.codigoIataAerolinea ??
                                                            reservaEdicion
                                                                ?.aerolineaReserva
                                                                .codigoIataAerolinea ??
                                                            vueloSeleccionado
                                                                ?.aerolineaVuelo
                                                                ?.codigoIataAerolinea,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                guardando
                                            }
                                        >
                                            Generar
                                        </button>
                                    </div>
                                    <small>
                                        Único dentro de la
                                        aerolínea.
                                    </small>
                                </label>

                                <label className="reservas-campo">
                                    <span>Estado</span>
                                    <select
                                        value={
                                            formulario.estadoReserva
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'estadoReserva',
                                                evento.target
                                                    .value as EstadoReserva,
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        {estadosReserva.map(
                                            (estado) => (
                                                <option
                                                    key={estado}
                                                    value={
                                                        estado
                                                    }
                                                >
                                                    {etiquetaEstado(
                                                        estado,
                                                    )}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <small>
                                        Una reserva nueva inicia
                                        como PENDIENTE.
                                    </small>
                                </label>
                            </div>

                            <div className="reservas-formulario__rejilla reservas-formulario__rejilla--final">
                                <label className="reservas-campo">
                                    <span>
                                        Total de la reserva
                                    </span>
                                    <div className="reservas-campo-con-unidad">
                                        <span>$</span>
                                        <input
                                            type="number"
                                            value={
                                                formulario.totalReserva
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'totalReserva',
                                                    evento.target
                                                        .value,
                                                )
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="79.90"
                                            required
                                            disabled={
                                                guardando
                                            }
                                        />
                                        <small>USD</small>
                                    </div>
                                    {vueloSeleccionado && (
                                        <small>
                                            Tarifa base del
                                            vuelo:{' '}
                                            {formatearPrecio(
                                                vueloSeleccionado.precioBaseVuelo,
                                            )}
                                        </small>
                                    )}
                                </label>

                                <label className="reservas-campo">
                                    <span>Observación</span>
                                    <textarea
                                        value={
                                            formulario.observacionReserva
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'observacionReserva',
                                                evento.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Indicaciones especiales o notas internas"
                                        maxLength={500}
                                        disabled={guardando}
                                    />
                                    <small>
                                        {
                                            formulario
                                                .observacionReserva
                                                .length
                                        }
                                        /500 caracteres
                                    </small>
                                </label>
                            </div>

                            <div className="reservas-aviso reservas-aviso--informacion">
                                <Icono
                                    nombre="informacion"
                                    tamano={21}
                                />
                                <div>
                                    <strong>
                                        Validación multi-tenant
                                    </strong>
                                    <span>
                                        El vuelo y el pasajero
                                        deben pertenecer a la misma
                                        aerolínea. El backend valida
                                        también duplicados y
                                        capacidad.
                                    </span>
                                </div>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="reservas-mensaje reservas-mensaje--error"
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

                            <footer className="reservas-modal__acciones">
                                <button
                                    type="button"
                                    className="reservas-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="reservas-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="reservas-cargador reservas-cargador--boton" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    reservaEdicion
                                                        ? 'editar'
                                                        : 'agregar'
                                                }
                                            />
                                            {reservaEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar reserva'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {reservaEliminar && (
                <div
                    className="reservas-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target ===
                            evento.currentTarget
                        ) {
                            setReservaEliminar(null)
                        }
                    }}
                >
                    <section
                        className="reservas-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="reservas-eliminar-titulo"
                    >
                        <span className="reservas-confirmacion__icono">
                            <Icono
                                nombre="eliminar"
                                tamano={26}
                            />
                        </span>
                        <span className="reservas-etiqueta">
                            Eliminar registro
                        </span>
                        <h3 id="reservas-eliminar-titulo">
                            ¿Eliminar{' '}
                            {reservaEliminar.codigoReserva}?
                        </h3>
                        <p>
                            Esta acción elimina definitivamente
                            la reserva. Si tiene un boleto
                            asociado, el backend impedirá la
                            eliminación y deberá cambiarse a
                            CANCELADA.
                        </p>
                        <div className="reservas-confirmacion__detalle">
                            <strong>
                                {nombreCompletoPasajero(
                                    reservaEliminar.pasajeroReserva,
                                )}
                            </strong>
                            <span>
                                {
                                    reservaEliminar.vueloReserva
                                        .numeroVuelo
                                }{' '}
                                ·{' '}
                                {
                                    reservaEliminar.vueloReserva
                                        .rutaVuelo
                                        .aeropuertoOrigenRuta
                                        .codigoIataAeropuerto
                                }{' '}
                                →{' '}
                                {
                                    reservaEliminar.vueloReserva
                                        .rutaVuelo
                                        .aeropuertoDestinoRuta
                                        .codigoIataAeropuerto
                                }
                            </span>
                        </div>
                        <div className="reservas-confirmacion__acciones">
                            <button
                                type="button"
                                className="reservas-boton-secundario"
                                onClick={() =>
                                    setReservaEliminar(null)
                                }
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="reservas-boton-peligro"
                                onClick={() =>
                                    void eliminar()
                                }
                                disabled={eliminando}
                            >
                                <Icono nombre="eliminar" />
                                {eliminando
                                    ? 'Eliminando'
                                    : 'Eliminar reserva'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

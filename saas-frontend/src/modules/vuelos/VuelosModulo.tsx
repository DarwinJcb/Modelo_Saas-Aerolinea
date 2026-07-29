/* saas-frontend/src/modules/vuelos/VuelosModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './VuelosModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoVuelo =
    | 'PROGRAMADO'
    | 'EMBARQUE'
    | 'EN_VUELO'
    | 'FINALIZADO'
    | 'CANCELADO'

type EstadoRuta = 'ACTIVA' | 'INACTIVA'
type EstadoAvion =
    | 'DISPONIBLE'
    | 'MANTENIMIENTO'
    | 'FUERA_DE_SERVICIO'
type FiltroEstado = 'TODOS' | EstadoVuelo
type FiltroPeriodo = 'TODOS' | 'HOY' | 'PROXIMOS' | 'PASADOS'

type IconoNombre =
    | 'vuelo'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'ruta'
    | 'avion'
    | 'calendario'
    | 'reloj'
    | 'puerta'
    | 'dinero'
    | 'aerolinea'
    | 'asientos'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea: string
    estadoAerolinea: string
}

interface AeropuertoResumen {
    idAeropuerto: number
    codigoIataAeropuerto: string
    nombreAeropuerto: string
    ciudadAeropuerto: string
    paisAeropuerto: string
}

interface RutaResumen {
    idRuta: number
    fkAerolineaRuta?: number
    codigoRuta: string
    duracionEstimadaMinutosRuta: number
    distanciaKilometrosRuta: number | string | null
    estadoRuta: EstadoRuta
    aerolineaRuta?: AerolineaResumen
    aeropuertoOrigenRuta: AeropuertoResumen
    aeropuertoDestinoRuta: AeropuertoResumen
}

interface AvionResumen {
    idAvion: number
    fkAerolineaAvion?: number
    matriculaAvion: string
    codigoInternoAvion: string
    modeloAvion: string
    fabricanteAvion: string
    capacidadAvion: number
    estadoAvion: EstadoAvion
    aerolineaAvion?: AerolineaResumen
}

interface Vuelo {
    idVuelo: number
    fkAerolineaVuelo: number
    fkRutaVuelo: number
    fkAvionVuelo: number
    numeroVuelo: string
    fechaHoraSalidaVuelo: string
    fechaHoraLlegadaVuelo: string
    puertaEmbarqueVuelo: string | null
    precioBaseVuelo: number | string
    estadoVuelo: EstadoVuelo
    aerolineaVuelo: AerolineaResumen
    rutaVuelo: RutaResumen
    avionVuelo: AvionResumen
}

interface FormularioVuelo {
    fkAerolineaVuelo: string
    fkRutaVuelo: string
    fkAvionVuelo: string
    numeroVuelo: string
    fechaHoraSalidaVuelo: string
    fechaHoraLlegadaVuelo: string
    puertaEmbarqueVuelo: string
    precioBaseVuelo: string
    estadoVuelo: EstadoVuelo
}

interface VuelosModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    vuelos: Vuelo[]
    rutas: RutaResumen[]
    aviones: AvionResumen[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioVuelo = {
    fkAerolineaVuelo: '',
    fkRutaVuelo: '',
    fkAvionVuelo: '',
    numeroVuelo: '',
    fechaHoraSalidaVuelo: '',
    fechaHoraLlegadaVuelo: '',
    puertaEmbarqueVuelo: '',
    precioBaseVuelo: '',
    estadoVuelo: 'PROGRAMADO',
}

const estadosVuelo: EstadoVuelo[] = [
    'PROGRAMADO',
    'EMBARQUE',
    'EN_VUELO',
    'FINALIZADO',
    'CANCELADO',
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
        case 'vuelo':
            return (
                <svg {...props}>
                    <path d="M4 17c4-7 8-10 16-11" />
                    <path d="m12 10 7-4-3 7-2-2-3 1z" />
                    <circle cx="4" cy="17" r="2" />
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
        case 'ruta':
            return (
                <svg {...props}>
                    <circle cx="5" cy="18" r="2.5" />
                    <circle cx="19" cy="6" r="2.5" />
                    <path d="M7.5 18c4 0 1.5-7 6-7H15" />
                    <path d="m12.5 7.5 2.5 3.5-4 1" />
                </svg>
            )
        case 'avion':
            return (
                <svg {...props}>
                    <path d="M3 13.2 21 5l-5.7 14-3.7-5.1L6 16z" />
                    <path d="m11.6 13.9 4.6-4.5" />
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
        case 'puerta':
            return (
                <svg {...props}>
                    <path d="M5 21V4h12v17M5 21h14" />
                    <path d="M13 12h.01" />
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
        case 'asientos':
            return (
                <svg {...props}>
                    <path d="M7 11V7a3 3 0 0 1 6 0v4" />
                    <path d="M5 11h10a3 3 0 0 1 3 3v4H7a2 2 0 0 1-2-2z" />
                    <path d="M7 18v3M17 18v3" />
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

function formatearFabricanteModelo(
    fabricante: string,
    modelo: string,
): string {
    const fabricanteLimpio = fabricante.trim()
    const modeloLimpio = modelo.trim()

    if (!fabricanteLimpio) {
        return modeloLimpio
    }

    if (!modeloLimpio) {
        return fabricanteLimpio
    }

    const fabricanteNormalizado =
        normalizarBusqueda(fabricanteLimpio)

    const modeloNormalizado =
        normalizarBusqueda(modeloLimpio)

    if (
        modeloNormalizado === fabricanteNormalizado ||
        modeloNormalizado.startsWith(
            `${fabricanteNormalizado} `,
        )
    ) {
        return modeloLimpio
    }

    return `${fabricanteLimpio} ${modeloLimpio}`
}

function ordenarVuelos(lista: Vuelo[]): Vuelo[] {
    return [...lista].sort(
        (a, b) =>
            new Date(a.fechaHoraSalidaVuelo).getTime() -
            new Date(b.fechaHoraSalidaVuelo).getTime(),
    )
}

function ordenarRutas(lista: RutaResumen[]): RutaResumen[] {
    return [...lista].sort((a, b) =>
        a.codigoRuta.localeCompare(b.codigoRuta, 'es'),
    )
}

function ordenarAviones(
    lista: AvionResumen[],
): AvionResumen[] {
    return [...lista].sort((a, b) =>
        a.codigoInternoAvion.localeCompare(
            b.codigoInternoAvion,
            'es',
        ),
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

function obtenerIdAerolineaRuta(
    ruta: RutaResumen,
): number | null {
    if (
        typeof ruta.fkAerolineaRuta === 'number' &&
        Number.isFinite(ruta.fkAerolineaRuta)
    ) {
        return ruta.fkAerolineaRuta
    }

    return ruta.aerolineaRuta?.idAerolinea ?? null
}

function obtenerIdAerolineaAvion(
    avion: AvionResumen,
): number | null {
    if (
        typeof avion.fkAerolineaAvion === 'number' &&
        Number.isFinite(avion.fkAerolineaAvion)
    ) {
        return avion.fkAerolineaAvion
    }

    return avion.aerolineaAvion?.idAerolinea ?? null
}

function etiquetaEstado(estado: EstadoVuelo): string {
    switch (estado) {
        case 'PROGRAMADO':
            return 'Programado'
        case 'EMBARQUE':
            return 'Embarque'
        case 'EN_VUELO':
            return 'En vuelo'
        case 'FINALIZADO':
            return 'Finalizado'
        case 'CANCELADO':
            return 'Cancelado'
    }
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

function formatearDuracion(minutos: number): string {
    if (minutos < 60) {
        return `${minutos} min`
    }

    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    return minutosRestantes > 0
        ? `${horas} h ${minutosRestantes} min`
        : `${horas} h`
}

function obtenerDuracionReal(vuelo: Vuelo): string {
    const salida = new Date(vuelo.fechaHoraSalidaVuelo).getTime()
    const llegada = new Date(vuelo.fechaHoraLlegadaVuelo).getTime()

    if (
        Number.isNaN(salida) ||
        Number.isNaN(llegada) ||
        llegada <= salida
    ) {
        return 'Duración no válida'
    }

    return formatearDuracion(
        Math.round((llegada - salida) / 60000),
    )
}

function aFechaLocalInput(fechaIso: string): string {
    const fecha = new Date(fechaIso)

    if (Number.isNaN(fecha.getTime())) {
        return ''
    }

    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    const hora = String(fecha.getHours()).padStart(2, '0')
    const minuto = String(fecha.getMinutes()).padStart(2, '0')

    return `${anio}-${mes}-${dia}T${hora}:${minuto}`
}

function sumarMinutosFechaLocal(
    fechaLocal: string,
    minutos: number,
): string {
    const fecha = new Date(fechaLocal)

    if (Number.isNaN(fecha.getTime())) {
        return ''
    }

    fecha.setMinutes(fecha.getMinutes() + minutos)

    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    const hora = String(fecha.getHours()).padStart(2, '0')
    const minuto = String(fecha.getMinutes()).padStart(2, '0')

    return `${anio}-${mes}-${dia}T${hora}:${minuto}`
}

function esMismoDia(fecha: Date, referencia: Date): boolean {
    return (
        fecha.getFullYear() === referencia.getFullYear() &&
        fecha.getMonth() === referencia.getMonth() &&
        fecha.getDate() === referencia.getDate()
    )
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudVuelos = solicitar<Vuelo[]>('/vuelos', token, {
        signal,
    })
    const solicitudRutas = solicitar<RutaResumen[]>('/rutas', token, {
        signal,
    })
    const solicitudAviones = solicitar<AvionResumen[]>(
        '/aviones',
        token,
        { signal },
    )
    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [vuelos, rutas, aviones, aerolineas] =
        await Promise.all([
            solicitudVuelos,
            solicitudRutas,
            solicitudAviones,
            solicitudAerolineas,
        ])

    return {
        vuelos: ordenarVuelos(Array.isArray(vuelos) ? vuelos : []),
        rutas: ordenarRutas(Array.isArray(rutas) ? rutas : []),
        aviones: ordenarAviones(
            Array.isArray(aviones) ? aviones : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function VuelosModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: VuelosModuloProps) {
    const [vuelos, setVuelos] = useState<Vuelo[]>([])
    const [rutas, setRutas] = useState<RutaResumen[]>([])
    const [aviones, setAviones] = useState<AvionResumen[]>([])
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
    const [filtroPeriodo, setFiltroPeriodo] =
        useState<FiltroPeriodo>('TODOS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [vueloEdicion, setVueloEdicion] =
        useState<Vuelo | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioVuelo>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [vueloEliminar, setVueloEliminar] =
        useState<Vuelo | null>(null)

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

                setVuelos(datos.vuelos)
                setRutas(datos.rutas)
                setAviones(datos.aviones)
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
                            : 'No fue posible cargar los vuelos.',
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

    const rutasActivas = useMemo(
        () => rutas.filter((ruta) => ruta.estadoRuta === 'ACTIVA'),
        [rutas],
    )

    const avionesDisponibles = useMemo(
        () =>
            aviones.filter(
                (avion) => avion.estadoAvion === 'DISPONIBLE',
            ),
        [aviones],
    )

    const puedeAbrirCreacion = useMemo(() => {
        if (!puedeCrear) {
            return false
        }

        if (!esSuperadmin) {
            return (
                rutasActivas.length > 0 &&
                avionesDisponibles.length > 0
            )
        }

        return aerolineasActivas.some((aerolinea) => {
            const tieneRuta = rutasActivas.some(
                (ruta) =>
                    obtenerIdAerolineaRuta(ruta) ===
                    aerolinea.idAerolinea,
            )
            const tieneAvion = avionesDisponibles.some(
                (avion) =>
                    obtenerIdAerolineaAvion(avion) ===
                    aerolinea.idAerolinea,
            )

            return tieneRuta && tieneAvion
        })
    }, [
        puedeCrear,
        esSuperadmin,
        rutasActivas,
        avionesDisponibles,
        aerolineasActivas,
    ])

    const vuelosFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())
        const ahora = new Date()

        return vuelos.filter((vuelo) => {
            if (
                filtroEstado !== 'TODOS' &&
                vuelo.estadoVuelo !== filtroEstado
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                vuelo.fkAerolineaVuelo !== Number(filtroAerolinea)
            ) {
                return false
            }

            const salida = new Date(vuelo.fechaHoraSalidaVuelo)
            const llegada = new Date(vuelo.fechaHoraLlegadaVuelo)

            if (filtroPeriodo === 'HOY' && !esMismoDia(salida, ahora)) {
                return false
            }

            if (
                filtroPeriodo === 'PROXIMOS' &&
                (salida < ahora || vuelo.estadoVuelo === 'CANCELADO')
            ) {
                return false
            }

            if (
                filtroPeriodo === 'PASADOS' &&
                llegada >= ahora &&
                vuelo.estadoVuelo !== 'FINALIZADO'
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    vuelo.numeroVuelo,
                    vuelo.aerolineaVuelo.nombreComercialAerolinea,
                    vuelo.aerolineaVuelo.codigoIataAerolinea,
                    vuelo.rutaVuelo.codigoRuta,
                    vuelo.rutaVuelo.aeropuertoOrigenRuta.codigoIataAeropuerto,
                    vuelo.rutaVuelo.aeropuertoOrigenRuta.ciudadAeropuerto,
                    vuelo.rutaVuelo.aeropuertoDestinoRuta.codigoIataAeropuerto,
                    vuelo.rutaVuelo.aeropuertoDestinoRuta.ciudadAeropuerto,
                    vuelo.avionVuelo.codigoInternoAvion,
                    vuelo.avionVuelo.matriculaAvion,
                    vuelo.avionVuelo.modeloAvion,
                    vuelo.puertaEmbarqueVuelo ?? '',
                ].join(' '),
            ).includes(texto)
        })
    }, [
        vuelos,
        busqueda,
        filtroEstado,
        filtroPeriodo,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const programados = vuelos.filter(
            (vuelo) => vuelo.estadoVuelo === 'PROGRAMADO',
        ).length
        const enOperacion = vuelos.filter(
            (vuelo) =>
                vuelo.estadoVuelo === 'EMBARQUE' ||
                vuelo.estadoVuelo === 'EN_VUELO',
        ).length
        const finalizados = vuelos.filter(
            (vuelo) => vuelo.estadoVuelo === 'FINALIZADO',
        ).length
        const cancelados = vuelos.filter(
            (vuelo) => vuelo.estadoVuelo === 'CANCELADO',
        ).length

        return {
            total: vuelos.length,
            programados,
            enOperacion,
            finalizados,
            cancelados,
        }
    }, [vuelos])

    const idAerolineaFormulario = useMemo(() => {
        if (vueloEdicion) {
            return vueloEdicion.fkAerolineaVuelo
        }

        if (esSuperadmin) {
            return formulario.fkAerolineaVuelo
                ? Number(formulario.fkAerolineaVuelo)
                : null
        }

        const idRuta = rutas.find(
            (ruta) =>
                ruta.idRuta === Number(formulario.fkRutaVuelo),
        )

        return idRuta ? obtenerIdAerolineaRuta(idRuta) : null
    }, [
        vueloEdicion,
        esSuperadmin,
        formulario.fkAerolineaVuelo,
        formulario.fkRutaVuelo,
        rutas,
    ])

    const rutasFormulario = useMemo(() => {
        return rutas.filter((ruta) => {
            const perteneceAerolinea =
                !esSuperadmin ||
                idAerolineaFormulario === null ||
                obtenerIdAerolineaRuta(ruta) === idAerolineaFormulario

            const esActual =
                vueloEdicion?.fkRutaVuelo === ruta.idRuta

            return (
                perteneceAerolinea &&
                (ruta.estadoRuta === 'ACTIVA' || esActual)
            )
        })
    }, [
        rutas,
        esSuperadmin,
        idAerolineaFormulario,
        vueloEdicion,
    ])

    const avionesFormulario = useMemo(() => {
        return aviones.filter((avion) => {
            const perteneceAerolinea =
                !esSuperadmin ||
                idAerolineaFormulario === null ||
                obtenerIdAerolineaAvion(avion) === idAerolineaFormulario

            const esActual =
                vueloEdicion?.fkAvionVuelo === avion.idAvion

            return (
                perteneceAerolinea &&
                (avion.estadoAvion === 'DISPONIBLE' || esActual)
            )
        })
    }, [
        aviones,
        esSuperadmin,
        idAerolineaFormulario,
        vueloEdicion,
    ])

    const rutaSeleccionada = rutas.find(
        (ruta) =>
            ruta.idRuta === Number(formulario.fkRutaVuelo),
    )
    const avionSeleccionado = aviones.find(
        (avion) =>
            avion.idAvion === Number(formulario.fkAvionVuelo),
    )

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

            setVuelos(datos.vuelos)
            setRutas(datos.rutas)
            setAviones(datos.aviones)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar los vuelos.',
            )
        } finally {
            setCargando(false)
        }
    }

    function obtenerPrimerosRecursos(
        idAerolinea: number | null,
    ): {
        idRuta: string
        idAvion: string
    } {
        const primeraRuta = rutasActivas.find(
            (ruta) =>
                idAerolinea === null ||
                obtenerIdAerolineaRuta(ruta) === idAerolinea,
        )
        const primerAvion = avionesDisponibles.find(
            (avion) =>
                idAerolinea === null ||
                obtenerIdAerolineaAvion(avion) === idAerolinea,
        )

        return {
            idRuta: primeraRuta ? String(primeraRuta.idRuta) : '',
            idAvion: primerAvion ? String(primerAvion.idAvion) : '',
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        let idAerolinea: number | null = null

        if (esSuperadmin) {
            const aerolineaConRecursos = aerolineasActivas.find(
                (aerolinea) => {
                    const tieneRuta = rutasActivas.some(
                        (ruta) =>
                            obtenerIdAerolineaRuta(ruta) ===
                            aerolinea.idAerolinea,
                    )
                    const tieneAvion = avionesDisponibles.some(
                        (avion) =>
                            obtenerIdAerolineaAvion(avion) ===
                            aerolinea.idAerolinea,
                    )

                    return tieneRuta && tieneAvion
                },
            )

            idAerolinea =
                aerolineasActivas.length === 1
                    ? aerolineasActivas[0].idAerolinea
                    : aerolineaConRecursos?.idAerolinea ?? null
        }

        const recursos = obtenerPrimerosRecursos(idAerolinea)

        setVueloEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaVuelo:
                idAerolinea === null ? '' : String(idAerolinea),
            fkRutaVuelo: recursos.idRuta,
            fkAvionVuelo: recursos.idAvion,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(vuelo: Vuelo) {
        setVueloEdicion(vuelo)
        setFormulario({
            fkAerolineaVuelo: String(vuelo.fkAerolineaVuelo),
            fkRutaVuelo: String(vuelo.fkRutaVuelo),
            fkAvionVuelo: String(vuelo.fkAvionVuelo),
            numeroVuelo: vuelo.numeroVuelo,
            fechaHoraSalidaVuelo: aFechaLocalInput(
                vuelo.fechaHoraSalidaVuelo,
            ),
            fechaHoraLlegadaVuelo: aFechaLocalInput(
                vuelo.fechaHoraLlegadaVuelo,
            ),
            puertaEmbarqueVuelo:
                vuelo.puertaEmbarqueVuelo ?? '',
            precioBaseVuelo: String(vuelo.precioBaseVuelo),
            estadoVuelo: vuelo.estadoVuelo,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setVueloEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioVuelo>(
        campo: K,
        valor: FormularioVuelo[K],
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
        const recursos = obtenerPrimerosRecursos(idNumerico)

        setFormulario((actual) => ({
            ...actual,
            fkAerolineaVuelo: idAerolinea,
            fkRutaVuelo: recursos.idRuta,
            fkAvionVuelo: recursos.idAvion,
            fechaHoraLlegadaVuelo: '',
        }))
    }

    function cambiarRuta(idRuta: string) {
        const ruta = rutas.find(
            (elemento) => elemento.idRuta === Number(idRuta),
        )

        setFormulario((actual) => ({
            ...actual,
            fkRutaVuelo: idRuta,
            fechaHoraLlegadaVuelo:
                actual.fechaHoraSalidaVuelo && ruta
                    ? sumarMinutosFechaLocal(
                        actual.fechaHoraSalidaVuelo,
                        ruta.duracionEstimadaMinutosRuta,
                    )
                    : actual.fechaHoraLlegadaVuelo,
        }))
    }

    function cambiarSalida(fechaSalida: string) {
        setFormulario((actual) => ({
            ...actual,
            fechaHoraSalidaVuelo: fechaSalida,
            fechaHoraLlegadaVuelo:
                fechaSalida && rutaSeleccionada
                    ? sumarMinutosFechaLocal(
                        fechaSalida,
                        rutaSeleccionada.duracionEstimadaMinutosRuta,
                    )
                    : actual.fechaHoraLlegadaVuelo,
        }))
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            vueloEdicion === null &&
            !formulario.fkAerolineaVuelo
        ) {
            return 'Selecciona la aerolínea propietaria del vuelo.'
        }

        if (!formulario.fkRutaVuelo) {
            return 'Selecciona la ruta del vuelo.'
        }

        if (!formulario.fkAvionVuelo) {
            return 'Selecciona el avión asignado.'
        }

        if (!/^[A-Z0-9-]{2,20}$/.test(formulario.numeroVuelo)) {
            return 'El número de vuelo debe tener entre 2 y 20 caracteres y usar solo letras, números o guiones.'
        }

        const salida = new Date(formulario.fechaHoraSalidaVuelo)
        const llegada = new Date(formulario.fechaHoraLlegadaVuelo)

        if (Number.isNaN(salida.getTime())) {
            return 'Selecciona una fecha y hora de salida válida.'
        }

        if (Number.isNaN(llegada.getTime())) {
            return 'Selecciona una fecha y hora de llegada válida.'
        }

        if (llegada <= salida) {
            return 'La fecha y hora de llegada debe ser posterior a la salida.'
        }

        const cambiaProgramacion =
            vueloEdicion === null ||
            formulario.fechaHoraSalidaVuelo !==
            aFechaLocalInput(vueloEdicion.fechaHoraSalidaVuelo) ||
            formulario.fechaHoraLlegadaVuelo !==
            aFechaLocalInput(vueloEdicion.fechaHoraLlegadaVuelo)

        if (cambiaProgramacion && salida <= new Date()) {
            return 'La fecha y hora de salida debe ser posterior a la fecha actual.'
        }

        if (formulario.puertaEmbarqueVuelo.length > 20) {
            return 'La puerta de embarque no puede superar los 20 caracteres.'
        }

        const precio = Number(formulario.precioBaseVuelo)

        if (!Number.isFinite(precio) || precio < 0) {
            return 'El precio base debe ser un número mayor o igual a cero.'
        }

        const decimales = formulario.precioBaseVuelo.split('.')[1]

        if (decimales && decimales.length > 2) {
            return 'El precio base puede tener máximo 2 decimales.'
        }

        const ruta = rutas.find(
            (elemento) =>
                elemento.idRuta === Number(formulario.fkRutaVuelo),
        )
        const avion = aviones.find(
            (elemento) =>
                elemento.idAvion === Number(formulario.fkAvionVuelo),
        )

        if (!ruta) {
            return 'La ruta seleccionada ya no está disponible.'
        }

        if (!avion) {
            return 'El avión seleccionado ya no está disponible.'
        }

        const cambiaRuta =
            vueloEdicion === null ||
            Number(formulario.fkRutaVuelo) !==
            vueloEdicion.fkRutaVuelo
        const cambiaAvion =
            vueloEdicion === null ||
            Number(formulario.fkAvionVuelo) !==
            vueloEdicion.fkAvionVuelo
        const reactivaVuelo =
            vueloEdicion?.estadoVuelo === 'CANCELADO' &&
            formulario.estadoVuelo !== 'CANCELADO'

        if (
            (cambiaRuta || cambiaProgramacion || reactivaVuelo) &&
            ruta.estadoRuta !== 'ACTIVA'
        ) {
            return 'La ruta debe estar ACTIVA para programar el vuelo.'
        }

        if (
            (cambiaAvion || cambiaProgramacion || reactivaVuelo) &&
            avion.estadoAvion !== 'DISPONIBLE'
        ) {
            return 'El avión debe estar DISPONIBLE para programar el vuelo.'
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

        const esEdicion = vueloEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                fkRutaVuelo: Number(formulario.fkRutaVuelo),
                fkAvionVuelo: Number(formulario.fkAvionVuelo),
                numeroVuelo: formulario.numeroVuelo.trim(),
                fechaHoraSalidaVuelo: new Date(
                    formulario.fechaHoraSalidaVuelo,
                ).toISOString(),
                fechaHoraLlegadaVuelo: new Date(
                    formulario.fechaHoraLlegadaVuelo,
                ).toISOString(),
                puertaEmbarqueVuelo:
                    formulario.puertaEmbarqueVuelo.trim() || undefined,
                precioBaseVuelo: Number(formulario.precioBaseVuelo),
                estadoVuelo: 'PROGRAMADO' as EstadoVuelo,
                ...(esSuperadmin
                    ? {
                        fkAerolineaVuelo: Number(
                            formulario.fkAerolineaVuelo,
                        ),
                    }
                    : {}),
            }
        } else {
            datos = {}

            if (
                Number(formulario.fkRutaVuelo) !==
                vueloEdicion.fkRutaVuelo
            ) {
                datos.fkRutaVuelo = Number(formulario.fkRutaVuelo)
            }

            if (
                Number(formulario.fkAvionVuelo) !==
                vueloEdicion.fkAvionVuelo
            ) {
                datos.fkAvionVuelo = Number(formulario.fkAvionVuelo)
            }

            if (
                formulario.numeroVuelo.trim() !==
                vueloEdicion.numeroVuelo
            ) {
                datos.numeroVuelo = formulario.numeroVuelo.trim()
            }

            if (
                formulario.fechaHoraSalidaVuelo !==
                aFechaLocalInput(vueloEdicion.fechaHoraSalidaVuelo)
            ) {
                datos.fechaHoraSalidaVuelo = new Date(
                    formulario.fechaHoraSalidaVuelo,
                ).toISOString()
            }

            if (
                formulario.fechaHoraLlegadaVuelo !==
                aFechaLocalInput(vueloEdicion.fechaHoraLlegadaVuelo)
            ) {
                datos.fechaHoraLlegadaVuelo = new Date(
                    formulario.fechaHoraLlegadaVuelo,
                ).toISOString()
            }

            if (
                formulario.puertaEmbarqueVuelo.trim() !==
                (vueloEdicion.puertaEmbarqueVuelo ?? '')
            ) {
                datos.puertaEmbarqueVuelo =
                    formulario.puertaEmbarqueVuelo.trim()
            }

            if (
                Number(formulario.precioBaseVuelo) !==
                Number(vueloEdicion.precioBaseVuelo)
            ) {
                datos.precioBaseVuelo = Number(
                    formulario.precioBaseVuelo,
                )
            }

            if (formulario.estadoVuelo !== vueloEdicion.estadoVuelo) {
                datos.estadoVuelo = formulario.estadoVuelo
            }

            if (Object.keys(datos).length === 0) {
                setGuardando(false)
                setErrorFormulario('No existen cambios para guardar.')
                return
            }
        }

        try {
            const vueloGuardado = await solicitar<Vuelo>(
                esEdicion
                    ? `/vuelos/${vueloEdicion.idVuelo}`
                    : '/vuelos',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setVuelos((lista) =>
                ordenarVuelos([
                    ...lista.filter(
                        (vuelo) => vuelo.idVuelo !== vueloGuardado.idVuelo,
                    ),
                    vueloGuardado,
                ]),
            )
            setFormularioAbierto(false)
            setVueloEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Vuelo actualizado correctamente.'
                    : 'Vuelo programado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el vuelo.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!vueloEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(`/vuelos/${vueloEliminar.idVuelo}`, token, {
                method: 'DELETE',
            })

            setVuelos((lista) =>
                lista.filter(
                    (vuelo) => vuelo.idVuelo !== vueloEliminar.idVuelo,
                ),
            )
            setVueloEliminar(null)
            setMensajeExito('Vuelo eliminado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el vuelo.',
            )
            setVueloEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="vuelos-modulo">
            <header className="vuelos-cabecera">
                <div className="vuelos-cabecera__texto">
                    <span className="vuelos-etiqueta">
                        Operación y programación
                    </span>
                    <h2>Gestión de Vuelos</h2>
                    <p>
                        Programa salidas, asigna rutas y aeronaves, y controla
                        el estado operativo de cada vuelo.
                    </p>
                </div>

                <div className="vuelos-cabecera__acciones">
                    <button
                        type="button"
                        className="vuelos-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    {puedeCrear && (
                        <button
                            type="button"
                            className="vuelos-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Programar un nuevo vuelo'
                                    : 'Se necesita una ruta activa y un avión disponible de la misma aerolínea'
                            }
                        >
                            <Icono nombre="agregar" />
                            Nuevo vuelo
                        </button>
                    )}
                </div>
            </header>

            {esEmpleado && (
                <div className="vuelos-aviso vuelos-aviso--operacion">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>Operación de vuelos habilitada</strong>
                        <span>
                            Puedes programar y actualizar vuelos de {nombreAerolinea}.
                            La eliminación corresponde a los administradores.
                        </span>
                    </div>
                </div>
            )}

            {puedeCrear && !puedeAbrirCreacion && !cargando && (
                <div className="vuelos-aviso vuelos-aviso--advertencia">
                    <Icono nombre="alerta" tamano={21} />
                    <div>
                        <strong>Faltan recursos operativos</strong>
                        <span>
                            Debe existir una ruta ACTIVA y un avión DISPONIBLE de la
                            misma aerolínea para programar un vuelo.
                        </span>
                    </div>
                </div>
            )}

            {mensajeExito && (
                <div className="vuelos-mensaje vuelos-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="vuelos-mensaje vuelos-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="vuelos-resumen">
                <article>
                    <span>Total de vuelos</span>
                    <strong>{resumen.total}</strong>
                    <small>Registros disponibles</small>
                </article>
                <article>
                    <span>Programados</span>
                    <strong>{resumen.programados}</strong>
                    <small className="vuelos-texto-programado">
                        Próximas operaciones
                    </small>
                </article>
                <article>
                    <span>En operación</span>
                    <strong>{resumen.enOperacion}</strong>
                    <small>Embarque o en vuelo</small>
                </article>
                <article>
                    <span>Vuelos cerrados</span>
                    <strong>{resumen.finalizados + resumen.cancelados}</strong>
                    <small>
                        {resumen.finalizados} finalizados · {resumen.cancelados}{' '}
                        cancelados
                    </small>
                </article>
            </div>

            <section className="vuelos-catalogo">
                <div className="vuelos-filtros">
                    <label className="vuelos-buscador">
                        <Icono nombre="buscar" tamano={20} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por vuelo, aerolínea, ruta, aeropuerto o avión'
                                    : 'Buscar por vuelo, ruta, aeropuerto o avión'
                            }
                        />
                    </label>

                    <label className="vuelos-selector-filtro">
                        <span>Estado</span>
                        <select
                            value={filtroEstado}
                            onChange={(evento) =>
                                setFiltroEstado(
                                    evento.target.value as FiltroEstado,
                                )
                            }
                        >
                            <option value="TODOS">Todos</option>
                            {estadosVuelo.map((estado) => (
                                <option key={estado} value={estado}>
                                    {etiquetaEstado(estado)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="vuelos-selector-filtro">
                        <span>Periodo</span>
                        <select
                            value={filtroPeriodo}
                            onChange={(evento) =>
                                setFiltroPeriodo(
                                    evento.target.value as FiltroPeriodo,
                                )
                            }
                        >
                            <option value="TODOS">Todos</option>
                            <option value="HOY">Hoy</option>
                            <option value="PROXIMOS">Próximos</option>
                            <option value="PASADOS">Pasados</option>
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="vuelos-selector-filtro">
                            <span>Aerolínea</span>
                            <select
                                value={filtroAerolinea}
                                onChange={(evento) =>
                                    setFiltroAerolinea(evento.target.value)
                                }
                            >
                                <option value="TODAS">Todas</option>
                                {aerolineas.map((aerolinea) => (
                                    <option
                                        key={aerolinea.idAerolinea}
                                        value={aerolinea.idAerolinea}
                                    >
                                        {aerolinea.nombreComercialAerolinea}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <span className="vuelos-resultados">
                        {vuelosFiltrados.length}{' '}
                        {vuelosFiltrados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="vuelos-estado-vacio">
                        <span className="vuelos-cargador" />
                        <strong>Cargando vuelos</strong>
                        <p>Consultando la programación operativa.</p>
                    </div>
                ) : vuelosFiltrados.length === 0 ? (
                    <div className="vuelos-estado-vacio">
                        <span className="vuelos-estado-vacio__icono">
                            <Icono nombre="vuelo" tamano={35} />
                        </span>
                        <strong>
                            {vuelos.length === 0
                                ? 'No existen vuelos programados'
                                : 'No hay vuelos que coincidan con los filtros'}
                        </strong>
                        <p>
                            {vuelos.length === 0
                                ? 'La programación todavía no contiene vuelos registrados.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {vuelos.length === 0 && puedeAbrirCreacion && (
                            <button
                                type="button"
                                className="vuelos-boton-principal"
                                onClick={abrirCreacion}
                            >
                                <Icono nombre="agregar" />
                                Programar el primero
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="vuelos-tabla-contenedor">
                        <table className="vuelos-tabla">
                            <thead>
                                <tr>
                                    <th>Vuelo</th>
                                    <th>Trayecto</th>
                                    <th>Programación</th>
                                    <th>Avión</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vuelosFiltrados.map((vuelo) => (
                                    <tr key={vuelo.idVuelo}>
                                        <td data-label="Vuelo">
                                            <div className="vuelos-identidad">
                                                <span className="vuelos-identidad__icono">
                                                    <Icono nombre="vuelo" tamano={21} />
                                                </span>
                                                <div>
                                                    <strong>{vuelo.numeroVuelo}</strong>
                                                    <span>ID #{vuelo.idVuelo}</span>
                                                    {esSuperadmin && (
                                                        <small>
                                                            {
                                                                vuelo.aerolineaVuelo
                                                                    .nombreComercialAerolinea
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Trayecto">
                                            <div className="vuelos-trayecto">
                                                <div>
                                                    <strong>
                                                        {
                                                            vuelo.rutaVuelo
                                                                .aeropuertoOrigenRuta
                                                                .codigoIataAeropuerto
                                                        }
                                                    </strong>
                                                    <span>
                                                        {
                                                            vuelo.rutaVuelo
                                                                .aeropuertoOrigenRuta
                                                                .ciudadAeropuerto
                                                        }
                                                    </span>
                                                </div>
                                                <span className="vuelos-trayecto__linea">
                                                    <Icono nombre="vuelo" tamano={18} />
                                                </span>
                                                <div>
                                                    <strong>
                                                        {
                                                            vuelo.rutaVuelo
                                                                .aeropuertoDestinoRuta
                                                                .codigoIataAeropuerto
                                                        }
                                                    </strong>
                                                    <span>
                                                        {
                                                            vuelo.rutaVuelo
                                                                .aeropuertoDestinoRuta
                                                                .ciudadAeropuerto
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <small className="vuelos-ruta-codigo">
                                                {vuelo.rutaVuelo.codigoRuta}
                                            </small>
                                        </td>

                                        <td data-label="Programación">
                                            <div className="vuelos-programacion">
                                                <div>
                                                    <Icono nombre="calendario" tamano={17} />
                                                    <span>
                                                        {formatearFecha(
                                                            vuelo.fechaHoraSalidaVuelo,
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <Icono nombre="reloj" tamano={17} />
                                                    <strong>
                                                        {formatearHora(
                                                            vuelo.fechaHoraSalidaVuelo,
                                                        )}{' '}
                                                        →{' '}
                                                        {formatearHora(
                                                            vuelo.fechaHoraLlegadaVuelo,
                                                        )}
                                                    </strong>
                                                    <span>{obtenerDuracionReal(vuelo)}</span>
                                                </div>
                                                <div>
                                                    <Icono nombre="puerta" tamano={17} />
                                                    <span>
                                                        Puerta{' '}
                                                        {vuelo.puertaEmbarqueVuelo || 'por asignar'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Avión">
                                            <div className="vuelos-avion">
                                                <span className="vuelos-avion__icono">
                                                    <Icono nombre="avion" tamano={19} />
                                                </span>
                                                <div>
                                                    <strong>
                                                        {vuelo.avionVuelo.codigoInternoAvion}
                                                    </strong>
                                                    <span>
                                                        {formatearFabricanteModelo(
                                                            vuelo.avionVuelo.fabricanteAvion,
                                                            vuelo.avionVuelo.modeloAvion,
                                                        )}
                                                    </span>
                                                    <small>
                                                        {vuelo.avionVuelo.matriculaAvion} ·{' '}
                                                        {vuelo.avionVuelo.capacidadAvion} asientos
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Estado">
                                            <div className="vuelos-estado-columna">
                                                <span
                                                    className={`vuelos-insignia vuelos-insignia--${vuelo.estadoVuelo.toLowerCase()}`}
                                                >
                                                    <i />
                                                    {etiquetaEstado(vuelo.estadoVuelo)}
                                                </span>
                                                <small>
                                                    {formatearPrecio(vuelo.precioBaseVuelo)}
                                                </small>
                                            </div>
                                        </td>

                                        <td data-label="Acciones">
                                            <div className="vuelos-acciones-fila">
                                                {puedeEditar && (
                                                    <button
                                                        type="button"
                                                        className="vuelos-boton-icono"
                                                        onClick={() => abrirEdicion(vuelo)}
                                                        aria-label={`Editar vuelo ${vuelo.numeroVuelo}`}
                                                        title="Editar vuelo"
                                                    >
                                                        <Icono nombre="editar" tamano={19} />
                                                    </button>
                                                )}
                                                {puedeEliminar && (
                                                    <button
                                                        type="button"
                                                        className="vuelos-boton-icono vuelos-boton-icono--peligro"
                                                        onClick={() => setVueloEliminar(vuelo)}
                                                        aria-label={`Eliminar vuelo ${vuelo.numeroVuelo}`}
                                                        title="Eliminar vuelo"
                                                    >
                                                        <Icono nombre="eliminar" tamano={19} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div
                    className="vuelos-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            cerrarFormulario()
                        }
                    }}
                >
                    <section
                        className="vuelos-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vuelos-formulario-titulo"
                    >
                        <header className="vuelos-modal__cabecera">
                            <div className="vuelos-modal__titulo">
                                <span className="vuelos-modal__icono">
                                    <Icono nombre="vuelo" tamano={24} />
                                </span>
                                <div>
                                    <span>
                                        {vueloEdicion
                                            ? 'Actualización operativa'
                                            : 'Nueva programación'}
                                    </span>
                                    <h3 id="vuelos-formulario-titulo">
                                        {vueloEdicion
                                            ? `Editar ${vueloEdicion.numeroVuelo}`
                                            : 'Programar vuelo'}
                                    </h3>
                                    <p>
                                        Define la aerolínea, los recursos y los horarios
                                        de la operación.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="vuelos-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" tamano={23} />
                            </button>
                        </header>

                        <form className="vuelos-formulario" onSubmit={guardar}>
                            {esSuperadmin && vueloEdicion === null ? (
                                <label className="vuelos-campo vuelos-campo--completo">
                                    <span>Aerolínea propietaria</span>
                                    <select
                                        value={formulario.fkAerolineaVuelo}
                                        onChange={(evento) =>
                                            cambiarAerolinea(evento.target.value)
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">
                                            Selecciona una aerolínea
                                        </option>
                                        {aerolineasActivas.map((aerolinea) => (
                                            <option
                                                key={aerolinea.idAerolinea}
                                                value={aerolinea.idAerolinea}
                                            >
                                                {aerolinea.nombreComercialAerolinea} ·{' '}
                                                {aerolinea.codigoIataAerolinea}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : (
                                <div className="vuelos-propietario">
                                    <Icono nombre="aerolinea" tamano={20} />
                                    <div>
                                        <span>Aerolínea propietaria</span>
                                        <strong>
                                            {vueloEdicion
                                                ? vueloEdicion.aerolineaVuelo
                                                    .nombreComercialAerolinea
                                                : nombreAerolinea}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className="vuelos-formulario__rejilla">
                                <label className="vuelos-campo">
                                    <span>Ruta</span>
                                    <select
                                        value={formulario.fkRutaVuelo}
                                        onChange={(evento) =>
                                            cambiarRuta(evento.target.value)
                                        }
                                        required
                                        disabled={
                                            guardando ||
                                            (esSuperadmin &&
                                                vueloEdicion === null &&
                                                !formulario.fkAerolineaVuelo)
                                        }
                                    >
                                        <option value="">Selecciona una ruta</option>
                                        {rutasFormulario.map((ruta) => (
                                            <option key={ruta.idRuta} value={ruta.idRuta}>
                                                {
                                                    ruta.aeropuertoOrigenRuta
                                                        .codigoIataAeropuerto
                                                }{' '}
                                                →{' '}
                                                {
                                                    ruta.aeropuertoDestinoRuta
                                                        .codigoIataAeropuerto
                                                }{' '}
                                                · {ruta.codigoRuta}
                                                {ruta.estadoRuta !== 'ACTIVA'
                                                    ? ' · INACTIVA'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="vuelos-campo">
                                    <span>Avión asignado</span>
                                    <select
                                        value={formulario.fkAvionVuelo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAvionVuelo',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando ||
                                            (esSuperadmin &&
                                                vueloEdicion === null &&
                                                !formulario.fkAerolineaVuelo)
                                        }
                                    >
                                        <option value="">Selecciona un avión</option>
                                        {avionesFormulario.map((avion) => (
                                            <option
                                                key={avion.idAvion}
                                                value={avion.idAvion}
                                            >
                                                {avion.codigoInternoAvion} ·{' '}
                                                {formatearFabricanteModelo(
                                                    avion.fabricanteAvion,
                                                    avion.modeloAvion,
                                                )}{' '}
                                                · {avion.capacidadAvion} asientos
                                                {avion.estadoAvion !== 'DISPONIBLE'
                                                    ? ` · ${avion.estadoAvion}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {rutaSeleccionada && (
                                <div className="vuelos-vista-previa">
                                    <div>
                                        <span>Origen</span>
                                        <strong>
                                            {
                                                rutaSeleccionada.aeropuertoOrigenRuta
                                                    .codigoIataAeropuerto
                                            }
                                        </strong>
                                        <small>
                                            {
                                                rutaSeleccionada.aeropuertoOrigenRuta
                                                    .ciudadAeropuerto
                                            }
                                        </small>
                                    </div>
                                    <span className="vuelos-vista-previa__linea">
                                        <Icono nombre="vuelo" tamano={21} />
                                        <small>
                                            {formatearDuracion(
                                                rutaSeleccionada.duracionEstimadaMinutosRuta,
                                            )}
                                        </small>
                                    </span>
                                    <div>
                                        <span>Destino</span>
                                        <strong>
                                            {
                                                rutaSeleccionada.aeropuertoDestinoRuta
                                                    .codigoIataAeropuerto
                                            }
                                        </strong>
                                        <small>
                                            {
                                                rutaSeleccionada.aeropuertoDestinoRuta
                                                    .ciudadAeropuerto
                                            }
                                        </small>
                                    </div>
                                    {avionSeleccionado && (
                                        <div className="vuelos-vista-previa__avion">
                                            <Icono nombre="asientos" tamano={20} />
                                            <span>
                                                {avionSeleccionado.capacidadAvion} asientos
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="vuelos-formulario__rejilla">
                                <label className="vuelos-campo">
                                    <span>Número de vuelo</span>
                                    <input
                                        type="text"
                                        value={formulario.numeroVuelo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'numeroVuelo',
                                                evento.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9-]/g, ''),
                                            )
                                        }
                                        placeholder="DJ-101"
                                        minLength={2}
                                        maxLength={20}
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Entre 2 y 20 letras, números o guiones.
                                    </small>
                                </label>

                                <label className="vuelos-campo">
                                    <span>Puerta de embarque</span>
                                    <input
                                        type="text"
                                        value={formulario.puertaEmbarqueVuelo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'puertaEmbarqueVuelo',
                                                evento.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="A12"
                                        maxLength={20}
                                        disabled={guardando}
                                    />
                                    <small>Campo opcional.</small>
                                </label>
                            </div>

                            <div className="vuelos-formulario__rejilla">
                                <label className="vuelos-campo">
                                    <span>Fecha y hora de salida</span>
                                    <input
                                        type="datetime-local"
                                        value={formulario.fechaHoraSalidaVuelo}
                                        onChange={(evento) =>
                                            cambiarSalida(evento.target.value)
                                        }
                                        required
                                        disabled={guardando}
                                    />
                                </label>

                                <label className="vuelos-campo">
                                    <span>Fecha y hora de llegada</span>
                                    <input
                                        type="datetime-local"
                                        value={formulario.fechaHoraLlegadaVuelo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fechaHoraLlegadaVuelo',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Se calcula inicialmente con la duración de la ruta.
                                    </small>
                                </label>
                            </div>

                            <div className="vuelos-formulario__rejilla">
                                <label className="vuelos-campo">
                                    <span>Precio base</span>
                                    <div className="vuelos-campo-con-unidad">
                                        <span>$</span>
                                        <input
                                            type="number"
                                            value={formulario.precioBaseVuelo}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'precioBaseVuelo',
                                                    evento.target.value,
                                                )
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="79.90"
                                            required
                                            disabled={guardando}
                                        />
                                        <small>USD</small>
                                    </div>
                                </label>

                                <label className="vuelos-campo">
                                    <span>Estado</span>
                                    <select
                                        value={formulario.estadoVuelo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'estadoVuelo',
                                                evento.target.value as EstadoVuelo,
                                            )
                                        }
                                        disabled={guardando || vueloEdicion === null}
                                    >
                                        {estadosVuelo.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {etiquetaEstado(estado)}
                                            </option>
                                        ))}
                                    </select>
                                    <small>
                                        {vueloEdicion === null
                                            ? 'Los vuelos nuevos se registran como PROGRAMADOS.'
                                            : 'Actualiza el estado según la operación.'}
                                    </small>
                                </label>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="vuelos-mensaje vuelos-mensaje--error"
                                    role="alert"
                                >
                                    <Icono nombre="alerta" tamano={19} />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <footer className="vuelos-modal__acciones">
                                <button
                                    type="button"
                                    className="vuelos-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="vuelos-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="vuelos-cargador vuelos-cargador--boton" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={vueloEdicion ? 'editar' : 'agregar'}
                                            />
                                            {vueloEdicion
                                                ? 'Guardar cambios'
                                                : 'Programar vuelo'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {vueloEliminar && (
                <div
                    className="vuelos-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            setVueloEliminar(null)
                        }
                    }}
                >
                    <section
                        className="vuelos-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="vuelos-eliminar-titulo"
                    >
                        <span className="vuelos-confirmacion__icono">
                            <Icono nombre="eliminar" tamano={26} />
                        </span>
                        <span className="vuelos-etiqueta">Eliminar registro</span>
                        <h3 id="vuelos-eliminar-titulo">
                            ¿Eliminar {vueloEliminar.numeroVuelo}?
                        </h3>
                        <p>
                            Esta acción elimina definitivamente el vuelo. Si tiene
                            reservas asociadas, el backend impedirá la eliminación y
                            deberá cambiarse a CANCELADO.
                        </p>
                        <div className="vuelos-confirmacion__detalle">
                            <strong>
                                {
                                    vueloEliminar.rutaVuelo.aeropuertoOrigenRuta
                                        .codigoIataAeropuerto
                                }{' '}
                                →{' '}
                                {
                                    vueloEliminar.rutaVuelo.aeropuertoDestinoRuta
                                        .codigoIataAeropuerto
                                }
                            </strong>
                            <span>
                                {formatearFecha(vueloEliminar.fechaHoraSalidaVuelo)} ·{' '}
                                {formatearHora(vueloEliminar.fechaHoraSalidaVuelo)}
                            </span>
                        </div>
                        <div className="vuelos-confirmacion__acciones">
                            <button
                                type="button"
                                className="vuelos-boton-secundario"
                                onClick={() => setVueloEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="vuelos-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                <Icono nombre="eliminar" />
                                {eliminando ? 'Eliminando' : 'Eliminar vuelo'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

/* saas-frontend/src/modules/suscripciones/SuscripcionesModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './SuscripcionesModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoSuscripcion =
    | 'PENDIENTE'
    | 'ACTIVA'
    | 'VENCIDA'
    | 'CANCELADA'

type EstadoPlan = 'ACTIVO' | 'INACTIVO'
type EstadoAerolinea = 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA'
type FiltroEstado = 'TODAS' | EstadoSuscripcion
type FiltroVigencia =
    | 'TODAS'
    | 'VIGENTES'
    | 'PROXIMAS'
    | 'FINALIZADAS'

type IconoNombre =
    | 'suscripcion'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'estado'
    | 'aerolinea'
    | 'plan'
    | 'calendario'
    | 'dinero'
    | 'reloj'
    | 'usuarios'
    | 'aviones'
    | 'vuelos'

interface Plan {
    idPlan: number
    nombrePlan: string
    descripcionPlan?: string | null
    precioMensualPlan: number | string
    limiteUsuariosPlan?: number
    limiteAvionesPlan?: number
    limiteVuelosMensualesPlan?: number
    estadoPlan: EstadoPlan
}

interface Aerolinea {
    idAerolinea: number
    nombreComercialAerolinea: string
    correoAerolinea: string
    codigoIataAerolinea?: string | null
    estadoAerolinea: EstadoAerolinea
}

interface Suscripcion {
    idSuscripcion: number
    fkPlanSuscripcion: number
    fkAerolineaSuscripcion: number
    fechaInicioSuscripcion: string
    fechaFinSuscripcion: string
    estadoSuscripcion: EstadoSuscripcion
    planSuscripcion: Plan
    aerolineaSuscripcion: Aerolinea
}

interface FormularioSuscripcion {
    fkPlanSuscripcion: string
    fkAerolineaSuscripcion: string
    fechaInicioSuscripcion: string
    fechaFinSuscripcion: string
    estadoSuscripcion: EstadoSuscripcion
}

interface SuscripcionesModuloProps {
    token: string
    rolUsuario: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    suscripciones: Suscripcion[]
    planes: Plan[]
    aerolineas: Aerolinea[]
}

class SesionExpiradaError extends Error { }

const estadosSuscripcion: EstadoSuscripcion[] = [
    'PENDIENTE',
    'ACTIVA',
    'VENCIDA',
    'CANCELADA',
]

function fechaLocalParaInput(fecha: Date): string {
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')

    return `${anio}-${mes}-${dia}`
}

function crearFormularioInicial(): FormularioSuscripcion {
    const inicio = new Date()
    const fin = new Date(inicio)
    fin.setFullYear(fin.getFullYear() + 1)

    return {
        fkPlanSuscripcion: '',
        fkAerolineaSuscripcion: '',
        fechaInicioSuscripcion: fechaLocalParaInput(inicio),
        fechaFinSuscripcion: fechaLocalParaInput(fin),
        estadoSuscripcion: 'ACTIVA',
    }
}

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
        case 'suscripcion':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3 9h18M7 15l2 2 4-4" />
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
        case 'estado':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8.5 12 2.3 2.3 4.8-5" />
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
        case 'plan':
            return (
                <svg {...props}>
                    <path d="M7 3h8l4 4v14H7z" />
                    <path d="M15 3v5h5M10 12h6M10 16h5" />
                </svg>
            )
        case 'calendario':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
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
        case 'reloj':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'usuarios':
            return (
                <svg {...props}>
                    <circle cx="9" cy="8" r="3" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M3.5 19c.5-3.5 2.3-5.5 5.5-5.5s5 2 5.5 5.5" />
                    <path d="M14.5 14.5c3.7-.4 5.7 1.1 6 4.5" />
                </svg>
            )
        case 'aviones':
            return (
                <svg {...props}>
                    <path d="M3 13.2 21 5l-5.7 14-3.7-5.1L6 16z" />
                    <path d="m11.6 13.9 4.6-4.5" />
                </svg>
            )
        case 'vuelos':
            return (
                <svg {...props}>
                    <path d="M4 17c4-7 8-10 16-11" />
                    <path d="m12 10 7-4-3 7-2-2-3 1z" />
                    <circle cx="4" cy="17" r="2" />
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

function ordenarSuscripciones(
    lista: Suscripcion[],
): Suscripcion[] {
    return [...lista].sort((a, b) => {
        const estadoA = a.estadoSuscripcion === 'ACTIVA' ? 0 : 1
        const estadoB = b.estadoSuscripcion === 'ACTIVA' ? 0 : 1

        if (estadoA !== estadoB) {
            return estadoA - estadoB
        }

        return (
            new Date(b.fechaInicioSuscripcion).getTime() -
            new Date(a.fechaInicioSuscripcion).getTime()
        )
    })
}

function ordenarPlanes(lista: Plan[]): Plan[] {
    return [...lista].sort((a, b) =>
        a.nombrePlan.localeCompare(b.nombrePlan, 'es'),
    )
}

function ordenarAerolineas(
    lista: Aerolinea[],
): Aerolinea[] {
    return [...lista].sort((a, b) =>
        a.nombreComercialAerolinea.localeCompare(
            b.nombreComercialAerolinea,
            'es',
        ),
    )
}

function etiquetaEstado(
    estado: EstadoSuscripcion,
): string {
    switch (estado) {
        case 'PENDIENTE':
            return 'Pendiente'
        case 'ACTIVA':
            return 'Activa'
        case 'VENCIDA':
            return 'Vencida'
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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(fecha)
}

function fechaIsoParaInput(fechaIso: string): string {
    const fecha = new Date(fechaIso)

    if (Number.isNaN(fecha.getTime())) {
        return ''
    }

    return fecha.toISOString().slice(0, 10)
}

function fechaInputParaIso(fechaInput: string): string {
    return new Date(`${fechaInput}T12:00:00.000Z`).toISOString()
}

function obtenerVigencia(
    suscripcion: Suscripcion,
): 'VIGENTE' | 'PROXIMA' | 'FINALIZADA' {
    const ahora = Date.now()
    const inicio = new Date(
        suscripcion.fechaInicioSuscripcion,
    ).getTime()
    const fin = new Date(
        suscripcion.fechaFinSuscripcion,
    ).getTime()

    if (ahora < inicio) {
        return 'PROXIMA'
    }

    if (ahora > fin) {
        return 'FINALIZADA'
    }

    return 'VIGENTE'
}

function etiquetaVigencia(
    vigencia: ReturnType<typeof obtenerVigencia>,
): string {
    switch (vigencia) {
        case 'VIGENTE':
            return 'Periodo vigente'
        case 'PROXIMA':
            return 'Inicio próximo'
        case 'FINALIZADA':
            return 'Periodo finalizado'
    }
}

function diasHasta(fechaIso: string): number {
    const fecha = new Date(fechaIso).getTime()
    const diferencia = fecha - Date.now()

    return Math.ceil(diferencia / 86_400_000)
}

async function cargarDatosModulo(
    token: string,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const [suscripciones, planes, aerolineas] =
        await Promise.all([
            solicitar<Suscripcion[]>(
                '/suscripciones',
                token,
                { signal },
            ),
            solicitar<Plan[]>('/planes', token, { signal }),
            solicitar<Aerolinea[]>(
                '/aerolineas',
                token,
                { signal },
            ),
        ])

    return {
        suscripciones: ordenarSuscripciones(
            Array.isArray(suscripciones)
                ? suscripciones
                : [],
        ),
        planes: ordenarPlanes(
            Array.isArray(planes) ? planes : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas)
                ? aerolineas
                : [],
        ),
    }
}

export function SuscripcionesModulo({
    token,
    rolUsuario,
    onSesionExpirada,
}: SuscripcionesModuloProps) {
    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const [suscripciones, setSuscripciones] = useState<
        Suscripcion[]
    >([])
    const [planes, setPlanes] = useState<Plan[]>([])
    const [aerolineas, setAerolineas] = useState<
        Aerolinea[]
    >([])
    const [cargando, setCargando] = useState(esSuperadmin)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('TODAS')
    const [filtroVigencia, setFiltroVigencia] =
        useState<FiltroVigencia>('TODAS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [filtroPlan, setFiltroPlan] = useState('TODOS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [suscripcionEdicion, setSuscripcionEdicion] =
        useState<Suscripcion | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioSuscripcion>(
            crearFormularioInicial,
        )
    const [errorFormulario, setErrorFormulario] =
        useState('')
    const [suscripcionEliminar, setSuscripcionEliminar] =
        useState<Suscripcion | null>(null)

    useEffect(() => {
        if (!esSuperadmin) {
            return
        }

        const controlador = new AbortController()
        let activo = true

        cargarDatosModulo(token, controlador.signal)
            .then((datos) => {
                if (!activo) {
                    return
                }

                setSuscripciones(datos.suscripciones)
                setPlanes(datos.planes)
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

                if (
                    error instanceof SesionExpiradaError
                ) {
                    onSesionExpirada()
                    return
                }

                if (activo) {
                    setMensajeError(
                        error instanceof Error
                            ? error.message
                            : 'No fue posible cargar las suscripciones.',
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
    }, [
        token,
        esSuperadmin,
        onSesionExpirada,
    ])

    useEffect(() => {
        if (!mensajeExito) {
            return
        }

        const temporizador = window.setTimeout(
            () => setMensajeExito(''),
            3500,
        )

        return () =>
            window.clearTimeout(temporizador)
    }, [mensajeExito])

    const planesFormulario = useMemo(() => {
        if (
            !suscripcionEdicion ||
            suscripcionEdicion.planSuscripcion
                .estadoPlan === 'ACTIVO'
        ) {
            return planes.filter(
                (plan) => plan.estadoPlan === 'ACTIVO',
            )
        }

        return ordenarPlanes([
            ...planes.filter(
                (plan) => plan.estadoPlan === 'ACTIVO',
            ),
            suscripcionEdicion.planSuscripcion,
        ])
    }, [planes, suscripcionEdicion])

    const aerolineasFormulario = useMemo(() => {
        if (
            !suscripcionEdicion ||
            suscripcionEdicion.aerolineaSuscripcion
                .estadoAerolinea === 'ACTIVA'
        ) {
            return aerolineas.filter(
                (aerolinea) =>
                    aerolinea.estadoAerolinea === 'ACTIVA',
            )
        }

        return ordenarAerolineas([
            ...aerolineas.filter(
                (aerolinea) =>
                    aerolinea.estadoAerolinea === 'ACTIVA',
            ),
            suscripcionEdicion.aerolineaSuscripcion,
        ])
    }, [aerolineas, suscripcionEdicion])

    const planSeleccionado = useMemo(
        () =>
            planes.find(
                (plan) =>
                    plan.idPlan ===
                    Number(formulario.fkPlanSuscripcion),
            ) ?? null,
        [planes, formulario.fkPlanSuscripcion],
    )

    const aerolineaSeleccionada = useMemo(
        () =>
            aerolineas.find(
                (aerolinea) =>
                    aerolinea.idAerolinea ===
                    Number(
                        formulario.fkAerolineaSuscripcion,
                    ),
            ) ?? null,
        [
            aerolineas,
            formulario.fkAerolineaSuscripcion,
        ],
    )

    const suscripcionesFiltradas = useMemo(() => {
        const texto = normalizarBusqueda(
            busqueda.trim(),
        )

        return suscripciones.filter((suscripcion) => {
            if (
                filtroEstado !== 'TODAS' &&
                suscripcion.estadoSuscripcion !==
                filtroEstado
            ) {
                return false
            }

            const vigencia =
                obtenerVigencia(suscripcion)

            if (
                filtroVigencia !== 'TODAS' &&
                vigencia !==
                (filtroVigencia === 'VIGENTES'
                    ? 'VIGENTE'
                    : filtroVigencia === 'PROXIMAS'
                        ? 'PROXIMA'
                        : 'FINALIZADA')
            ) {
                return false
            }

            if (
                filtroAerolinea !== 'TODAS' &&
                suscripcion.fkAerolineaSuscripcion !==
                Number(filtroAerolinea)
            ) {
                return false
            }

            if (
                filtroPlan !== 'TODOS' &&
                suscripcion.fkPlanSuscripcion !==
                Number(filtroPlan)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    String(suscripcion.idSuscripcion),
                    suscripcion.aerolineaSuscripcion
                        .nombreComercialAerolinea,
                    suscripcion.aerolineaSuscripcion
                        .correoAerolinea,
                    suscripcion.planSuscripcion.nombrePlan,
                    etiquetaEstado(
                        suscripcion.estadoSuscripcion,
                    ),
                    etiquetaVigencia(vigencia),
                ].join(' '),
            ).includes(texto)
        })
    }, [
        suscripciones,
        busqueda,
        filtroEstado,
        filtroVigencia,
        filtroAerolinea,
        filtroPlan,
    ])

    const resumen = useMemo(() => {
        const activas = suscripciones.filter(
            (suscripcion) =>
                suscripcion.estadoSuscripcion ===
                'ACTIVA',
        ).length
        const pendientes = suscripciones.filter(
            (suscripcion) =>
                suscripcion.estadoSuscripcion ===
                'PENDIENTE',
        ).length
        const vencidas = suscripciones.filter(
            (suscripcion) =>
                suscripcion.estadoSuscripcion ===
                'VENCIDA',
        ).length
        const canceladas = suscripciones.filter(
            (suscripcion) =>
                suscripcion.estadoSuscripcion ===
                'CANCELADA',
        ).length
        const finalizadasPorFecha =
            suscripciones.filter(
                (suscripcion) =>
                    obtenerVigencia(suscripcion) ===
                    'FINALIZADA',
            ).length

        return {
            total: suscripciones.length,
            activas,
            pendientes,
            vencidas,
            canceladas,
            finalizadasPorFecha,
        }
    }, [suscripciones])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos =
                await cargarDatosModulo(token)

            setSuscripciones(datos.suscripciones)
            setPlanes(datos.planes)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (
                error instanceof SesionExpiradaError
            ) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar las suscripciones.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        const formularioInicial =
            crearFormularioInicial()
        const primeraAerolinea =
            aerolineasFormulario[0]
        const primerPlan = planesFormulario[0]

        setSuscripcionEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaSuscripcion:
                aerolineasFormulario.length === 1 &&
                    primeraAerolinea
                    ? String(
                        primeraAerolinea.idAerolinea,
                    )
                    : '',
            fkPlanSuscripcion:
                planesFormulario.length === 1 &&
                    primerPlan
                    ? String(primerPlan.idPlan)
                    : '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(
        suscripcion: Suscripcion,
    ) {
        setSuscripcionEdicion(suscripcion)
        setFormulario({
            fkPlanSuscripcion: String(
                suscripcion.fkPlanSuscripcion,
            ),
            fkAerolineaSuscripcion: String(
                suscripcion.fkAerolineaSuscripcion,
            ),
            fechaInicioSuscripcion:
                fechaIsoParaInput(
                    suscripcion.fechaInicioSuscripcion,
                ),
            fechaFinSuscripcion:
                fechaIsoParaInput(
                    suscripcion.fechaFinSuscripcion,
                ),
            estadoSuscripcion:
                suscripcion.estadoSuscripcion,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setSuscripcionEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<
        K extends keyof FormularioSuscripcion,
    >(
        campo: K,
        valor: FormularioSuscripcion[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function validarFormulario(): string | null {
        if (!formulario.fkAerolineaSuscripcion) {
            return 'Selecciona la aerolínea de la suscripción.'
        }

        if (!formulario.fkPlanSuscripcion) {
            return 'Selecciona el plan contratado.'
        }

        if (
            !formulario.fechaInicioSuscripcion ||
            !formulario.fechaFinSuscripcion
        ) {
            return 'Selecciona las fechas de inicio y finalización.'
        }

        const inicio = new Date(
            `${formulario.fechaInicioSuscripcion}T12:00:00.000Z`,
        )
        const fin = new Date(
            `${formulario.fechaFinSuscripcion}T12:00:00.000Z`,
        )

        if (
            Number.isNaN(inicio.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            return 'Las fechas ingresadas no son válidas.'
        }

        if (fin <= inicio) {
            return 'La fecha de finalización debe ser posterior a la fecha de inicio.'
        }

        if (
            formulario.estadoSuscripcion ===
            'ACTIVA'
        ) {
            const idAerolinea = Number(
                formulario.fkAerolineaSuscripcion,
            )
            const otraActiva = suscripciones.some(
                (suscripcion) =>
                    suscripcion.idSuscripcion !==
                    suscripcionEdicion?.idSuscripcion &&
                    suscripcion.fkAerolineaSuscripcion ===
                    idAerolinea &&
                    suscripcion.estadoSuscripcion ===
                    'ACTIVA',
            )

            if (otraActiva) {
                return 'La aerolínea ya tiene otra suscripción activa.'
            }
        }

        return null
    }

    async function guardar(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault()

        const errorValidacion =
            validarFormulario()

        if (errorValidacion) {
            setErrorFormulario(errorValidacion)
            return
        }

        setGuardando(true)
        setErrorFormulario('')

        const idPlan = Number(
            formulario.fkPlanSuscripcion,
        )
        const idAerolinea = Number(
            formulario.fkAerolineaSuscripcion,
        )
        const fechaInicio = fechaInputParaIso(
            formulario.fechaInicioSuscripcion,
        )
        const fechaFin = fechaInputParaIso(
            formulario.fechaFinSuscripcion,
        )
        const esEdicion =
            suscripcionEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                fkPlanSuscripcion: idPlan,
                fkAerolineaSuscripcion: idAerolinea,
                fechaInicioSuscripcion: fechaInicio,
                fechaFinSuscripcion: fechaFin,
                estadoSuscripcion:
                    formulario.estadoSuscripcion,
            }
        } else {
            datos = {}

            if (
                idPlan !==
                suscripcionEdicion.fkPlanSuscripcion
            ) {
                datos.fkPlanSuscripcion = idPlan
            }

            if (
                idAerolinea !==
                suscripcionEdicion
                    .fkAerolineaSuscripcion
            ) {
                datos.fkAerolineaSuscripcion =
                    idAerolinea
            }

            if (
                formulario.fechaInicioSuscripcion !==
                fechaIsoParaInput(
                    suscripcionEdicion
                        .fechaInicioSuscripcion,
                )
            ) {
                datos.fechaInicioSuscripcion =
                    fechaInicio
            }

            if (
                formulario.fechaFinSuscripcion !==
                fechaIsoParaInput(
                    suscripcionEdicion
                        .fechaFinSuscripcion,
                )
            ) {
                datos.fechaFinSuscripcion = fechaFin
            }

            if (
                formulario.estadoSuscripcion !==
                suscripcionEdicion.estadoSuscripcion
            ) {
                datos.estadoSuscripcion =
                    formulario.estadoSuscripcion
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
            const suscripcionGuardada =
                await solicitar<Suscripcion>(
                    esEdicion
                        ? `/suscripciones/${suscripcionEdicion.idSuscripcion}`
                        : '/suscripciones',
                    token,
                    {
                        method: esEdicion
                            ? 'PATCH'
                            : 'POST',
                        body: JSON.stringify(datos),
                    },
                )

            setSuscripciones((lista) =>
                ordenarSuscripciones([
                    ...lista.filter(
                        (suscripcion) =>
                            suscripcion.idSuscripcion !==
                            suscripcionGuardada.idSuscripcion,
                    ),
                    suscripcionGuardada,
                ]),
            )
            setFormularioAbierto(false)
            setSuscripcionEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Suscripción actualizada correctamente.'
                    : 'Suscripción registrada correctamente.',
            )
        } catch (error: unknown) {
            if (
                error instanceof SesionExpiradaError
            ) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar la suscripción.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!suscripcionEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar<unknown>(
                `/suscripciones/${suscripcionEliminar.idSuscripcion}`,
                token,
                { method: 'DELETE' },
            )

            setSuscripciones((lista) =>
                lista.filter(
                    (suscripcion) =>
                        suscripcion.idSuscripcion !==
                        suscripcionEliminar.idSuscripcion,
                ),
            )
            setSuscripcionEliminar(null)
            setMensajeExito(
                'Suscripción eliminada correctamente.',
            )
        } catch (error: unknown) {
            if (
                error instanceof SesionExpiradaError
            ) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar la suscripción.',
            )
            setSuscripcionEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    if (!esSuperadmin) {
        return (
            <section className="suscripciones-modulo">
                <div className="suscripciones-acceso-denegado">
                    <Icono
                        nombre="alerta"
                        tamano={30}
                    />
                    <div>
                        <h2>Acceso restringido</h2>
                        <p>
                            La administración de
                            suscripciones está reservada
                            para usuarios SUPERADMIN.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    const puedeCrear =
        planesFormulario.length > 0 &&
        aerolineasFormulario.length > 0

    return (
        <section className="suscripciones-modulo">
            <header className="suscripciones-cabecera">
                <div className="suscripciones-cabecera__texto">
                    <span className="suscripciones-etiqueta">
                        Contratación SaaS
                    </span>
                    <h2>Gestión de Suscripciones</h2>
                    <p>
                        Relaciona cada aerolínea con un plan
                        y controla su periodo y estado.
                    </p>
                </div>

                <div className="suscripciones-cabecera__acciones">
                    <button
                        type="button"
                        className="suscripciones-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    <button
                        type="button"
                        className="suscripciones-boton-principal"
                        onClick={abrirCreacion}
                        disabled={!puedeCrear}
                        title={
                            puedeCrear
                                ? 'Registrar una suscripción'
                                : 'Se necesita un plan y una aerolínea activos'
                        }
                    >
                        <Icono nombre="agregar" />
                        Nueva suscripción
                    </button>
                </div>
            </header>

            <div className="suscripciones-aviso">
                <Icono
                    nombre="informacion"
                    tamano={21}
                />
                <div>
                    <strong>
                        Control administrativo global
                    </strong>
                    <span>
                        Solo puede existir una suscripción
                        con estado ACTIVA por aerolínea.
                        El precio mostrado corresponde al
                        valor actual del plan.
                    </span>
                </div>
            </div>

            {mensajeError && (
                <div
                    className="suscripciones-mensaje suscripciones-mensaje--error"
                    role="alert"
                >
                    <Icono nombre="alerta" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {mensajeExito && (
                <div
                    className="suscripciones-mensaje suscripciones-mensaje--exito"
                    role="status"
                >
                    <Icono nombre="estado" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            <div className="suscripciones-resumen">
                <article>
                    <span className="suscripciones-resumen__icono">
                        <Icono nombre="suscripcion" />
                    </span>
                    <div>
                        <small>Total</small>
                        <strong>{resumen.total}</strong>
                        <span>
                            Suscripciones registradas
                        </span>
                    </div>
                </article>

                <article>
                    <span className="suscripciones-resumen__icono">
                        <Icono nombre="estado" />
                    </span>
                    <div>
                        <small>Activas</small>
                        <strong>{resumen.activas}</strong>
                        <span>
                            {resumen.pendientes} pendientes
                        </span>
                    </div>
                </article>

                <article>
                    <span className="suscripciones-resumen__icono">
                        <Icono nombre="reloj" />
                    </span>
                    <div>
                        <small>Vencidas</small>
                        <strong>{resumen.vencidas}</strong>
                        <span>
                            {resumen.finalizadasPorFecha}{' '}
                            periodos finalizados
                        </span>
                    </div>
                </article>

                <article>
                    <span className="suscripciones-resumen__icono">
                        <Icono nombre="alerta" />
                    </span>
                    <div>
                        <small>Canceladas</small>
                        <strong>{resumen.canceladas}</strong>
                        <span>
                            Fuera de operación
                        </span>
                    </div>
                </article>
            </div>

            <div className="suscripciones-filtros">
                <label className="suscripciones-buscador">
                    <Icono nombre="buscar" />
                    <input
                        type="search"
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(
                                evento.target.value,
                            )
                        }
                        placeholder="Buscar por aerolínea, plan o estado"
                    />
                </label>

                <label className="suscripciones-filtro">
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
                            Todos
                        </option>
                        {estadosSuscripcion.map(
                            (estado) => (
                                <option
                                    key={estado}
                                    value={estado}
                                >
                                    {etiquetaEstado(
                                        estado,
                                    )}
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <label className="suscripciones-filtro">
                    <span>Periodo</span>
                    <select
                        value={filtroVigencia}
                        onChange={(evento) =>
                            setFiltroVigencia(
                                evento.target
                                    .value as FiltroVigencia,
                            )
                        }
                    >
                        <option value="TODAS">
                            Todos
                        </option>
                        <option value="VIGENTES">
                            Vigentes
                        </option>
                        <option value="PROXIMAS">
                            Próximos
                        </option>
                        <option value="FINALIZADAS">
                            Finalizados
                        </option>
                    </select>
                </label>

                <label className="suscripciones-filtro">
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

                <label className="suscripciones-filtro">
                    <span>Plan</span>
                    <select
                        value={filtroPlan}
                        onChange={(evento) =>
                            setFiltroPlan(
                                evento.target.value,
                            )
                        }
                    >
                        <option value="TODOS">
                            Todos
                        </option>
                        {planes.map((plan) => (
                            <option
                                key={plan.idPlan}
                                value={plan.idPlan}
                            >
                                {plan.nombrePlan}
                            </option>
                        ))}
                    </select>
                </label>

                <span className="suscripciones-resultados">
                    {suscripcionesFiltradas.length}{' '}
                    {suscripcionesFiltradas.length === 1
                        ? 'resultado'
                        : 'resultados'}
                </span>
            </div>

            {cargando ? (
                <div className="suscripciones-estado-central">
                    <span className="suscripciones-spinner" />
                    <strong>
                        Cargando suscripciones
                    </strong>
                    <p>
                        Consultando planes, aerolíneas y
                        periodos contratados.
                    </p>
                </div>
            ) : suscripcionesFiltradas.length === 0 ? (
                <div className="suscripciones-estado-central">
                    <Icono
                        nombre="suscripcion"
                        tamano={37}
                    />
                    <strong>
                        {suscripciones.length === 0
                            ? 'No existen suscripciones registradas'
                            : 'No hay coincidencias'}
                    </strong>
                    <p>
                        {suscripciones.length === 0
                            ? 'Registra la primera suscripción para habilitar un tenant.'
                            : 'Modifica la búsqueda o los filtros seleccionados.'}
                    </p>
                    {suscripciones.length === 0 &&
                        puedeCrear && (
                            <button
                                type="button"
                                className="suscripciones-boton-principal"
                                onClick={abrirCreacion}
                            >
                                <Icono nombre="agregar" />
                                Registrar la primera
                            </button>
                        )}
                </div>
            ) : (
                <div className="suscripciones-listado">
                    {suscripcionesFiltradas.map(
                        (suscripcion) => {
                            const vigencia =
                                obtenerVigencia(
                                    suscripcion,
                                )
                            const diasRestantes = diasHasta(
                                suscripcion.fechaFinSuscripcion,
                            )
                            const puedeEliminar =
                                suscripcion.estadoSuscripcion !==
                                'ACTIVA'

                            return (
                                <article
                                    key={
                                        suscripcion.idSuscripcion
                                    }
                                    className="suscripciones-tarjeta"
                                >
                                    <div className="suscripciones-tarjeta__encabezado">
                                        <div className="suscripciones-tarjeta__identidad">
                                            <span className="suscripciones-tarjeta__icono">
                                                <Icono
                                                    nombre="suscripcion"
                                                    tamano={
                                                        23
                                                    }
                                                />
                                            </span>
                                            <div>
                                                <span>
                                                    Suscripción
                                                    #
                                                    {
                                                        suscripcion.idSuscripcion
                                                    }
                                                </span>
                                                <h3>
                                                    {
                                                        suscripcion.aerolineaSuscripcion
                                                            .nombreComercialAerolinea
                                                    }
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="suscripciones-tarjeta__estados">
                                            <span
                                                className={`suscripciones-estado suscripciones-estado--${suscripcion.estadoSuscripcion.toLowerCase()}`}
                                            >
                                                {etiquetaEstado(
                                                    suscripcion.estadoSuscripcion,
                                                )}
                                            </span>
                                            <span
                                                className={`suscripciones-vigencia suscripciones-vigencia--${vigencia.toLowerCase()}`}
                                            >
                                                {etiquetaVigencia(
                                                    vigencia,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="suscripciones-plan">
                                        <div>
                                            <span>
                                                Plan
                                                contratado
                                            </span>
                                            <strong>
                                                {
                                                    suscripcion.planSuscripcion
                                                        .nombrePlan
                                                }
                                            </strong>
                                        </div>
                                        <strong>
                                            {formatearPrecio(
                                                suscripcion.planSuscripcion
                                                    .precioMensualPlan,
                                            )}
                                            <small>
                                                / mes
                                            </small>
                                        </strong>
                                    </div>

                                    <div className="suscripciones-datos">
                                        <div>
                                            <Icono
                                                nombre="calendario"
                                                tamano={
                                                    18
                                                }
                                            />
                                            <span>
                                                Inicio
                                            </span>
                                            <strong>
                                                {formatearFecha(
                                                    suscripcion.fechaInicioSuscripcion,
                                                )}
                                            </strong>
                                        </div>
                                        <div>
                                            <Icono
                                                nombre="calendario"
                                                tamano={
                                                    18
                                                }
                                            />
                                            <span>
                                                Fin
                                            </span>
                                            <strong>
                                                {formatearFecha(
                                                    suscripcion.fechaFinSuscripcion,
                                                )}
                                            </strong>
                                        </div>
                                        <div>
                                            <Icono
                                                nombre="reloj"
                                                tamano={
                                                    18
                                                }
                                            />
                                            <span>
                                                Plazo
                                            </span>
                                            <strong>
                                                {vigencia ===
                                                    'VIGENTE'
                                                    ? diasRestantes >=
                                                        0
                                                        ? `${diasRestantes} días restantes`
                                                        : 'Finalizado'
                                                    : vigencia ===
                                                        'PROXIMA'
                                                        ? 'Aún no inicia'
                                                        : 'Finalizado'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="suscripciones-tarjeta__pie">
                                        <div>
                                            <Icono
                                                nombre="aerolinea"
                                                tamano={
                                                    17
                                                }
                                            />
                                            <span>
                                                {
                                                    suscripcion.aerolineaSuscripcion
                                                        .correoAerolinea
                                                }
                                            </span>
                                        </div>

                                        <div className="suscripciones-acciones">
                                            <button
                                                type="button"
                                                className="suscripciones-boton-icono"
                                                onClick={() =>
                                                    abrirEdicion(
                                                        suscripcion,
                                                    )
                                                }
                                                aria-label={`Editar suscripción ${suscripcion.idSuscripcion}`}
                                                title="Editar"
                                            >
                                                <Icono nombre="editar" />
                                            </button>

                                            <button
                                                type="button"
                                                className="suscripciones-boton-icono suscripciones-boton-icono--eliminar"
                                                onClick={() =>
                                                    setSuscripcionEliminar(
                                                        suscripcion,
                                                    )
                                                }
                                                disabled={
                                                    !puedeEliminar
                                                }
                                                aria-label={`Eliminar suscripción ${suscripcion.idSuscripcion}`}
                                                title={
                                                    puedeEliminar
                                                        ? 'Eliminar'
                                                        : 'Primero cambia la suscripción activa a CANCELADA o VENCIDA'
                                                }
                                            >
                                                <Icono nombre="eliminar" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        },
                    )}
                </div>
            )}

            {formularioAbierto && (
                <div
                    className="suscripciones-modal-fondo"
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
                        className="suscripciones-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-formulario-suscripcion"
                    >
                        <header className="suscripciones-modal__encabezado">
                            <div className="suscripciones-modal__titulo">
                                <span className="suscripciones-modal__icono">
                                    <Icono
                                        nombre="suscripcion"
                                        tamano={24}
                                    />
                                </span>

                                <div>
                                    <span>
                                        {suscripcionEdicion
                                            ? `Suscripción #${suscripcionEdicion.idSuscripcion}`
                                            : 'Nueva contratación'}
                                    </span>
                                    <h3 id="titulo-formulario-suscripcion">
                                        {suscripcionEdicion
                                            ? 'Editar suscripción'
                                            : 'Registrar suscripción'}
                                    </h3>
                                    <p>
                                        Asigna una aerolínea, un plan y el periodo
                                        de vigencia de la contratación.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="suscripciones-modal__cerrar"
                                onClick={
                                    cerrarFormulario
                                }
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" />
                            </button>
                        </header>

                        <form
                            className="suscripciones-formulario"
                            onSubmit={guardar}
                        >
                            <div className="suscripciones-formulario__rejilla">
                                <label className="suscripciones-campo suscripciones-campo--completo">
                                    <span>Aerolínea</span>
                                    <select
                                        value={
                                            formulario.fkAerolineaSuscripcion
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            cambiarCampo(
                                                'fkAerolineaSuscripcion',
                                                evento
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando
                                        }
                                    >
                                        <option value="">
                                            Selecciona una
                                            aerolínea
                                        </option>
                                        {aerolineasFormulario.map(
                                            (
                                                aerolinea,
                                            ) => (
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
                                                    —{' '}
                                                    {
                                                        aerolinea.estadoAerolinea
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="suscripciones-campo suscripciones-campo--completo">
                                    <span>Plan</span>
                                    <select
                                        value={
                                            formulario.fkPlanSuscripcion
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            cambiarCampo(
                                                'fkPlanSuscripcion',
                                                evento
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando
                                        }
                                    >
                                        <option value="">
                                            Selecciona un
                                            plan
                                        </option>
                                        {planesFormulario.map(
                                            (plan) => (
                                                <option
                                                    key={
                                                        plan.idPlan
                                                    }
                                                    value={
                                                        plan.idPlan
                                                    }
                                                >
                                                    {
                                                        plan.nombrePlan
                                                    }{' '}
                                                    —{' '}
                                                    {formatearPrecio(
                                                        plan.precioMensualPlan,
                                                    )}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="suscripciones-campo">
                                    <span>
                                        Fecha de inicio
                                    </span>
                                    <input
                                        type="date"
                                        value={
                                            formulario.fechaInicioSuscripcion
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            cambiarCampo(
                                                'fechaInicioSuscripcion',
                                                evento
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />
                                </label>

                                <label className="suscripciones-campo">
                                    <span>
                                        Fecha de finalización
                                    </span>
                                    <input
                                        type="date"
                                        value={
                                            formulario.fechaFinSuscripcion
                                        }
                                        min={
                                            formulario.fechaInicioSuscripcion
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            cambiarCampo(
                                                'fechaFinSuscripcion',
                                                evento
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />
                                </label>

                                <label className="suscripciones-campo suscripciones-campo--completo">
                                    <span>Estado</span>
                                    <select
                                        value={
                                            formulario.estadoSuscripcion
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            cambiarCampo(
                                                'estadoSuscripcion',
                                                evento
                                                    .target
                                                    .value as EstadoSuscripcion,
                                            )
                                        }
                                        disabled={
                                            guardando
                                        }
                                    >
                                        {estadosSuscripcion.map(
                                            (estado) => (
                                                <option
                                                    key={
                                                        estado
                                                    }
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
                                </label>
                            </div>

                            {(planSeleccionado ||
                                aerolineaSeleccionada) && (
                                    <div className="suscripciones-seleccion-resumen">
                                        {aerolineaSeleccionada && (
                                            <div>
                                                <Icono nombre="aerolinea" />
                                                <span>
                                                    Aerolínea
                                                </span>
                                                <strong>
                                                    {
                                                        aerolineaSeleccionada.nombreComercialAerolinea
                                                    }
                                                </strong>
                                                <small>
                                                    {
                                                        aerolineaSeleccionada.estadoAerolinea
                                                    }
                                                </small>
                                            </div>
                                        )}

                                        {planSeleccionado && (
                                            <div>
                                                <Icono nombre="plan" />
                                                <span>
                                                    Plan
                                                </span>
                                                <strong>
                                                    {
                                                        planSeleccionado.nombrePlan
                                                    }
                                                </strong>
                                                <small>
                                                    {formatearPrecio(
                                                        planSeleccionado.precioMensualPlan,
                                                    )}{' '}
                                                    al mes
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {planSeleccionado &&
                                (planSeleccionado.limiteUsuariosPlan !==
                                    undefined ||
                                    planSeleccionado.limiteAvionesPlan !==
                                    undefined ||
                                    planSeleccionado.limiteVuelosMensualesPlan !==
                                    undefined) && (
                                    <div className="suscripciones-limites">
                                        <div>
                                            <Icono nombre="usuarios" />
                                            <span>
                                                Usuarios
                                            </span>
                                            <strong>
                                                {planSeleccionado.limiteUsuariosPlan ??
                                                    '—'}
                                            </strong>
                                        </div>
                                        <div>
                                            <Icono nombre="aviones" />
                                            <span>
                                                Aviones
                                            </span>
                                            <strong>
                                                {planSeleccionado.limiteAvionesPlan ??
                                                    '—'}
                                            </strong>
                                        </div>
                                        <div>
                                            <Icono nombre="vuelos" />
                                            <span>
                                                Vuelos/mes
                                            </span>
                                            <strong>
                                                {planSeleccionado.limiteVuelosMensualesPlan ??
                                                    '—'}
                                            </strong>
                                        </div>
                                    </div>
                                )}

                            {errorFormulario && (
                                <div
                                    className="suscripciones-error-formulario"
                                    role="alert"
                                >
                                    <Icono nombre="alerta" />
                                    <span>
                                        {
                                            errorFormulario
                                        }
                                    </span>
                                </div>
                            )}

                            <footer className="suscripciones-modal__acciones">
                                <button
                                    type="button"
                                    className="suscripciones-boton-secundario"
                                    onClick={
                                        cerrarFormulario
                                    }
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="suscripciones-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="suscripciones-spinner suscripciones-spinner--pequeno" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono nombre="estado" />
                                            {suscripcionEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar suscripción'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {suscripcionEliminar && (
                <div className="suscripciones-modal-fondo">
                    <section
                        className="suscripciones-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-eliminar-suscripcion"
                    >
                        <span className="suscripciones-confirmacion__icono">
                            <Icono
                                nombre="alerta"
                                tamano={27}
                            />
                        </span>

                        <h3 id="titulo-eliminar-suscripcion">
                            Eliminar suscripción
                        </h3>

                        <p>
                            Se eliminará la suscripción #
                            {
                                suscripcionEliminar.idSuscripcion
                            }{' '}
                            de{' '}
                            <strong>
                                {
                                    suscripcionEliminar.aerolineaSuscripcion
                                        .nombreComercialAerolinea
                                }
                            </strong>
                            . Esta acción no se puede
                            deshacer.
                        </p>

                        <div className="suscripciones-confirmacion__acciones">
                            <button
                                type="button"
                                className="suscripciones-boton-secundario"
                                onClick={() =>
                                    setSuscripcionEliminar(
                                        null,
                                    )
                                }
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="suscripciones-boton-peligro"
                                onClick={() =>
                                    void eliminar()
                                }
                                disabled={eliminando}
                            >
                                {eliminando
                                    ? 'Eliminando'
                                    : 'Eliminar'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

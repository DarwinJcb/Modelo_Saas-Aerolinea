/* saas-frontend/src/modules/aerolineas/AerolineasModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './AerolineasModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoAerolinea = 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA'
type FiltroEstado = 'TODAS' | EstadoAerolinea

type IconoNombre =
    | 'aerolinea'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'estado'
    | 'correo'
    | 'telefono'
    | 'ubicacion'
    | 'codigo'
    | 'moneda'
    | 'reloj'
    | 'enlace'
    | 'edificio'

interface Aerolinea {
    idAerolinea: number
    rucAerolinea: string | null
    codigoIataAerolinea: string | null
    codigoIcaoAerolinea: string | null
    nombreComercialAerolinea: string
    razonSocialAerolinea: string | null
    correoAerolinea: string
    telefonoAerolinea: string | null
    paisAerolinea: string | null
    codigoPaisAerolinea: string | null
    monedaAerolinea: string | null
    zonaHorariaAerolinea: string | null
    logotipoUrlAerolinea: string | null
    estadoAerolinea: EstadoAerolinea
}

interface FormularioAerolinea {
    rucAerolinea: string
    codigoIataAerolinea: string
    codigoIcaoAerolinea: string
    nombreComercialAerolinea: string
    razonSocialAerolinea: string
    correoAerolinea: string
    telefonoAerolinea: string
    paisAerolinea: string
    codigoPaisAerolinea: string
    monedaAerolinea: string
    zonaHorariaAerolinea: string
    logotipoUrlAerolinea: string
    estadoAerolinea: EstadoAerolinea
}

interface AerolineasModuloProps {
    token: string
    rolUsuario: string
    onSesionExpirada: () => void
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioAerolinea = {
    rucAerolinea: '',
    codigoIataAerolinea: '',
    codigoIcaoAerolinea: '',
    nombreComercialAerolinea: '',
    razonSocialAerolinea: '',
    correoAerolinea: '',
    telefonoAerolinea: '',
    paisAerolinea: 'Ecuador',
    codigoPaisAerolinea: 'EC',
    monedaAerolinea: 'USD',
    zonaHorariaAerolinea: 'America/Guayaquil',
    logotipoUrlAerolinea: '',
    estadoAerolinea: 'ACTIVA',
}

const estadosAerolinea: EstadoAerolinea[] = [
    'ACTIVA',
    'SUSPENDIDA',
    'INACTIVA',
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
        case 'aerolinea':
            return (
                <svg {...props}>
                    <path d="M4 20V9l8-5 8 5v11" />
                    <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
                    <path d="M2 20h20" />
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
        case 'correo':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m4 7 8 6 8-6" />
                </svg>
            )
        case 'telefono':
            return (
                <svg {...props}>
                    <path d="M7 3h3l1.4 4.1-2 1.5a15.5 15.5 0 0 0 6 6l1.5-2L21 14v3c0 2.2-1.8 4-4 4A14 14 0 0 1 3 7c0-2.2 1.8-4 4-4" />
                </svg>
            )
        case 'ubicacion':
            return (
                <svg {...props}>
                    <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12" />
                    <circle cx="12" cy="9" r="2.5" />
                </svg>
            )
        case 'codigo':
            return (
                <svg {...props}>
                    <rect x="3" y="6" width="18" height="12" rx="2.5" />
                    <path d="M7 10h10M7 14h6" />
                </svg>
            )
        case 'moneda':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M16 8.5c-.8-1-2-1.5-3.5-1.5-2 0-3.5 1-3.5 2.5 0 3.5 7 1.5 7 5 0 1.5-1.5 2.5-3.5 2.5-1.5 0-2.9-.6-3.8-1.7M12 5v14" />
                </svg>
            )
        case 'reloj':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'enlace':
            return (
                <svg {...props}>
                    <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
                </svg>
            )
        case 'edificio':
            return (
                <svg {...props}>
                    <path d="M5 21V4h10v17M15 9h4v12M2 21h20" />
                    <path d="M8 8h4M8 12h4M8 16h4" />
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

function ordenarAerolineas(lista: Aerolinea[]): Aerolinea[] {
    return [...lista].sort((a, b) =>
        a.nombreComercialAerolinea.localeCompare(
            b.nombreComercialAerolinea,
            'es',
        ),
    )
}

function etiquetaEstado(estado: EstadoAerolinea): string {
    switch (estado) {
        case 'ACTIVA':
            return 'Activa'
        case 'SUSPENDIDA':
            return 'Suspendida'
        case 'INACTIVA':
            return 'Inactiva'
    }
}

function obtenerCodigoPrincipal(aerolinea: Aerolinea): string {
    return (
        aerolinea.codigoIataAerolinea ??
        aerolinea.codigoIcaoAerolinea ??
        `#${aerolinea.idAerolinea}`
    )
}

function obtenerIniciales(aerolinea: Aerolinea): string {
    const palabras = aerolinea.nombreComercialAerolinea
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    const primera = palabras[0]?.charAt(0) ?? 'A'
    const segunda = palabras[1]?.charAt(0) ?? primera

    return `${primera}${segunda}`.toUpperCase()
}

function valorFormulario(valor: string | null): string {
    return valor ?? ''
}

function esUrlValida(url: string): boolean {
    try {
        const resultado = new URL(url)
        return resultado.protocol === 'http:' || resultado.protocol === 'https:'
    } catch {
        return false
    }
}

export function AerolineasModulo({
    token,
    rolUsuario,
    onSesionExpirada,
}: AerolineasModuloProps) {
    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const [aerolineas, setAerolineas] = useState<Aerolinea[]>([])
    const [cargando, setCargando] = useState(esSuperadmin)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('TODAS')
    const [filtroPais, setFiltroPais] = useState('TODOS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [aerolineaEdicion, setAerolineaEdicion] =
        useState<Aerolinea | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioAerolinea>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [aerolineaEliminar, setAerolineaEliminar] =
        useState<Aerolinea | null>(null)

    useEffect(() => {
        if (!esSuperadmin) {
            return
        }

        const controlador = new AbortController()
        let activo = true

        solicitar<Aerolinea[]>('/aerolineas', token, {
            signal: controlador.signal,
        })
            .then((respuesta) => {
                if (!activo) {
                    return
                }

                setAerolineas(
                    ordenarAerolineas(
                        Array.isArray(respuesta) ? respuesta : [],
                    ),
                )
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
                            : 'No fue posible cargar las aerolíneas.',
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

    const paisesDisponibles = useMemo(() => {
        const paises = new Set(
            aerolineas
                .map((aerolinea) => aerolinea.paisAerolinea?.trim())
                .filter((pais): pais is string => Boolean(pais)),
        )

        return [...paises].sort((a, b) => a.localeCompare(b, 'es'))
    }, [aerolineas])

    const aerolineasFiltradas = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return aerolineas.filter((aerolinea) => {
            if (
                filtroEstado !== 'TODAS' &&
                aerolinea.estadoAerolinea !== filtroEstado
            ) {
                return false
            }

            if (
                filtroPais !== 'TODOS' &&
                aerolinea.paisAerolinea !== filtroPais
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    aerolinea.nombreComercialAerolinea,
                    aerolinea.razonSocialAerolinea ?? '',
                    aerolinea.rucAerolinea ?? '',
                    aerolinea.codigoIataAerolinea ?? '',
                    aerolinea.codigoIcaoAerolinea ?? '',
                    aerolinea.correoAerolinea,
                    aerolinea.telefonoAerolinea ?? '',
                    aerolinea.paisAerolinea ?? '',
                    aerolinea.codigoPaisAerolinea ?? '',
                    aerolinea.monedaAerolinea ?? '',
                    aerolinea.zonaHorariaAerolinea ?? '',
                    etiquetaEstado(aerolinea.estadoAerolinea),
                    String(aerolinea.idAerolinea),
                ].join(' '),
            ).includes(texto)
        })
    }, [
        aerolineas,
        busqueda,
        filtroEstado,
        filtroPais,
    ])

    const resumen = useMemo(() => {
        const activas = aerolineas.filter(
            (aerolinea) => aerolinea.estadoAerolinea === 'ACTIVA',
        ).length
        const suspendidas = aerolineas.filter(
            (aerolinea) =>
                aerolinea.estadoAerolinea === 'SUSPENDIDA',
        ).length
        const inactivas = aerolineas.filter(
            (aerolinea) =>
                aerolinea.estadoAerolinea === 'INACTIVA',
        ).length

        return {
            total: aerolineas.length,
            activas,
            suspendidas,
            inactivas,
            paises: paisesDisponibles.length,
        }
    }, [aerolineas, paisesDisponibles])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const respuesta = await solicitar<Aerolinea[]>(
                '/aerolineas',
                token,
            )

            setAerolineas(
                ordenarAerolineas(
                    Array.isArray(respuesta) ? respuesta : [],
                ),
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar las aerolíneas.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        setAerolineaEdicion(null)
        setFormulario(formularioInicial)
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(aerolinea: Aerolinea) {
        setAerolineaEdicion(aerolinea)
        setFormulario({
            rucAerolinea: valorFormulario(aerolinea.rucAerolinea),
            codigoIataAerolinea: valorFormulario(
                aerolinea.codigoIataAerolinea,
            ),
            codigoIcaoAerolinea: valorFormulario(
                aerolinea.codigoIcaoAerolinea,
            ),
            nombreComercialAerolinea:
                aerolinea.nombreComercialAerolinea,
            razonSocialAerolinea: valorFormulario(
                aerolinea.razonSocialAerolinea,
            ),
            correoAerolinea: aerolinea.correoAerolinea,
            telefonoAerolinea: valorFormulario(
                aerolinea.telefonoAerolinea,
            ),
            paisAerolinea: valorFormulario(aerolinea.paisAerolinea),
            codigoPaisAerolinea: valorFormulario(
                aerolinea.codigoPaisAerolinea,
            ),
            monedaAerolinea: valorFormulario(
                aerolinea.monedaAerolinea,
            ),
            zonaHorariaAerolinea: valorFormulario(
                aerolinea.zonaHorariaAerolinea,
            ),
            logotipoUrlAerolinea: valorFormulario(
                aerolinea.logotipoUrlAerolinea,
            ),
            estadoAerolinea: aerolinea.estadoAerolinea,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setAerolineaEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioAerolinea>(
        campo: K,
        valor: FormularioAerolinea[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function validarFormulario(): string | null {
        const nombre = formulario.nombreComercialAerolinea.trim()

        if (nombre.length < 2 || nombre.length > 100) {
            return 'El nombre comercial debe contener entre 2 y 100 caracteres.'
        }

        const razonSocial = formulario.razonSocialAerolinea.trim()

        if (razonSocial.length > 150) {
            return 'La razón social no puede superar los 150 caracteres.'
        }

        const ruc = formulario.rucAerolinea.trim()

        if (ruc && !/^\d{13}$/.test(ruc)) {
            return 'El RUC debe contener exactamente 13 dígitos.'
        }

        const iata = formulario.codigoIataAerolinea
            .trim()
            .toUpperCase()

        if (iata && !/^[A-Z0-9]{2}$/.test(iata)) {
            return 'El código IATA debe contener exactamente 2 letras o números.'
        }

        const icao = formulario.codigoIcaoAerolinea
            .trim()
            .toUpperCase()

        if (icao && !/^[A-Z]{3}$/.test(icao)) {
            return 'El código ICAO debe contener exactamente 3 letras.'
        }

        const correo = formulario.correoAerolinea
            .trim()
            .toLowerCase()

        if (
            correo.length > 150 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
        ) {
            return 'Ingresa un correo electrónico válido de máximo 150 caracteres.'
        }

        const telefono = formulario.telefonoAerolinea.trim()

        if (
            telefono &&
            !/^\+?[0-9\s()-]{7,20}$/.test(telefono)
        ) {
            return 'El teléfono no tiene un formato válido.'
        }

        const pais = formulario.paisAerolinea.trim()

        if (pais && (pais.length < 2 || pais.length > 80)) {
            return 'El país debe contener entre 2 y 80 caracteres.'
        }

        const codigoPais = formulario.codigoPaisAerolinea
            .trim()
            .toUpperCase()

        if (codigoPais && !/^[A-Z]{2}$/.test(codigoPais)) {
            return 'El código del país debe contener exactamente 2 letras.'
        }

        const moneda = formulario.monedaAerolinea
            .trim()
            .toUpperCase()

        if (moneda && !/^[A-Z]{3}$/.test(moneda)) {
            return 'La moneda debe representarse mediante un código de 3 letras.'
        }

        const zonaHoraria = formulario.zonaHorariaAerolinea.trim()

        if (
            zonaHoraria &&
            (zonaHoraria.length < 3 || zonaHoraria.length > 100)
        ) {
            return 'La zona horaria debe contener entre 3 y 100 caracteres.'
        }

        const logotipo = formulario.logotipoUrlAerolinea.trim()

        if (logotipo && !esUrlValida(logotipo)) {
            return 'La URL del logotipo debe comenzar con http:// o https://.'
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

        const valores = {
            rucAerolinea: formulario.rucAerolinea.trim(),
            codigoIataAerolinea:
                formulario.codigoIataAerolinea.trim().toUpperCase(),
            codigoIcaoAerolinea:
                formulario.codigoIcaoAerolinea.trim().toUpperCase(),
            nombreComercialAerolinea:
                formulario.nombreComercialAerolinea.trim(),
            razonSocialAerolinea:
                formulario.razonSocialAerolinea.trim(),
            correoAerolinea:
                formulario.correoAerolinea.trim().toLowerCase(),
            telefonoAerolinea: formulario.telefonoAerolinea.trim(),
            paisAerolinea: formulario.paisAerolinea.trim(),
            codigoPaisAerolinea:
                formulario.codigoPaisAerolinea.trim().toUpperCase(),
            monedaAerolinea:
                formulario.monedaAerolinea.trim().toUpperCase(),
            zonaHorariaAerolinea:
                formulario.zonaHorariaAerolinea.trim(),
            logotipoUrlAerolinea:
                formulario.logotipoUrlAerolinea.trim(),
            estadoAerolinea: formulario.estadoAerolinea,
        }

        const esEdicion = aerolineaEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                nombreComercialAerolinea:
                    valores.nombreComercialAerolinea,
                correoAerolinea: valores.correoAerolinea,
                estadoAerolinea: valores.estadoAerolinea,
                ...(valores.rucAerolinea
                    ? { rucAerolinea: valores.rucAerolinea }
                    : {}),
                ...(valores.codigoIataAerolinea
                    ? {
                        codigoIataAerolinea:
                            valores.codigoIataAerolinea,
                    }
                    : {}),
                ...(valores.codigoIcaoAerolinea
                    ? {
                        codigoIcaoAerolinea:
                            valores.codigoIcaoAerolinea,
                    }
                    : {}),
                ...(valores.razonSocialAerolinea
                    ? {
                        razonSocialAerolinea:
                            valores.razonSocialAerolinea,
                    }
                    : {}),
                ...(valores.telefonoAerolinea
                    ? { telefonoAerolinea: valores.telefonoAerolinea }
                    : {}),
                ...(valores.paisAerolinea
                    ? { paisAerolinea: valores.paisAerolinea }
                    : {}),
                ...(valores.codigoPaisAerolinea
                    ? {
                        codigoPaisAerolinea:
                            valores.codigoPaisAerolinea,
                    }
                    : {}),
                ...(valores.monedaAerolinea
                    ? { monedaAerolinea: valores.monedaAerolinea }
                    : {}),
                ...(valores.zonaHorariaAerolinea
                    ? {
                        zonaHorariaAerolinea:
                            valores.zonaHorariaAerolinea,
                    }
                    : {}),
                ...(valores.logotipoUrlAerolinea
                    ? {
                        logotipoUrlAerolinea:
                            valores.logotipoUrlAerolinea,
                    }
                    : {}),
            }
        } else {
            datos = {}

            const compararOpcional = (
                campo: keyof typeof valores,
                actual: string | null,
            ) => {
                const nuevo = valores[campo]

                if (
                    typeof nuevo === 'string' &&
                    nuevo !== (actual ?? '')
                ) {
                    datos[campo] = nuevo || null
                }
            }

            compararOpcional(
                'rucAerolinea',
                aerolineaEdicion.rucAerolinea,
            )
            compararOpcional(
                'codigoIataAerolinea',
                aerolineaEdicion.codigoIataAerolinea,
            )
            compararOpcional(
                'codigoIcaoAerolinea',
                aerolineaEdicion.codigoIcaoAerolinea,
            )
            compararOpcional(
                'razonSocialAerolinea',
                aerolineaEdicion.razonSocialAerolinea,
            )
            compararOpcional(
                'telefonoAerolinea',
                aerolineaEdicion.telefonoAerolinea,
            )
            compararOpcional(
                'paisAerolinea',
                aerolineaEdicion.paisAerolinea,
            )
            compararOpcional(
                'codigoPaisAerolinea',
                aerolineaEdicion.codigoPaisAerolinea,
            )
            compararOpcional(
                'monedaAerolinea',
                aerolineaEdicion.monedaAerolinea,
            )
            compararOpcional(
                'zonaHorariaAerolinea',
                aerolineaEdicion.zonaHorariaAerolinea,
            )
            compararOpcional(
                'logotipoUrlAerolinea',
                aerolineaEdicion.logotipoUrlAerolinea,
            )

            if (
                valores.nombreComercialAerolinea !==
                aerolineaEdicion.nombreComercialAerolinea
            ) {
                datos.nombreComercialAerolinea =
                    valores.nombreComercialAerolinea
            }

            if (
                valores.correoAerolinea !==
                aerolineaEdicion.correoAerolinea
            ) {
                datos.correoAerolinea = valores.correoAerolinea
            }

            if (
                valores.estadoAerolinea !==
                aerolineaEdicion.estadoAerolinea
            ) {
                datos.estadoAerolinea = valores.estadoAerolinea
            }

            if (Object.keys(datos).length === 0) {
                setGuardando(false)
                setErrorFormulario('No existen cambios para guardar.')
                return
            }
        }

        try {
            const aerolineaGuardada = await solicitar<Aerolinea>(
                esEdicion
                    ? `/aerolineas/${aerolineaEdicion.idAerolinea}`
                    : '/aerolineas',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setAerolineas((lista) =>
                ordenarAerolineas([
                    ...lista.filter(
                        (aerolinea) =>
                            aerolinea.idAerolinea !==
                            aerolineaGuardada.idAerolinea,
                    ),
                    aerolineaGuardada,
                ]),
            )
            setFormularioAbierto(false)
            setAerolineaEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Aerolínea actualizada correctamente.'
                    : 'Aerolínea registrada correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar la aerolínea.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!aerolineaEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar<unknown>(
                `/aerolineas/${aerolineaEliminar.idAerolinea}`,
                token,
                { method: 'DELETE' },
            )

            setAerolineas((lista) =>
                lista.filter(
                    (aerolinea) =>
                        aerolinea.idAerolinea !==
                        aerolineaEliminar.idAerolinea,
                ),
            )
            setAerolineaEliminar(null)
            setMensajeExito('Aerolínea eliminada correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar la aerolínea.',
            )
            setAerolineaEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    if (!esSuperadmin) {
        return (
            <section className="aerolineas-modulo">
                <div className="aerolineas-acceso-denegado">
                    <Icono nombre="alerta" tamano={30} />
                    <div>
                        <h2>Acceso restringido</h2>
                        <p>
                            La administración de aerolíneas está reservada
                            para usuarios SUPERADMIN.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="aerolineas-modulo">
            <header className="aerolineas-cabecera">
                <div className="aerolineas-cabecera__texto">
                    <span className="aerolineas-etiqueta">
                        Tenants de la plataforma
                    </span>
                    <h2>Gestión de Aerolíneas</h2>
                    <p>
                        Administra la identidad, localización y estado
                        operativo de cada organización registrada en el SaaS.
                    </p>
                </div>

                <div className="aerolineas-cabecera__acciones">
                    <button
                        type="button"
                        className="aerolineas-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    <button
                        type="button"
                        className="aerolineas-boton-principal"
                        onClick={abrirCreacion}
                    >
                        <Icono nombre="agregar" />
                        Nueva aerolínea
                    </button>
                </div>
            </header>

            <div className="aerolineas-aviso">
                <Icono nombre="informacion" tamano={21} />
                <div>
                    <strong>Administración global de tenants</strong>
                    <span>
                        Los códigos, el RUC y el correo deben ser únicos.
                        Una aerolínea con información asociada se desactiva
                        en lugar de eliminarse.
                    </span>
                </div>
            </div>

            {mensajeError && (
                <div
                    className="aerolineas-mensaje aerolineas-mensaje--error"
                    role="alert"
                >
                    <Icono nombre="alerta" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {mensajeExito && (
                <div
                    className="aerolineas-mensaje aerolineas-mensaje--exito"
                    role="status"
                >
                    <Icono nombre="estado" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            <div className="aerolineas-resumen">
                <article>
                    <span className="aerolineas-resumen__icono">
                        <Icono nombre="aerolinea" />
                    </span>
                    <div>
                        <small>Total de tenants</small>
                        <strong>{resumen.total}</strong>
                        <span>{resumen.activas} operativos</span>
                    </div>
                </article>

                <article>
                    <span className="aerolineas-resumen__icono">
                        <Icono nombre="estado" />
                    </span>
                    <div>
                        <small>Aerolíneas activas</small>
                        <strong>{resumen.activas}</strong>
                        <span>Operación habilitada</span>
                    </div>
                </article>

                <article>
                    <span className="aerolineas-resumen__icono">
                        <Icono nombre="alerta" />
                    </span>
                    <div>
                        <small>Suspendidas</small>
                        <strong>{resumen.suspendidas}</strong>
                        <span>Acceso restringido</span>
                    </div>
                </article>

                <article>
                    <span className="aerolineas-resumen__icono">
                        <Icono nombre="edificio" />
                    </span>
                    <div>
                        <small>Inactivas</small>
                        <strong>{resumen.inactivas}</strong>
                        <span>Fuera de operación</span>
                    </div>
                </article>

                <article>
                    <span className="aerolineas-resumen__icono">
                        <Icono nombre="ubicacion" />
                    </span>
                    <div>
                        <small>Países registrados</small>
                        <strong>{resumen.paises}</strong>
                        <span>Alcance del catálogo</span>
                    </div>
                </article>
            </div>

            <div className="aerolineas-filtros">
                <label className="aerolineas-buscador">
                    <Icono nombre="buscar" />
                    <input
                        type="search"
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(evento.target.value)
                        }
                        placeholder="Buscar por nombre, RUC, código o correo"
                    />
                </label>

                <label className="aerolineas-filtro">
                    <span>Estado</span>
                    <select
                        value={filtroEstado}
                        onChange={(evento) =>
                            setFiltroEstado(
                                evento.target.value as FiltroEstado,
                            )
                        }
                    >
                        <option value="TODAS">Todos</option>
                        <option value="ACTIVA">Activas</option>
                        <option value="SUSPENDIDA">Suspendidas</option>
                        <option value="INACTIVA">Inactivas</option>
                    </select>
                </label>

                <label className="aerolineas-filtro">
                    <span>País</span>
                    <select
                        value={filtroPais}
                        onChange={(evento) =>
                            setFiltroPais(evento.target.value)
                        }
                    >
                        <option value="TODOS">Todos</option>
                        {paisesDisponibles.map((pais) => (
                            <option key={pais} value={pais}>
                                {pais}
                            </option>
                        ))}
                    </select>
                </label>

                <span className="aerolineas-resultados">
                    {aerolineasFiltradas.length}{' '}
                    {aerolineasFiltradas.length === 1
                        ? 'resultado'
                        : 'resultados'}
                </span>
            </div>

            {cargando ? (
                <div className="aerolineas-estado-central">
                    <span className="aerolineas-spinner" />
                    <strong>Cargando aerolíneas</strong>
                    <p>Consultando el catálogo global de tenants.</p>
                </div>
            ) : aerolineasFiltradas.length === 0 ? (
                <div className="aerolineas-estado-central">
                    <Icono nombre="aerolinea" tamano={36} />
                    <strong>
                        {aerolineas.length === 0
                            ? 'No existen aerolíneas registradas'
                            : 'No hay coincidencias'}
                    </strong>
                    <p>
                        {aerolineas.length === 0
                            ? 'Registra el primer tenant de la plataforma.'
                            : 'Modifica la búsqueda o los filtros seleccionados.'}
                    </p>
                    {aerolineas.length === 0 && (
                        <button
                            type="button"
                            className="aerolineas-boton-principal"
                            onClick={abrirCreacion}
                        >
                            <Icono nombre="agregar" />
                            Registrar la primera
                        </button>
                    )}
                </div>
            ) : (
                <div className="aerolineas-listado">
                    {aerolineasFiltradas.map((aerolinea) => (
                        <article
                            key={aerolinea.idAerolinea}
                            className="aerolineas-tarjeta"
                        >
                            <div className="aerolineas-tarjeta__encabezado">
                                <div className="aerolineas-identidad">
                                    <span className="aerolineas-identidad__logo">
                                        {aerolinea.logotipoUrlAerolinea ? (
                                            <img
                                                src={aerolinea.logotipoUrlAerolinea}
                                                alt=""
                                            />
                                        ) : (
                                            obtenerIniciales(aerolinea)
                                        )}
                                    </span>
                                    <div>
                                        <span>
                                            Tenant #{aerolinea.idAerolinea} ·{' '}
                                            {obtenerCodigoPrincipal(aerolinea)}
                                        </span>
                                        <h3>
                                            {aerolinea.nombreComercialAerolinea}
                                        </h3>
                                        <small>
                                            {aerolinea.razonSocialAerolinea ||
                                                'Razón social no registrada'}
                                        </small>
                                    </div>
                                </div>

                                <span
                                    className={`aerolineas-estado aerolineas-estado--${aerolinea.estadoAerolinea.toLowerCase()}`}
                                >
                                    {etiquetaEstado(aerolinea.estadoAerolinea)}
                                </span>
                            </div>

                            <div className="aerolineas-codigos">
                                <div>
                                    <span>IATA</span>
                                    <strong>
                                        {aerolinea.codigoIataAerolinea || '—'}
                                    </strong>
                                </div>
                                <div>
                                    <span>ICAO</span>
                                    <strong>
                                        {aerolinea.codigoIcaoAerolinea || '—'}
                                    </strong>
                                </div>
                                <div>
                                    <span>RUC</span>
                                    <strong>{aerolinea.rucAerolinea || '—'}</strong>
                                </div>
                            </div>

                            <div className="aerolineas-detalles">
                                <div>
                                    <Icono nombre="correo" tamano={18} />
                                    <span>
                                        <small>Correo</small>
                                        <strong>{aerolinea.correoAerolinea}</strong>
                                    </span>
                                </div>
                                <div>
                                    <Icono nombre="telefono" tamano={18} />
                                    <span>
                                        <small>Teléfono</small>
                                        <strong>
                                            {aerolinea.telefonoAerolinea ||
                                                'No registrado'}
                                        </strong>
                                    </span>
                                </div>
                                <div>
                                    <Icono nombre="ubicacion" tamano={18} />
                                    <span>
                                        <small>Ubicación</small>
                                        <strong>
                                            {aerolinea.paisAerolinea ||
                                                'No registrada'}
                                            {aerolinea.codigoPaisAerolinea
                                                ? ` (${aerolinea.codigoPaisAerolinea})`
                                                : ''}
                                        </strong>
                                    </span>
                                </div>
                                <div>
                                    <Icono nombre="moneda" tamano={18} />
                                    <span>
                                        <small>Moneda</small>
                                        <strong>
                                            {aerolinea.monedaAerolinea ||
                                                'No registrada'}
                                        </strong>
                                    </span>
                                </div>
                                <div>
                                    <Icono nombre="reloj" tamano={18} />
                                    <span>
                                        <small>Zona horaria</small>
                                        <strong>
                                            {aerolinea.zonaHorariaAerolinea ||
                                                'No registrada'}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <footer className="aerolineas-tarjeta__acciones">
                                <button
                                    type="button"
                                    className="aerolineas-accion aerolineas-accion--editar"
                                    onClick={() => abrirEdicion(aerolinea)}
                                >
                                    <Icono nombre="editar" tamano={18} />
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    className="aerolineas-accion aerolineas-accion--eliminar"
                                    onClick={() =>
                                        setAerolineaEliminar(aerolinea)
                                    }
                                >
                                    <Icono nombre="eliminar" tamano={18} />
                                    Eliminar
                                </button>
                            </footer>
                        </article>
                    ))}
                </div>
            )}

            {formularioAbierto && (
                <div
                    className="aerolineas-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            cerrarFormulario()
                        }
                    }}
                >
                    <section
                        className="aerolineas-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="aerolineas-modal-titulo"
                    >
                        <header className="aerolineas-modal__cabecera">
                            <div className="aerolineas-modal__titulo">
                                <span className="aerolineas-modal__icono">
                                    <Icono nombre="aerolinea" tamano={25} />
                                </span>
                                <div>
                                    <span className="aerolineas-etiqueta">
                                        {aerolineaEdicion
                                            ? 'Actualizar tenant'
                                            : 'Nuevo tenant'}
                                    </span>
                                    <h3 id="aerolineas-modal-titulo">
                                        {aerolineaEdicion
                                            ? `Editar ${aerolineaEdicion.nombreComercialAerolinea}`
                                            : 'Registrar aerolínea'}
                                    </h3>
                                    <p>
                                        Los campos marcados con * son obligatorios.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="aerolineas-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" />
                            </button>
                        </header>

                        <form
                            className="aerolineas-formulario"
                            onSubmit={(evento) => void guardar(evento)}
                        >
                            <div className="aerolineas-formulario__seccion aerolineas-formulario__seccion--completa">
                                <span>Identidad empresarial</span>
                                <small>
                                    Datos principales con los que se identifica el tenant.
                                </small>
                            </div>

                            <label className="aerolineas-campo">
                                <span>Nombre comercial *</span>
                                <input
                                    type="text"
                                    value={formulario.nombreComercialAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'nombreComercialAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    minLength={2}
                                    maxLength={100}
                                    required
                                    disabled={guardando}
                                    placeholder="Ej. Aerolínea Andina"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Razón social</span>
                                <input
                                    type="text"
                                    value={formulario.razonSocialAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'razonSocialAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={150}
                                    disabled={guardando}
                                    placeholder="Nombre legal de la empresa"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>RUC</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formulario.rucAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'rucAerolinea',
                                            evento.target.value.replace(/\D/g, '').slice(0, 13),
                                        )
                                    }
                                    maxLength={13}
                                    disabled={guardando}
                                    placeholder="13 dígitos"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Estado *</span>
                                <select
                                    value={formulario.estadoAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'estadoAerolinea',
                                            evento.target.value as EstadoAerolinea,
                                        )
                                    }
                                    disabled={guardando}
                                >
                                    {estadosAerolinea.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {etiquetaEstado(estado)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="aerolineas-formulario__seccion aerolineas-formulario__seccion--completa">
                                <span>Códigos aeronáuticos</span>
                                <small>
                                    Los códigos son opcionales, pero deben ser únicos.
                                </small>
                            </div>

                            <label className="aerolineas-campo">
                                <span>Código IATA</span>
                                <input
                                    type="text"
                                    value={formulario.codigoIataAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'codigoIataAerolinea',
                                            evento.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, '')
                                                .slice(0, 2),
                                        )
                                    }
                                    maxLength={2}
                                    disabled={guardando}
                                    placeholder="DJ"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Código ICAO</span>
                                <input
                                    type="text"
                                    value={formulario.codigoIcaoAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'codigoIcaoAerolinea',
                                            evento.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z]/g, '')
                                                .slice(0, 3),
                                        )
                                    }
                                    maxLength={3}
                                    disabled={guardando}
                                    placeholder="DJA"
                                />
                            </label>

                            <div className="aerolineas-formulario__seccion aerolineas-formulario__seccion--completa">
                                <span>Contacto y localización</span>
                                <small>
                                    Configuración regional utilizada por las operaciones.
                                </small>
                            </div>

                            <label className="aerolineas-campo">
                                <span>Correo electrónico *</span>
                                <input
                                    type="email"
                                    value={formulario.correoAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'correoAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={150}
                                    required
                                    disabled={guardando}
                                    placeholder="contacto@aerolinea.com"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Teléfono</span>
                                <input
                                    type="tel"
                                    value={formulario.telefonoAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'telefonoAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={20}
                                    disabled={guardando}
                                    placeholder="+593 99 123 4567"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>País</span>
                                <input
                                    type="text"
                                    value={formulario.paisAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'paisAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={80}
                                    disabled={guardando}
                                    placeholder="Ecuador"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Código de país</span>
                                <input
                                    type="text"
                                    value={formulario.codigoPaisAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'codigoPaisAerolinea',
                                            evento.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z]/g, '')
                                                .slice(0, 2),
                                        )
                                    }
                                    maxLength={2}
                                    disabled={guardando}
                                    placeholder="EC"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Moneda</span>
                                <input
                                    type="text"
                                    value={formulario.monedaAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'monedaAerolinea',
                                            evento.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z]/g, '')
                                                .slice(0, 3),
                                        )
                                    }
                                    maxLength={3}
                                    disabled={guardando}
                                    placeholder="USD"
                                />
                            </label>

                            <label className="aerolineas-campo">
                                <span>Zona horaria</span>
                                <input
                                    type="text"
                                    value={formulario.zonaHorariaAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'zonaHorariaAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={100}
                                    disabled={guardando}
                                    placeholder="America/Guayaquil"
                                />
                            </label>

                            <label className="aerolineas-campo aerolineas-campo--completo">
                                <span>URL del logotipo</span>
                                <input
                                    type="url"
                                    value={formulario.logotipoUrlAerolinea}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'logotipoUrlAerolinea',
                                            evento.target.value,
                                        )
                                    }
                                    disabled={guardando}
                                    placeholder="https://ejemplo.com/logotipo.png"
                                />
                                <small>
                                    Campo opcional. Debe incluir el protocolo http o https.
                                </small>
                            </label>

                            {errorFormulario && (
                                <div
                                    className="aerolineas-formulario__error"
                                    role="alert"
                                >
                                    <Icono nombre="alerta" tamano={19} />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <div className="aerolineas-formulario__nota">
                                <Icono nombre="informacion" tamano={18} />
                                <span>
                                    El RUC, los códigos IATA e ICAO y el correo
                                    no pueden repetirse en otra aerolínea.
                                </span>
                            </div>

                            <footer className="aerolineas-formulario__acciones">
                                <button
                                    type="button"
                                    className="aerolineas-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="aerolineas-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="aerolineas-spinner aerolineas-spinner--pequeno" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    aerolineaEdicion ? 'editar' : 'agregar'
                                                }
                                            />
                                            {aerolineaEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar aerolínea'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {aerolineaEliminar && (
                <div
                    className="aerolineas-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            setAerolineaEliminar(null)
                        }
                    }}
                >
                    <section
                        className="aerolineas-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="aerolineas-eliminar-titulo"
                    >
                        <span className="aerolineas-confirmacion__icono">
                            <Icono nombre="eliminar" tamano={26} />
                        </span>
                        <span className="aerolineas-etiqueta">
                            Eliminar tenant
                        </span>
                        <h3 id="aerolineas-eliminar-titulo">
                            ¿Eliminar{' '}
                            {aerolineaEliminar.nombreComercialAerolinea}?
                        </h3>
                        <p>
                            Esta acción es definitiva. Si la aerolínea tiene
                            suscripciones, usuarios, aviones u operaciones, el
                            backend impedirá la eliminación y deberá cambiarse a
                            INACTIVA.
                        </p>
                        <div className="aerolineas-confirmacion__detalle">
                            <strong>
                                {obtenerCodigoPrincipal(aerolineaEliminar)}
                            </strong>
                            <span>{aerolineaEliminar.correoAerolinea}</span>
                        </div>
                        <div className="aerolineas-confirmacion__acciones">
                            <button
                                type="button"
                                className="aerolineas-boton-secundario"
                                onClick={() => setAerolineaEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="aerolineas-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <span className="aerolineas-spinner aerolineas-spinner--pequeno" />
                                        Eliminando
                                    </>
                                ) : (
                                    <>
                                        <Icono nombre="eliminar" />
                                        Eliminar definitivamente
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

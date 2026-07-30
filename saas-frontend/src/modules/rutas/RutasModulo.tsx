/* saas-frontend/src/modules/rutas/RutasModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './RutasModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoRuta = 'ACTIVA' | 'INACTIVA'
type EstadoAeropuerto = 'ACTIVO' | 'INACTIVO'
type FiltroEstado = 'TODAS' | EstadoRuta

type IconoNombre =
    | 'ruta'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'origen'
    | 'destino'
    | 'reloj'
    | 'distancia'
    | 'aerolinea'
    | 'intercambiar'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea: string
    estadoAerolinea: string
}

interface AeropuertoResumen {
    idAeropuerto: number
    codigoIataAeropuerto: string
    codigoIcaoAeropuerto: string
    nombreAeropuerto: string
    ciudadAeropuerto: string
    paisAeropuerto: string
    estadoAeropuerto: EstadoAeropuerto
}

interface Ruta {
    idRuta: number
    fkAerolineaRuta: number
    fkAeropuertoOrigenRuta: number
    fkAeropuertoDestinoRuta: number
    codigoRuta: string
    duracionEstimadaMinutosRuta: number
    distanciaKilometrosRuta: number | string | null
    estadoRuta: EstadoRuta
    aerolineaRuta: AerolineaResumen
    aeropuertoOrigenRuta: AeropuertoResumen
    aeropuertoDestinoRuta: AeropuertoResumen
}

interface FormularioRuta {
    fkAerolineaRuta: string
    fkAeropuertoOrigenRuta: string
    fkAeropuertoDestinoRuta: string
    codigoRuta: string
    duracionEstimadaMinutosRuta: string
    distanciaKilometrosRuta: string
    estadoRuta: EstadoRuta
}

interface RutasModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    rutas: Ruta[]
    aeropuertos: AeropuertoResumen[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioRuta = {
    fkAerolineaRuta: '',
    fkAeropuertoOrigenRuta: '',
    fkAeropuertoDestinoRuta: '',
    codigoRuta: '',
    duracionEstimadaMinutosRuta: '',
    distanciaKilometrosRuta: '',
    estadoRuta: 'ACTIVA',
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
        case 'ruta':
            return (
                <svg {...props}>
                    <circle cx="5" cy="18" r="2.5" />
                    <circle cx="19" cy="6" r="2.5" />
                    <path d="M7.5 18c4 0 1.5-7 6-7H15" />
                    <path d="m12.5 7.5 2.5 3.5-4 1" />
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
        case 'origen':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        case 'destino':
            return (
                <svg {...props}>
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0" />
                    <circle cx="12" cy="10" r="2.5" />
                </svg>
            )
        case 'reloj':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'distancia':
            return (
                <svg {...props}>
                    <path d="M4 16V8M20 16V8M4 12h16" />
                    <path d="m7 9-3 3 3 3M17 9l3 3-3 3" />
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
        case 'intercambiar':
            return (
                <svg {...props}>
                    <path d="M7 7h11l-3-3M17 17H6l3 3" />
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
        objeto.message.every((elemento) => typeof elemento === 'string')
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

function ordenarRutas(lista: Ruta[]): Ruta[] {
    return [...lista].sort((a, b) => {
        const comparacionAerolinea =
            a.aerolineaRuta.nombreComercialAerolinea.localeCompare(
                b.aerolineaRuta.nombreComercialAerolinea,
                'es',
            )

        if (comparacionAerolinea !== 0) {
            return comparacionAerolinea
        }

        return a.codigoRuta.localeCompare(b.codigoRuta, 'es')
    })
}

function ordenarAeropuertos(
    lista: AeropuertoResumen[],
): AeropuertoResumen[] {
    return [...lista].sort((a, b) =>
        a.codigoIataAeropuerto.localeCompare(
            b.codigoIataAeropuerto,
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

function formatearDistancia(
    distancia: number | string | null,
): string {
    if (distancia === null || distancia === '') {
        return 'No registrada'
    }

    const numero = Number(distancia)

    if (!Number.isFinite(numero)) {
        return 'No registrada'
    }

    return `${numero.toLocaleString('es-EC', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} km`
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudRutas = solicitar<Ruta[]>('/rutas', token, {
        signal,
    })

    const solicitudAeropuertos = solicitar<AeropuertoResumen[]>(
        '/aeropuertos',
        token,
        { signal },
    )

    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [rutas, aeropuertos, aerolineas] = await Promise.all([
        solicitudRutas,
        solicitudAeropuertos,
        solicitudAerolineas,
    ])

    return {
        rutas: ordenarRutas(Array.isArray(rutas) ? rutas : []),
        aeropuertos: ordenarAeropuertos(
            Array.isArray(aeropuertos) ? aeropuertos : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function RutasModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: RutasModuloProps) {
    const [rutas, setRutas] = useState<Ruta[]>([])
    const [aeropuertos, setAeropuertos] = useState<
        AeropuertoResumen[]
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
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [rutaEdicion, setRutaEdicion] =
        useState<Ruta | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioRuta>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [rutaEliminar, setRutaEliminar] =
        useState<Ruta | null>(null)

    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const puedeGestionar =
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

                setRutas(datos.rutas)
                setAeropuertos(datos.aeropuertos)
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
                            : 'No fue posible cargar las rutas.',
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

    const aeropuertosActivos = useMemo(
        () =>
            aeropuertos.filter(
                (aeropuerto) =>
                    aeropuerto.estadoAeropuerto === 'ACTIVO',
            ),
        [aeropuertos],
    )

    const aerolineasActivas = useMemo(
        () =>
            aerolineas.filter(
                (aerolinea) =>
                    aerolinea.estadoAerolinea === 'ACTIVA',
            ),
        [aerolineas],
    )

    const puedeAbrirCreacion =
        puedeGestionar &&
        aeropuertosActivos.length >= 2 &&
        (!esSuperadmin || aerolineasActivas.length > 0)

    const rutasFiltradas = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return rutas.filter((ruta) => {
            if (
                filtroEstado !== 'TODAS' &&
                ruta.estadoRuta !== filtroEstado
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                ruta.fkAerolineaRuta !== Number(filtroAerolinea)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    ruta.codigoRuta,
                    ruta.aerolineaRuta.nombreComercialAerolinea,
                    ruta.aerolineaRuta.codigoIataAerolinea,
                    ruta.aeropuertoOrigenRuta.codigoIataAeropuerto,
                    ruta.aeropuertoOrigenRuta.codigoIcaoAeropuerto,
                    ruta.aeropuertoOrigenRuta.nombreAeropuerto,
                    ruta.aeropuertoOrigenRuta.ciudadAeropuerto,
                    ruta.aeropuertoDestinoRuta.codigoIataAeropuerto,
                    ruta.aeropuertoDestinoRuta.codigoIcaoAeropuerto,
                    ruta.aeropuertoDestinoRuta.nombreAeropuerto,
                    ruta.aeropuertoDestinoRuta.ciudadAeropuerto,
                ].join(' '),
            ).includes(texto)
        })
    }, [
        rutas,
        busqueda,
        filtroEstado,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const activas = rutas.filter(
            (ruta) => ruta.estadoRuta === 'ACTIVA',
        ).length

        const aerolineasConRutas = new Set(
            rutas.map((ruta) => ruta.fkAerolineaRuta),
        ).size

        const aeropuertosConectados = new Set(
            rutas.flatMap((ruta) => [
                ruta.fkAeropuertoOrigenRuta,
                ruta.fkAeropuertoDestinoRuta,
            ]),
        ).size

        return {
            total: rutas.length,
            activas,
            inactivas: rutas.length - activas,
            cobertura: esSuperadmin
                ? aerolineasConRutas
                : aeropuertosConectados,
        }
    }, [rutas, esSuperadmin])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

            setRutas(datos.rutas)
            setAeropuertos(datos.aeropuertos)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar las rutas.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        setRutaEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaRuta:
                esSuperadmin && aerolineasActivas.length === 1
                    ? String(aerolineasActivas[0].idAerolinea)
                    : '',
            fkAeropuertoOrigenRuta:
                aeropuertosActivos.length > 0
                    ? String(aeropuertosActivos[0].idAeropuerto)
                    : '',
            fkAeropuertoDestinoRuta:
                aeropuertosActivos.length > 1
                    ? String(aeropuertosActivos[1].idAeropuerto)
                    : '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(ruta: Ruta) {
        setRutaEdicion(ruta)
        setFormulario({
            fkAerolineaRuta: String(ruta.fkAerolineaRuta),
            fkAeropuertoOrigenRuta: String(
                ruta.fkAeropuertoOrigenRuta,
            ),
            fkAeropuertoDestinoRuta: String(
                ruta.fkAeropuertoDestinoRuta,
            ),
            codigoRuta: ruta.codigoRuta,
            duracionEstimadaMinutosRuta: String(
                ruta.duracionEstimadaMinutosRuta,
            ),
            distanciaKilometrosRuta:
                ruta.distanciaKilometrosRuta === null
                    ? ''
                    : String(ruta.distanciaKilometrosRuta),
            estadoRuta: ruta.estadoRuta,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setRutaEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioRuta>(
        campo: K,
        valor: FormularioRuta[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function intercambiarAeropuertos() {
        setFormulario((actual) => ({
            ...actual,
            fkAeropuertoOrigenRuta:
                actual.fkAeropuertoDestinoRuta,
            fkAeropuertoDestinoRuta:
                actual.fkAeropuertoOrigenRuta,
        }))
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            rutaEdicion === null &&
            !formulario.fkAerolineaRuta
        ) {
            return 'Selecciona la aerolínea propietaria de la ruta.'
        }

        if (!formulario.fkAeropuertoOrigenRuta) {
            return 'Selecciona el aeropuerto de origen.'
        }

        if (!formulario.fkAeropuertoDestinoRuta) {
            return 'Selecciona el aeropuerto de destino.'
        }

        if (
            formulario.fkAeropuertoOrigenRuta ===
            formulario.fkAeropuertoDestinoRuta
        ) {
            return 'El aeropuerto de origen y el destino deben ser diferentes.'
        }

        if (!/^[A-Z0-9-]{3,20}$/.test(formulario.codigoRuta)) {
            return 'El código debe tener entre 3 y 20 caracteres y usar solo letras, números o guiones.'
        }

        const duracion = Number(
            formulario.duracionEstimadaMinutosRuta,
        )

        if (
            !Number.isInteger(duracion) ||
            duracion < 1 ||
            duracion > 3000
        ) {
            return 'La duración debe ser un número entero entre 1 y 3000 minutos.'
        }

        if (formulario.distanciaKilometrosRuta.trim()) {
            const distancia = Number(
                formulario.distanciaKilometrosRuta,
            )

            if (
                !Number.isFinite(distancia) ||
                distancia < 0.01 ||
                distancia > 50000
            ) {
                return 'La distancia debe estar entre 0.01 y 50000 kilómetros.'
            }

            const decimales =
                formulario.distanciaKilometrosRuta.split('.')[1]

            if (decimales && decimales.length > 2) {
                return 'La distancia puede tener máximo 2 decimales.'
            }
        }

        const aeropuertoOrigen = aeropuertos.find(
            (aeropuerto) =>
                aeropuerto.idAeropuerto ===
                Number(formulario.fkAeropuertoOrigenRuta),
        )

        const aeropuertoDestino = aeropuertos.find(
            (aeropuerto) =>
                aeropuerto.idAeropuerto ===
                Number(formulario.fkAeropuertoDestinoRuta),
        )

        if (
            aeropuertoOrigen?.estadoAeropuerto !== 'ACTIVO' ||
            aeropuertoDestino?.estadoAeropuerto !== 'ACTIVO'
        ) {
            return 'Los aeropuertos de origen y destino deben estar ACTIVOS.'
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

        const datosBase = {
            fkAeropuertoOrigenRuta: Number(
                formulario.fkAeropuertoOrigenRuta,
            ),
            fkAeropuertoDestinoRuta: Number(
                formulario.fkAeropuertoDestinoRuta,
            ),
            codigoRuta: formulario.codigoRuta.trim(),
            duracionEstimadaMinutosRuta: Number(
                formulario.duracionEstimadaMinutosRuta,
            ),
            distanciaKilometrosRuta:
                formulario.distanciaKilometrosRuta.trim()
                    ? Number(formulario.distanciaKilometrosRuta)
                    : undefined,
            estadoRuta: formulario.estadoRuta,
        }

        const esEdicion = rutaEdicion !== null

        const datos =
            !esEdicion && esSuperadmin
                ? {
                    ...datosBase,
                    fkAerolineaRuta: Number(
                        formulario.fkAerolineaRuta,
                    ),
                }
                : datosBase

        try {
            const rutaGuardada = await solicitar<Ruta>(
                esEdicion
                    ? `/rutas/${rutaEdicion.idRuta}`
                    : '/rutas',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setRutas((lista) =>
                ordenarRutas([
                    ...lista.filter(
                        (ruta) => ruta.idRuta !== rutaGuardada.idRuta,
                    ),
                    rutaGuardada,
                ]),
            )
            setFormularioAbierto(false)
            setRutaEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Ruta actualizada correctamente.'
                    : 'Ruta registrada correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar la ruta.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!rutaEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(`/rutas/${rutaEliminar.idRuta}`, token, {
                method: 'DELETE',
            })

            setRutas((lista) =>
                lista.filter(
                    (ruta) => ruta.idRuta !== rutaEliminar.idRuta,
                ),
            )
            setRutaEliminar(null)
            setMensajeExito('Ruta eliminada correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar la ruta.',
            )
            setRutaEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    const aeropuertoOrigenSeleccionado = aeropuertos.find(
        (aeropuerto) =>
            aeropuerto.idAeropuerto ===
            Number(formulario.fkAeropuertoOrigenRuta),
    )

    const aeropuertoDestinoSeleccionado = aeropuertos.find(
        (aeropuerto) =>
            aeropuerto.idAeropuerto ===
            Number(formulario.fkAeropuertoDestinoRuta),
    )

    return (
        <section className="rutas-modulo">
            <header className="rutas-cabecera">
                <div className="rutas-cabecera__texto">
                    <span className="rutas-etiqueta">
                        Operación por aerolínea
                    </span>
                    <h2>Gestión de Rutas</h2>
                    <p>
                        Conecta aeropuertos, define tiempos estimados y
                        administra los trayectos disponibles para cada
                        tenant.
                    </p>
                </div>

                <div className="rutas-cabecera__acciones">
                    <button
                        type="button"
                        className="rutas-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    {puedeGestionar && (
                        <button
                            type="button"
                            className="rutas-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Registrar una nueva ruta'
                                    : 'Se necesitan dos aeropuertos activos y una aerolínea operativa'
                            }
                        >
                            <Icono nombre="agregar" />
                            Nueva ruta
                        </button>
                    )}
                </div>
            </header>

            {!puedeGestionar && (
                <div className="rutas-aviso rutas-aviso--consulta">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>Rutas en modo consulta</strong>
                        <span>
                            Puedes revisar los trayectos de tu aerolínea. La
                            creación, edición y eliminación corresponde a los
                            administradores.
                        </span>
                    </div>
                </div>
            )}

            {puedeGestionar && aeropuertosActivos.length < 2 && (
                <div className="rutas-aviso rutas-aviso--advertencia">
                    <Icono nombre="alerta" tamano={21} />
                    <div>
                        <strong>Faltan aeropuertos operativos</strong>
                        <span>
                            Deben existir al menos dos aeropuertos ACTIVOS para
                            registrar una ruta.
                        </span>
                    </div>
                </div>
            )}

            {mensajeExito && (
                <div className="rutas-mensaje rutas-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="rutas-mensaje rutas-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="rutas-resumen">
                <article>
                    <span>Total registradas</span>
                    <strong>{resumen.total}</strong>
                    <small>Trayectos disponibles</small>
                </article>
                <article>
                    <span>Operativas</span>
                    <strong>{resumen.activas}</strong>
                    <small className="rutas-texto-activo">
                        Estado ACTIVA
                    </small>
                </article>
                <article>
                    <span>No operativas</span>
                    <strong>{resumen.inactivas}</strong>
                    <small>Estado INACTIVA</small>
                </article>
                <article>
                    <span>
                        {esSuperadmin
                            ? 'Aerolíneas con rutas'
                            : 'Aeropuertos conectados'}
                    </span>
                    <strong>{resumen.cobertura}</strong>
                    <small>
                        {esSuperadmin
                            ? 'Cobertura entre tenants'
                            : 'Cobertura de tu aerolínea'}
                    </small>
                </article>
            </div>

            <section className="rutas-panel">
                <div className="rutas-herramientas">
                    <div className="rutas-buscador">
                        <Icono nombre="buscar" tamano={19} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder="Buscar por código, aerolínea, origen o destino"
                            aria-label="Buscar rutas"
                        />
                    </div>

                    <label className="rutas-filtro">
                        <span>Estado</span>
                        <select
                            value={filtroEstado}
                            onChange={(evento) =>
                                setFiltroEstado(
                                    evento.target.value as FiltroEstado,
                                )
                            }
                        >
                            <option value="TODAS">Todas</option>
                            <option value="ACTIVA">Activas</option>
                            <option value="INACTIVA">Inactivas</option>
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="rutas-filtro rutas-filtro--aerolinea">
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

                    <span className="rutas-resultados">
                        {rutasFiltradas.length}{' '}
                        {rutasFiltradas.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="rutas-estado-vacio">
                        <span className="rutas-cargador" />
                        <strong>Cargando rutas</strong>
                        <p>
                            Consultando los trayectos autorizados para tu
                            sesión.
                        </p>
                    </div>
                ) : rutasFiltradas.length === 0 ? (
                    <div className="rutas-estado-vacio">
                        <div className="rutas-estado-vacio__icono">
                            <Icono nombre="ruta" tamano={38} />
                        </div>
                        <strong>
                            {rutas.length === 0
                                ? 'No existen rutas registradas'
                                : 'No se encontraron coincidencias'}
                        </strong>
                        <p>
                            {rutas.length === 0
                                ? esSuperadmin
                                    ? 'Todavía no se han creado trayectos para ninguna aerolínea.'
                                    : `Todavía no existen trayectos para ${nombreAerolinea}.`
                                : 'Prueba con otro texto o cambia los filtros.'}
                        </p>
                        {puedeGestionar &&
                            rutas.length === 0 &&
                            puedeAbrirCreacion && (
                                <button
                                    type="button"
                                    className="rutas-boton-principal"
                                    onClick={abrirCreacion}
                                >
                                    <Icono nombre="agregar" />
                                    Registrar la primera
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="rutas-tabla-contenedor">
                        <table className="rutas-tabla">
                            <thead>
                                <tr>
                                    <th>Ruta</th>
                                    {esSuperadmin && <th>Aerolínea</th>}
                                    <th>Trayecto</th>
                                    <th>Duración y distancia</th>
                                    <th>Estado</th>
                                    {puedeGestionar && (
                                        <th className="rutas-columna-acciones">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {rutasFiltradas.map((ruta) => (
                                    <tr key={ruta.idRuta}>
                                        <td data-label="Ruta">
                                            <div className="rutas-codigo">
                                                <span className="rutas-codigo__icono">
                                                    <Icono nombre="ruta" tamano={19} />
                                                </span>
                                                <div>
                                                    <strong>{ruta.codigoRuta}</strong>
                                                    <small>ID #{ruta.idRuta}</small>
                                                </div>
                                            </div>
                                        </td>

                                        {esSuperadmin && (
                                            <td data-label="Aerolínea">
                                                <div className="rutas-aerolinea">
                                                    <Icono nombre="aerolinea" tamano={17} />
                                                    <div>
                                                        <strong>
                                                            {
                                                                ruta.aerolineaRuta
                                                                    .nombreComercialAerolinea
                                                            }
                                                        </strong>
                                                        <span>
                                                            {
                                                                ruta.aerolineaRuta
                                                                    .codigoIataAerolinea
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        <td data-label="Trayecto">
                                            <div className="rutas-trayecto">
                                                <div className="rutas-punto">
                                                    <span className="rutas-punto__icono rutas-punto__icono--origen">
                                                        <Icono nombre="origen" tamano={16} />
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {
                                                                ruta.aeropuertoOrigenRuta
                                                                    .codigoIataAeropuerto
                                                            }
                                                        </strong>
                                                        <small>
                                                            {
                                                                ruta.aeropuertoOrigenRuta
                                                                    .ciudadAeropuerto
                                                            }
                                                        </small>
                                                    </div>
                                                </div>

                                                <span className="rutas-linea">
                                                    <span />
                                                    <Icono nombre="ruta" tamano={16} />
                                                    <span />
                                                </span>

                                                <div className="rutas-punto">
                                                    <span className="rutas-punto__icono rutas-punto__icono--destino">
                                                        <Icono nombre="destino" tamano={16} />
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {
                                                                ruta.aeropuertoDestinoRuta
                                                                    .codigoIataAeropuerto
                                                            }
                                                        </strong>
                                                        <small>
                                                            {
                                                                ruta.aeropuertoDestinoRuta
                                                                    .ciudadAeropuerto
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Duración y distancia">
                                            <div className="rutas-metricas">
                                                <span>
                                                    <Icono nombre="reloj" tamano={15} />
                                                    {formatearDuracion(
                                                        ruta.duracionEstimadaMinutosRuta,
                                                    )}
                                                </span>
                                                <span>
                                                    <Icono nombre="distancia" tamano={15} />
                                                    {formatearDistancia(
                                                        ruta.distanciaKilometrosRuta,
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        <td data-label="Estado">
                                            <span
                                                className={`rutas-estado rutas-estado--${ruta.estadoRuta.toLowerCase()}`}
                                            >
                                                <span />
                                                {ruta.estadoRuta}
                                            </span>
                                        </td>

                                        {puedeGestionar && (
                                            <td data-label="Acciones">
                                                <div className="rutas-acciones-fila">
                                                    <button
                                                        type="button"
                                                        className="rutas-boton-icono"
                                                        onClick={() => abrirEdicion(ruta)}
                                                        aria-label={`Editar ${ruta.codigoRuta}`}
                                                        title="Editar ruta"
                                                    >
                                                        <Icono nombre="editar" tamano={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rutas-boton-icono rutas-boton-icono--peligro"
                                                        onClick={() => setRutaEliminar(ruta)}
                                                        aria-label={`Eliminar ${ruta.codigoRuta}`}
                                                        title="Eliminar ruta"
                                                    >
                                                        <Icono nombre="eliminar" tamano={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div className="rutas-modal-capa">
                    <section
                        className="rutas-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-formulario-ruta"
                    >
                        <header className="rutas-modal__cabecera">
                            <div className="rutas-modal__titulo">
                                <span className="rutas-modal__icono">
                                    <Icono nombre="ruta" tamano={24} />
                                </span>
                                <div>
                                    <span>
                                        {rutaEdicion
                                            ? 'Actualizar trayecto'
                                            : 'Nuevo trayecto'}
                                    </span>
                                    <h3 id="titulo-formulario-ruta">
                                        {rutaEdicion
                                            ? 'Editar ruta'
                                            : 'Registrar ruta'}
                                    </h3>
                                    <p>
                                        Define la aerolínea, el trayecto y sus datos
                                        operativos.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rutas-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" />
                            </button>
                        </header>

                        <form
                            className="rutas-formulario"
                            onSubmit={(evento) => void guardar(evento)}
                        >
                            {esSuperadmin ? (
                                <label className="rutas-campo rutas-campo--completo">
                                    <span>Aerolínea propietaria</span>
                                    <select
                                        value={formulario.fkAerolineaRuta}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAerolineaRuta',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando || rutaEdicion !== null}
                                    >
                                        <option value="">
                                            Selecciona una aerolínea
                                        </option>
                                        {aerolineas.map((aerolinea) => (
                                            <option
                                                key={aerolinea.idAerolinea}
                                                value={aerolinea.idAerolinea}
                                                disabled={
                                                    aerolinea.estadoAerolinea !== 'ACTIVA'
                                                }
                                            >
                                                {aerolinea.nombreComercialAerolinea} —{' '}
                                                {aerolinea.codigoIataAerolinea}
                                                {aerolinea.estadoAerolinea !== 'ACTIVA'
                                                    ? ' (NO ACTIVA)'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {rutaEdicion && (
                                        <small>
                                            La aerolínea no puede cambiarse después de
                                            crear la ruta.
                                        </small>
                                    )}
                                </label>
                            ) : (
                                <div className="rutas-tenant-asignado">
                                    <Icono nombre="aerolinea" tamano={20} />
                                    <div>
                                        <span>Aerolínea asignada por la sesión</span>
                                        <strong>{nombreAerolinea}</strong>
                                    </div>
                                </div>
                            )}

                            <div className="rutas-formulario__trayecto">
                                <label className="rutas-campo">
                                    <span>Aeropuerto de origen</span>
                                    <select
                                        value={
                                            formulario.fkAeropuertoOrigenRuta
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAeropuertoOrigenRuta',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">Selecciona el origen</option>
                                        {aeropuertos.map((aeropuerto) => (
                                            <option
                                                key={aeropuerto.idAeropuerto}
                                                value={aeropuerto.idAeropuerto}
                                                disabled={
                                                    aeropuerto.estadoAeropuerto !== 'ACTIVO' ||
                                                    String(aeropuerto.idAeropuerto) ===
                                                    formulario.fkAeropuertoDestinoRuta
                                                }
                                            >
                                                {aeropuerto.codigoIataAeropuerto} —{' '}
                                                {aeropuerto.ciudadAeropuerto}
                                                {aeropuerto.estadoAeropuerto !== 'ACTIVO'
                                                    ? ' (INACTIVO)'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    className="rutas-boton-intercambiar"
                                    onClick={intercambiarAeropuertos}
                                    disabled={
                                        guardando ||
                                        !formulario.fkAeropuertoOrigenRuta ||
                                        !formulario.fkAeropuertoDestinoRuta
                                    }
                                    aria-label="Intercambiar origen y destino"
                                    title="Intercambiar origen y destino"
                                >
                                    <Icono nombre="intercambiar" tamano={20} />
                                </button>

                                <label className="rutas-campo">
                                    <span>Aeropuerto de destino</span>
                                    <select
                                        value={
                                            formulario.fkAeropuertoDestinoRuta
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAeropuertoDestinoRuta',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">
                                            Selecciona el destino
                                        </option>
                                        {aeropuertos.map((aeropuerto) => (
                                            <option
                                                key={aeropuerto.idAeropuerto}
                                                value={aeropuerto.idAeropuerto}
                                                disabled={
                                                    aeropuerto.estadoAeropuerto !== 'ACTIVO' ||
                                                    String(aeropuerto.idAeropuerto) ===
                                                    formulario.fkAeropuertoOrigenRuta
                                                }
                                            >
                                                {aeropuerto.codigoIataAeropuerto} —{' '}
                                                {aeropuerto.ciudadAeropuerto}
                                                {aeropuerto.estadoAeropuerto !== 'ACTIVO'
                                                    ? ' (INACTIVO)'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {aeropuertoOrigenSeleccionado &&
                                aeropuertoDestinoSeleccionado && (
                                    <div className="rutas-vista-previa">
                                        <div>
                                            <span>Origen</span>
                                            <strong>
                                                {
                                                    aeropuertoOrigenSeleccionado.codigoIataAeropuerto
                                                }
                                            </strong>
                                            <small>
                                                {
                                                    aeropuertoOrigenSeleccionado.ciudadAeropuerto
                                                }
                                            </small>
                                        </div>
                                        <span className="rutas-vista-previa__linea">
                                            <span />
                                            <Icono nombre="ruta" tamano={22} />
                                            <span />
                                        </span>
                                        <div>
                                            <span>Destino</span>
                                            <strong>
                                                {
                                                    aeropuertoDestinoSeleccionado.codigoIataAeropuerto
                                                }
                                            </strong>
                                            <small>
                                                {
                                                    aeropuertoDestinoSeleccionado.ciudadAeropuerto
                                                }
                                            </small>
                                        </div>
                                    </div>
                                )}

                            <div className="rutas-formulario__rejilla">
                                <label className="rutas-campo">
                                    <span>Código de ruta</span>
                                    <input
                                        value={formulario.codigoRuta}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'codigoRuta',
                                                evento.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9-]/g, '')
                                                    .slice(0, 20),
                                            )
                                        }
                                        placeholder="DJ-UIO-GYE"
                                        minLength={3}
                                        maxLength={20}
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Entre 3 y 20 letras, números o guiones.
                                    </small>
                                </label>

                                <label className="rutas-campo">
                                    <span>Duración estimada</span>
                                    <div className="rutas-campo-con-unidad">
                                        <input
                                            type="number"
                                            value={
                                                formulario.duracionEstimadaMinutosRuta
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'duracionEstimadaMinutosRuta',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="55"
                                            min={1}
                                            max={3000}
                                            step={1}
                                            required
                                            disabled={guardando}
                                        />
                                        <span>minutos</span>
                                    </div>
                                </label>

                                <label className="rutas-campo">
                                    <span>Distancia</span>
                                    <div className="rutas-campo-con-unidad">
                                        <input
                                            type="number"
                                            value={formulario.distanciaKilometrosRuta}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'distanciaKilometrosRuta',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="280.50"
                                            min={0.01}
                                            max={50000}
                                            step={0.01}
                                            disabled={guardando}
                                        />
                                        <span>km</span>
                                    </div>
                                    <small>Campo opcional, máximo 2 decimales.</small>
                                </label>

                                <label className="rutas-campo">
                                    <span>Estado</span>
                                    <select
                                        value={formulario.estadoRuta}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'estadoRuta',
                                                evento.target.value as EstadoRuta,
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        <option value="ACTIVA">ACTIVA</option>
                                        <option value="INACTIVA">INACTIVA</option>
                                    </select>
                                </label>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="rutas-error-formulario"
                                    role="alert"
                                >
                                    <Icono nombre="alerta" tamano={19} />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <footer className="rutas-modal__acciones">
                                <button
                                    type="button"
                                    className="rutas-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rutas-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="rutas-cargador rutas-cargador--pequeno" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={rutaEdicion ? 'editar' : 'agregar'}
                                            />
                                            {rutaEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar ruta'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {rutaEliminar && (
                <div className="rutas-modal-capa">
                    <section
                        className="rutas-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-eliminar-ruta"
                    >
                        <div className="rutas-confirmacion__icono">
                            <Icono nombre="alerta" tamano={31} />
                        </div>
                        <span className="rutas-etiqueta">
                            Confirmar eliminación
                        </span>
                        <h3 id="titulo-eliminar-ruta">
                            ¿Eliminar {rutaEliminar.codigoRuta}?
                        </h3>
                        <p>
                            Se eliminará el trayecto{' '}
                            <strong>
                                {
                                    rutaEliminar.aeropuertoOrigenRuta
                                        .codigoIataAeropuerto
                                }{' '}
                                →{' '}
                                {
                                    rutaEliminar.aeropuertoDestinoRuta
                                        .codigoIataAeropuerto
                                }
                            </strong>
                            . La operación será bloqueada si existen vuelos
                            asociados.
                        </p>
                        <div className="rutas-confirmacion__acciones">
                            <button
                                type="button"
                                className="rutas-boton-secundario"
                                onClick={() => setRutaEliminar(null)}
                                disabled={eliminando}
                            >
                                Conservar ruta
                            </button>
                            <button
                                type="button"
                                className="rutas-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <span className="rutas-cargador rutas-cargador--pequeno" />
                                        Eliminando
                                    </>
                                ) : (
                                    <>
                                        <Icono nombre="eliminar" />
                                        Eliminar ruta
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

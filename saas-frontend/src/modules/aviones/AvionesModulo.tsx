/* saas-frontend/src/modules/aviones/AvionesModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './AvionesModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoAvion =
    | 'DISPONIBLE'
    | 'MANTENIMIENTO'
    | 'FUERA_DE_SERVICIO'

type FiltroEstado = 'TODOS' | EstadoAvion

type IconoNombre =
    | 'avion'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'aerolinea'
    | 'matricula'
    | 'codigo'
    | 'capacidad'
    | 'calendario'
    | 'herramienta'
    | 'escudo'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea: string
    correoAerolinea: string
    estadoAerolinea: string
}

interface Avion {
    idAvion: number
    fkAerolineaAvion: number
    matriculaAvion: string
    codigoInternoAvion: string
    modeloAvion: string
    fabricanteAvion: string
    capacidadAvion: number
    anioFabricacionAvion: number | null
    estadoAvion: EstadoAvion
    aerolineaAvion: AerolineaResumen
}

interface FormularioAvion {
    fkAerolineaAvion: string
    matriculaAvion: string
    codigoInternoAvion: string
    modeloAvion: string
    fabricanteAvion: string
    capacidadAvion: string
    anioFabricacionAvion: string
    estadoAvion: EstadoAvion
}

interface AvionesModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    aviones: Avion[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioAvion = {
    fkAerolineaAvion: '',
    matriculaAvion: '',
    codigoInternoAvion: '',
    modeloAvion: '',
    fabricanteAvion: '',
    capacidadAvion: '',
    anioFabricacionAvion: '',
    estadoAvion: 'DISPONIBLE',
}

const estadosAvion: EstadoAvion[] = [
    'DISPONIBLE',
    'MANTENIMIENTO',
    'FUERA_DE_SERVICIO',
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
        case 'avion':
            return (
                <svg {...props}>
                    <path d="M3 13.2 21 5l-5.7 14-3.7-5.1L6 16z" />
                    <path d="m11.6 13.9 4.6-4.5" />
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
        case 'aerolinea':
            return (
                <svg {...props}>
                    <path d="M4 20V9l8-5 8 5v11" />
                    <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
                    <path d="M2 20h20" />
                </svg>
            )
        case 'matricula':
            return (
                <svg {...props}>
                    <rect x="3" y="6" width="18" height="12" rx="2.5" />
                    <path d="M7 10h10M7 14h6" />
                </svg>
            )
        case 'codigo':
            return (
                <svg {...props}>
                    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
                </svg>
            )
        case 'capacidad':
            return (
                <svg {...props}>
                    <path d="M7 11V7a3 3 0 0 1 6 0v4" />
                    <path d="M5 11h10a3 3 0 0 1 3 3v4H7a2 2 0 0 1-2-2z" />
                    <path d="M7 18v3M17 18v3" />
                </svg>
            )
        case 'calendario':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                </svg>
            )
        case 'herramienta':
            return (
                <svg {...props}>
                    <path d="M14.5 6.5a4 4 0 0 0-5.4 5.4L4 17l3 3 5.1-5.1a4 4 0 0 0 5.4-5.4l-2.4 2.4-3-3z" />
                </svg>
            )
        case 'escudo':
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
                    <path d="m8.5 12 2.3 2.3 4.8-5" />
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

function ordenarAviones(lista: Avion[]): Avion[] {
    return [...lista].sort((a, b) => {
        const comparacionAerolinea =
            a.aerolineaAvion.nombreComercialAerolinea.localeCompare(
                b.aerolineaAvion.nombreComercialAerolinea,
                'es',
            )

        if (comparacionAerolinea !== 0) {
            return comparacionAerolinea
        }

        return a.codigoInternoAvion.localeCompare(
            b.codigoInternoAvion,
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

function etiquetaEstado(estado: EstadoAvion): string {
    switch (estado) {
        case 'DISPONIBLE':
            return 'Disponible'
        case 'MANTENIMIENTO':
            return 'Mantenimiento'
        case 'FUERA_DE_SERVICIO':
            return 'Fuera de servicio'
    }
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudAviones = solicitar<Avion[]>(
        '/aviones',
        token,
        { signal },
    )

    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [aviones, aerolineas] = await Promise.all([
        solicitudAviones,
        solicitudAerolineas,
    ])

    return {
        aviones: ordenarAviones(
            Array.isArray(aviones) ? aviones : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function AvionesModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: AvionesModuloProps) {
    const [aviones, setAviones] = useState<Avion[]>([])
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
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [avionEdicion, setAvionEdicion] =
        useState<Avion | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioAvion>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [avionEliminar, setAvionEliminar] =
        useState<Avion | null>(null)

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
                            : 'No fue posible cargar los aviones.',
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

    const puedeAbrirCreacion =
        puedeGestionar &&
        (!esSuperadmin || aerolineasActivas.length > 0)

    const avionesFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return aviones.filter((avion) => {
            if (
                filtroEstado !== 'TODOS' &&
                avion.estadoAvion !== filtroEstado
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                avion.fkAerolineaAvion !==
                Number(filtroAerolinea)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    avion.matriculaAvion,
                    avion.codigoInternoAvion,
                    avion.fabricanteAvion,
                    avion.modeloAvion,
                    avion.anioFabricacionAvion?.toString() ?? '',
                    avion.capacidadAvion.toString(),
                    etiquetaEstado(avion.estadoAvion),
                    avion.aerolineaAvion.nombreComercialAerolinea,
                    avion.aerolineaAvion.codigoIataAerolinea,
                ].join(' '),
            ).includes(texto)
        })
    }, [
        aviones,
        busqueda,
        filtroEstado,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const disponibles = aviones.filter(
            (avion) => avion.estadoAvion === 'DISPONIBLE',
        ).length
        const mantenimiento = aviones.filter(
            (avion) =>
                avion.estadoAvion === 'MANTENIMIENTO',
        ).length
        const fueraServicio = aviones.filter(
            (avion) =>
                avion.estadoAvion === 'FUERA_DE_SERVICIO',
        ).length
        const capacidadTotal = aviones.reduce(
            (total, avion) =>
                total + avion.capacidadAvion,
            0,
        )

        return {
            total: aviones.length,
            disponibles,
            mantenimiento,
            fueraServicio,
            capacidadTotal,
        }
    }, [aviones])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

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
                    : 'No fue posible cargar los aviones.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        setAvionEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaAvion:
                esSuperadmin && aerolineasActivas.length === 1
                    ? String(aerolineasActivas[0].idAerolinea)
                    : '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(avion: Avion) {
        setAvionEdicion(avion)
        setFormulario({
            fkAerolineaAvion: String(
                avion.fkAerolineaAvion,
            ),
            matriculaAvion: avion.matriculaAvion,
            codigoInternoAvion: avion.codigoInternoAvion,
            modeloAvion: avion.modeloAvion,
            fabricanteAvion: avion.fabricanteAvion,
            capacidadAvion: String(avion.capacidadAvion),
            anioFabricacionAvion:
                avion.anioFabricacionAvion === null
                    ? ''
                    : String(avion.anioFabricacionAvion),
            estadoAvion: avion.estadoAvion,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setAvionEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioAvion>(
        campo: K,
        valor: FormularioAvion[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            avionEdicion === null &&
            !formulario.fkAerolineaAvion
        ) {
            return 'Selecciona la aerolínea propietaria del avión.'
        }

        const matricula = formulario.matriculaAvion.trim()

        if (matricula.length < 3 || matricula.length > 20) {
            return 'La matrícula debe contener entre 3 y 20 caracteres.'
        }

        const codigoInterno =
            formulario.codigoInternoAvion.trim()

        if (
            codigoInterno.length < 2 ||
            codigoInterno.length > 20
        ) {
            return 'El código interno debe contener entre 2 y 20 caracteres.'
        }

        const fabricante = formulario.fabricanteAvion.trim()

        if (
            fabricante.length < 2 ||
            fabricante.length > 80
        ) {
            return 'El fabricante debe contener entre 2 y 80 caracteres.'
        }

        const modelo = formulario.modeloAvion.trim()

        if (modelo.length < 2 || modelo.length > 80) {
            return 'El modelo debe contener entre 2 y 80 caracteres.'
        }

        const capacidad = Number(
            formulario.capacidadAvion,
        )

        if (
            !Number.isInteger(capacidad) ||
            capacidad < 1 ||
            capacidad > 1000
        ) {
            return 'La capacidad debe ser un número entero entre 1 y 1000 pasajeros.'
        }

        if (formulario.anioFabricacionAvion.trim()) {
            const anio = Number(
                formulario.anioFabricacionAvion,
            )
            const anioActual = new Date().getFullYear()

            if (
                !Number.isInteger(anio) ||
                anio < 1903 ||
                anio > anioActual
            ) {
                return `El año de fabricación debe ser un número entero entre 1903 y ${anioActual}.`
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

        const esEdicion = avionEdicion !== null
        const matricula =
            formulario.matriculaAvion.trim().toUpperCase()
        const codigoInterno =
            formulario.codigoInternoAvion.trim().toUpperCase()
        const fabricante =
            formulario.fabricanteAvion.trim()
        const modelo = formulario.modeloAvion.trim()
        const capacidad = Number(formulario.capacidadAvion)
        const anioTexto =
            formulario.anioFabricacionAvion.trim()
        const anio = anioTexto ? Number(anioTexto) : null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                matriculaAvion: matricula,
                codigoInternoAvion: codigoInterno,
                fabricanteAvion: fabricante,
                modeloAvion: modelo,
                capacidadAvion: capacidad,
                ...(anio !== null
                    ? { anioFabricacionAvion: anio }
                    : {}),
                estadoAvion: formulario.estadoAvion,
                ...(esSuperadmin
                    ? {
                        fkAerolineaAvion: Number(
                            formulario.fkAerolineaAvion,
                        ),
                    }
                    : {}),
            }
        } else {
            datos = {}

            if (matricula !== avionEdicion.matriculaAvion) {
                datos.matriculaAvion = matricula
            }

            if (
                codigoInterno !==
                avionEdicion.codigoInternoAvion
            ) {
                datos.codigoInternoAvion = codigoInterno
            }

            if (
                fabricante !==
                avionEdicion.fabricanteAvion
            ) {
                datos.fabricanteAvion = fabricante
            }

            if (modelo !== avionEdicion.modeloAvion) {
                datos.modeloAvion = modelo
            }

            if (capacidad !== avionEdicion.capacidadAvion) {
                datos.capacidadAvion = capacidad
            }

            if (
                anio !== avionEdicion.anioFabricacionAvion
            ) {
                datos.anioFabricacionAvion = anio
            }

            if (
                formulario.estadoAvion !==
                avionEdicion.estadoAvion
            ) {
                datos.estadoAvion = formulario.estadoAvion
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
            const avionGuardado = await solicitar<Avion>(
                esEdicion
                    ? `/aviones/${avionEdicion.idAvion}`
                    : '/aviones',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setAviones((lista) =>
                ordenarAviones([
                    ...lista.filter(
                        (avion) =>
                            avion.idAvion !==
                            avionGuardado.idAvion,
                    ),
                    avionGuardado,
                ]),
            )
            setFormularioAbierto(false)
            setAvionEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Avión actualizado correctamente.'
                    : 'Avión registrado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el avión.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!avionEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(
                `/aviones/${avionEliminar.idAvion}`,
                token,
                { method: 'DELETE' },
            )

            setAviones((lista) =>
                lista.filter(
                    (avion) =>
                        avion.idAvion !==
                        avionEliminar.idAvion,
                ),
            )
            setAvionEliminar(null)
            setMensajeExito(
                'Avión eliminado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el avión.',
            )
            setAvionEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="aviones-modulo">
            <header className="aviones-cabecera">
                <div className="aviones-cabecera__texto">
                    <span className="aviones-etiqueta">
                        Flota por aerolínea
                    </span>
                    <h2>Gestión de aviones</h2>
                    <p>
                        Administra matrículas, capacidad y estado
                        operativo de las aeronaves asignadas a cada
                        tenant.
                    </p>
                </div>

                <div className="aviones-cabecera__acciones">
                    <button
                        type="button"
                        className="aviones-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    {puedeGestionar && (
                        <button
                            type="button"
                            className="aviones-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Registrar un nuevo avión'
                                    : 'Se necesita una aerolínea activa'
                            }
                        >
                            <Icono nombre="agregar" />
                            Nuevo avión
                        </button>
                    )}
                </div>
            </header>

            {!puedeGestionar && (
                <div className="aviones-aviso aviones-aviso--consulta">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>Flota en modo consulta</strong>
                        <span>
                            Puedes revisar los aviones de {nombreAerolinea}.
                            El registro, la edición y la eliminación
                            corresponden a los administradores.
                        </span>
                    </div>
                </div>
            )}

            {mensajeExito && (
                <div className="aviones-mensaje aviones-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="aviones-mensaje aviones-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="aviones-resumen">
                <article>
                    <span>Total de aviones</span>
                    <strong>{resumen.total}</strong>
                    <small>
                        {resumen.capacidadTotal.toLocaleString(
                            'es-EC',
                        )}{' '}
                        asientos acumulados
                    </small>
                </article>
                <article>
                    <span>Disponibles</span>
                    <strong>{resumen.disponibles}</strong>
                    <small className="aviones-texto-disponible">
                        Listos para operar
                    </small>
                </article>
                <article>
                    <span>En mantenimiento</span>
                    <strong>{resumen.mantenimiento}</strong>
                    <small>Temporalmente no asignables</small>
                </article>
                <article>
                    <span>Fuera de servicio</span>
                    <strong>{resumen.fueraServicio}</strong>
                    <small>No disponibles para vuelos</small>
                </article>
            </div>

            <section className="aviones-catalogo">
                <div className="aviones-filtros">
                    <label className="aviones-buscador">
                        <Icono nombre="buscar" tamano={20} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por matrícula, código, modelo, aerolínea o capacidad'
                                    : 'Buscar por matrícula, código, modelo o capacidad'
                            }
                        />
                    </label>

                    <label className="aviones-selector-filtro">
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
                            <option value="TODOS">Todos</option>
                            {estadosAvion.map((estado) => (
                                <option
                                    key={estado}
                                    value={estado}
                                >
                                    {etiquetaEstado(estado)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="aviones-selector-filtro">
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

                    <span className="aviones-resultados">
                        {avionesFiltrados.length}{' '}
                        {avionesFiltrados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="aviones-estado-vacio">
                        <span className="aviones-cargador" />
                        <strong>Cargando flota</strong>
                        <p>
                            Consultando las aeronaves registradas.
                        </p>
                    </div>
                ) : avionesFiltrados.length === 0 ? (
                    <div className="aviones-estado-vacio">
                        <span className="aviones-estado-vacio__icono">
                            <Icono nombre="avion" tamano={35} />
                        </span>
                        <strong>
                            {aviones.length === 0
                                ? 'No existen aviones registrados'
                                : 'No hay aviones que coincidan con los filtros'}
                        </strong>
                        <p>
                            {aviones.length === 0
                                ? 'La flota todavía no contiene aeronaves registradas.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {aviones.length === 0 &&
                            puedeAbrirCreacion && (
                                <button
                                    type="button"
                                    className="aviones-boton-principal"
                                    onClick={abrirCreacion}
                                >
                                    <Icono nombre="agregar" />
                                    Registrar el primero
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="aviones-tabla-contenedor">
                        <table className="aviones-tabla">
                            <thead>
                                <tr>
                                    <th>Aeronave</th>
                                    <th>Modelo</th>
                                    <th>Capacidad</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avionesFiltrados.map((avion) => (
                                    <tr key={avion.idAvion}>
                                        <td data-label="Aeronave">
                                            <div className="aviones-identidad">
                                                <span className="aviones-identidad__icono">
                                                    <Icono
                                                        nombre="avion"
                                                        tamano={21}
                                                    />
                                                </span>
                                                <div>
                                                    <strong>
                                                        {
                                                            avion.codigoInternoAvion
                                                        }
                                                    </strong>
                                                    <span>
                                                        {
                                                            avion.matriculaAvion
                                                        }
                                                    </span>
                                                    {esSuperadmin && (
                                                        <small>
                                                            {
                                                                avion.aerolineaAvion
                                                                    .nombreComercialAerolinea
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Modelo">
                                            <div className="aviones-modelo">
                                                <strong>
                                                    {formatearFabricanteModelo(
                                                        avion.fabricanteAvion,
                                                        avion.modeloAvion,
                                                    )}
                                                </strong>
                                                <span>
                                                    {avion.anioFabricacionAvion
                                                        ? `Fabricado en ${avion.anioFabricacionAvion}`
                                                        : 'Año no registrado'}
                                                </span>
                                            </div>
                                        </td>

                                        <td data-label="Capacidad">
                                            <div className="aviones-capacidad">
                                                <Icono
                                                    nombre="capacidad"
                                                    tamano={19}
                                                />
                                                <strong>
                                                    {avion.capacidadAvion.toLocaleString(
                                                        'es-EC',
                                                    )}
                                                </strong>
                                                <span>asientos</span>
                                            </div>
                                        </td>

                                        <td data-label="Estado">
                                            <span
                                                className={`aviones-insignia aviones-insignia--${avion.estadoAvion.toLowerCase()}`}
                                            >
                                                <i />
                                                {etiquetaEstado(
                                                    avion.estadoAvion,
                                                )}
                                            </span>
                                        </td>

                                        <td data-label="Acciones">
                                            <div className="aviones-acciones-fila">
                                                {puedeGestionar && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="aviones-boton-icono"
                                                            onClick={() =>
                                                                abrirEdicion(
                                                                    avion,
                                                                )
                                                            }
                                                            aria-label={`Editar avión ${avion.codigoInternoAvion}`}
                                                            title="Editar avión"
                                                        >
                                                            <Icono
                                                                nombre="editar"
                                                                tamano={19}
                                                            />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="aviones-boton-icono aviones-boton-icono--peligro"
                                                            onClick={() =>
                                                                setAvionEliminar(
                                                                    avion,
                                                                )
                                                            }
                                                            aria-label={`Eliminar avión ${avion.codigoInternoAvion}`}
                                                            title="Eliminar avión"
                                                        >
                                                            <Icono
                                                                nombre="eliminar"
                                                                tamano={19}
                                                            />
                                                        </button>
                                                    </>
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
                    className="aviones-modal-capa"
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
                        className="aviones-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="aviones-formulario-titulo"
                    >
                        <header className="aviones-modal__cabecera">
                            <div className="aviones-modal__titulo">
                                <span className="aviones-modal__icono">
                                    <Icono
                                        nombre="avion"
                                        tamano={24}
                                    />
                                </span>
                                <div>
                                    <span>
                                        {avionEdicion
                                            ? 'Actualización de flota'
                                            : 'Nueva aeronave'}
                                    </span>
                                    <h3 id="aviones-formulario-titulo">
                                        {avionEdicion
                                            ? `Editar ${avionEdicion.codigoInternoAvion}`
                                            : 'Registrar avión'}
                                    </h3>
                                    <p>
                                        Define la identificación,
                                        capacidad y disponibilidad de
                                        la aeronave.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="aviones-modal__cerrar"
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
                            className="aviones-formulario"
                            onSubmit={guardar}
                        >
                            {esSuperadmin &&
                                avionEdicion === null ? (
                                <label className="aviones-campo aviones-campo--completo">
                                    <span>
                                        Aerolínea propietaria
                                    </span>
                                    <select
                                        value={
                                            formulario.fkAerolineaAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAerolineaAvion',
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
                                <div className="aviones-propietario">
                                    <Icono
                                        nombre="aerolinea"
                                        tamano={20}
                                    />
                                    <div>
                                        <span>
                                            Aerolínea propietaria
                                        </span>
                                        <strong>
                                            {avionEdicion
                                                ? avionEdicion
                                                    .aerolineaAvion
                                                    .nombreComercialAerolinea
                                                : nombreAerolinea}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className="aviones-formulario__rejilla">
                                <label className="aviones-campo">
                                    <span>Matrícula</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.matriculaAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'matriculaAvion',
                                                evento.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="HC-AND-002"
                                        minLength={3}
                                        maxLength={20}
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Debe ser única en toda la
                                        plataforma.
                                    </small>
                                </label>

                                <label className="aviones-campo">
                                    <span>Código interno</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.codigoInternoAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'codigoInternoAvion',
                                                evento.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="AND-002"
                                        minLength={2}
                                        maxLength={20}
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Único dentro de la aerolínea.
                                    </small>
                                </label>
                            </div>

                            <div className="aviones-formulario__rejilla">
                                <label className="aviones-campo">
                                    <span>Fabricante</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.fabricanteAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fabricanteAvion',
                                                evento.target.value,
                                            )
                                        }
                                        placeholder="Airbus"
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        disabled={guardando}
                                    />
                                </label>

                                <label className="aviones-campo">
                                    <span>Modelo</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.modeloAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'modeloAvion',
                                                evento.target.value,
                                            )
                                        }
                                        placeholder="A320"
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        disabled={guardando}
                                    />
                                </label>
                            </div>

                            <div className="aviones-formulario__rejilla">
                                <label className="aviones-campo">
                                    <span>
                                        Capacidad de pasajeros
                                    </span>
                                    <input
                                        type="number"
                                        value={
                                            formulario.capacidadAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'capacidadAvion',
                                                evento.target.value,
                                            )
                                        }
                                        min="1"
                                        max="1000"
                                        step="1"
                                        placeholder="180"
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Entre 1 y 1000 asientos.
                                    </small>
                                </label>

                                <label className="aviones-campo">
                                    <span>
                                        Año de fabricación
                                    </span>
                                    <input
                                        type="number"
                                        value={
                                            formulario.anioFabricacionAvion
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'anioFabricacionAvion',
                                                evento.target.value,
                                            )
                                        }
                                        min="1903"
                                        max={new Date().getFullYear()}
                                        step="1"
                                        placeholder="2020"
                                        disabled={guardando}
                                    />
                                    <small>Campo opcional.</small>
                                </label>
                            </div>

                            <label className="aviones-campo aviones-campo--completo">
                                <span>Estado operativo</span>
                                <select
                                    value={formulario.estadoAvion}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'estadoAvion',
                                            evento.target
                                                .value as EstadoAvion,
                                        )
                                    }
                                    disabled={guardando}
                                >
                                    {estadosAvion.map((estado) => (
                                        <option
                                            key={estado}
                                            value={estado}
                                        >
                                            {etiquetaEstado(
                                                estado,
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="aviones-nota-formulario">
                                <Icono
                                    nombre="escudo"
                                    tamano={20}
                                />
                                <span>
                                    El backend verificará la
                                    suscripción vigente, el límite de
                                    aviones del plan y la unicidad de
                                    los identificadores.
                                </span>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="aviones-mensaje aviones-mensaje--error"
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

                            <footer className="aviones-modal__acciones">
                                <button
                                    type="button"
                                    className="aviones-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="aviones-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="aviones-cargador aviones-cargador--boton" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    avionEdicion
                                                        ? 'editar'
                                                        : 'agregar'
                                                }
                                            />
                                            {avionEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar avión'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {avionEliminar && (
                <div
                    className="aviones-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target ===
                            evento.currentTarget
                        ) {
                            setAvionEliminar(null)
                        }
                    }}
                >
                    <section
                        className="aviones-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="aviones-eliminar-titulo"
                    >
                        <span className="aviones-confirmacion__icono">
                            <Icono
                                nombre="eliminar"
                                tamano={26}
                            />
                        </span>
                        <span className="aviones-etiqueta">
                            Eliminar aeronave
                        </span>
                        <h3 id="aviones-eliminar-titulo">
                            ¿Eliminar{' '}
                            {avionEliminar.codigoInternoAvion}?
                        </h3>
                        <p>
                            Esta acción elimina definitivamente
                            el avión. Si tiene vuelos asociados,
                            el backend impedirá la eliminación y
                            deberá cambiarse a fuera de servicio.
                        </p>
                        <div className="aviones-confirmacion__detalle">
                            <strong>
                                {
                                    avionEliminar.matriculaAvion
                                }
                            </strong>
                            <span>
                                {formatearFabricanteModelo(
                                    avionEliminar.fabricanteAvion,
                                    avionEliminar.modeloAvion,
                                )}{' '}
                                ·{' '}
                                {
                                    avionEliminar.capacidadAvion
                                }{' '}
                                asientos
                            </span>
                        </div>
                        <div className="aviones-confirmacion__acciones">
                            <button
                                type="button"
                                className="aviones-boton-secundario"
                                onClick={() =>
                                    setAvionEliminar(null)
                                }
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="aviones-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                <Icono nombre="eliminar" />
                                {eliminando
                                    ? 'Eliminando'
                                    : 'Eliminar avión'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

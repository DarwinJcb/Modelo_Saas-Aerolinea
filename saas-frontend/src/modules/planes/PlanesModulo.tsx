/* saas-frontend/src/modules/planes/PlanesModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './PlanesModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoPlan = 'ACTIVO' | 'INACTIVO'
type FiltroEstado = 'TODOS' | EstadoPlan

type IconoNombre =
    | 'plan'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'usuarios'
    | 'aviones'
    | 'vuelos'
    | 'dinero'
    | 'estado'

interface Plan {
    idPlan: number
    nombrePlan: string
    descripcionPlan: string | null
    precioMensualPlan: number | string
    limiteUsuariosPlan: number
    limiteAvionesPlan: number
    limiteVuelosMensualesPlan: number
    estadoPlan: EstadoPlan
}

interface FormularioPlan {
    nombrePlan: string
    descripcionPlan: string
    precioMensualPlan: string
    limiteUsuariosPlan: string
    limiteAvionesPlan: string
    limiteVuelosMensualesPlan: string
    estadoPlan: EstadoPlan
}

interface PlanesModuloProps {
    token: string
    rolUsuario: string
    onSesionExpirada: () => void
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioPlan = {
    nombrePlan: '',
    descripcionPlan: '',
    precioMensualPlan: '',
    limiteUsuariosPlan: '',
    limiteAvionesPlan: '',
    limiteVuelosMensualesPlan: '',
    estadoPlan: 'ACTIVO',
}

const estadosPlan: EstadoPlan[] = ['ACTIVO', 'INACTIVO']

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
        case 'plan':
            return (
                <svg {...props}>
                    <path d="M7 3h8l4 4v14H7z" />
                    <path d="M15 3v5h5M10 12h6M10 16h5" />
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
        case 'dinero':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M7 12h.01M17 12h.01" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        case 'estado':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
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

function ordenarPlanes(lista: Plan[]): Plan[] {
    return [...lista].sort((a, b) => a.idPlan - b.idPlan)
}

function etiquetaEstado(estado: EstadoPlan): string {
    return estado === 'ACTIVO' ? 'Activo' : 'Inactivo'
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

function precioParaFormulario(
    precio: number | string,
): string {
    const valor = Number(precio)

    return Number.isFinite(valor) ? valor.toFixed(2) : ''
}

export function PlanesModulo({
    token,
    rolUsuario,
    onSesionExpirada,
}: PlanesModuloProps) {
    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const [planes, setPlanes] = useState<Plan[]>([])
    const [cargando, setCargando] = useState(esSuperadmin)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('TODOS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [planEdicion, setPlanEdicion] =
        useState<Plan | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioPlan>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [planEliminar, setPlanEliminar] =
        useState<Plan | null>(null)

    useEffect(() => {
        if (!esSuperadmin) {
            return
        }

        const controlador = new AbortController()
        let activo = true

        solicitar<Plan[]>('/planes', token, {
            signal: controlador.signal,
        })
            .then((respuesta) => {
                if (!activo) {
                    return
                }

                setPlanes(
                    ordenarPlanes(
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
                            : 'No fue posible cargar los planes.',
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

    const planesFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return planes.filter((plan) => {
            if (
                filtroEstado !== 'TODOS' &&
                plan.estadoPlan !== filtroEstado
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    plan.nombrePlan,
                    plan.descripcionPlan ?? '',
                    etiquetaEstado(plan.estadoPlan),
                    String(plan.idPlan),
                    String(plan.limiteUsuariosPlan),
                    String(plan.limiteAvionesPlan),
                    String(plan.limiteVuelosMensualesPlan),
                ].join(' '),
            ).includes(texto)
        })
    }, [planes, busqueda, filtroEstado])

    const resumen = useMemo(() => {
        const activos = planes.filter(
            (plan) => plan.estadoPlan === 'ACTIVO',
        ).length
        const usuarios = planes.reduce(
            (total, plan) => total + plan.limiteUsuariosPlan,
            0,
        )
        const aviones = planes.reduce(
            (total, plan) => total + plan.limiteAvionesPlan,
            0,
        )
        const vuelos = planes.reduce(
            (total, plan) =>
                total + plan.limiteVuelosMensualesPlan,
            0,
        )

        return {
            total: planes.length,
            activos,
            inactivos: planes.length - activos,
            usuarios,
            aviones,
            vuelos,
        }
    }, [planes])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const respuesta = await solicitar<Plan[]>(
                '/planes',
                token,
            )

            setPlanes(
                ordenarPlanes(
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
                    : 'No fue posible cargar los planes.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        setPlanEdicion(null)
        setFormulario(formularioInicial)
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(plan: Plan) {
        setPlanEdicion(plan)
        setFormulario({
            nombrePlan: plan.nombrePlan,
            descripcionPlan: plan.descripcionPlan ?? '',
            precioMensualPlan: precioParaFormulario(
                plan.precioMensualPlan,
            ),
            limiteUsuariosPlan: String(plan.limiteUsuariosPlan),
            limiteAvionesPlan: String(plan.limiteAvionesPlan),
            limiteVuelosMensualesPlan: String(
                plan.limiteVuelosMensualesPlan,
            ),
            estadoPlan: plan.estadoPlan,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setPlanEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioPlan>(
        campo: K,
        valor: FormularioPlan[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function validarFormulario(): string | null {
        const nombre = formulario.nombrePlan.trim()

        if (nombre.length < 3 || nombre.length > 50) {
            return 'El nombre debe contener entre 3 y 50 caracteres.'
        }

        if (formulario.descripcionPlan.trim().length > 500) {
            return 'La descripción no puede superar los 500 caracteres.'
        }

        const precioTexto =
            formulario.precioMensualPlan.trim()

        if (
            !/^\d+(?:\.\d{1,2})?$/.test(precioTexto) ||
            Number(precioTexto) < 0
        ) {
            return 'El precio mensual debe ser un valor positivo con máximo 2 decimales.'
        }

        const limites = [
            {
                valor: formulario.limiteUsuariosPlan,
                nombre: 'El límite de usuarios',
            },
            {
                valor: formulario.limiteAvionesPlan,
                nombre: 'El límite de aviones',
            },
            {
                valor: formulario.limiteVuelosMensualesPlan,
                nombre: 'El límite mensual de vuelos',
            },
        ]

        for (const limite of limites) {
            const valor = Number(limite.valor)

            if (!Number.isInteger(valor) || valor < 1) {
                return `${limite.nombre} debe ser un número entero mayor o igual a 1.`
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

        const nombre = formulario.nombrePlan.trim()
        const descripcion = formulario.descripcionPlan.trim()
        const precio = Number(formulario.precioMensualPlan)
        const limiteUsuarios = Number(
            formulario.limiteUsuariosPlan,
        )
        const limiteAviones = Number(
            formulario.limiteAvionesPlan,
        )
        const limiteVuelos = Number(
            formulario.limiteVuelosMensualesPlan,
        )
        const esEdicion = planEdicion !== null
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                nombrePlan: nombre,
                ...(descripcion
                    ? { descripcionPlan: descripcion }
                    : {}),
                precioMensualPlan: precio,
                limiteUsuariosPlan: limiteUsuarios,
                limiteAvionesPlan: limiteAviones,
                limiteVuelosMensualesPlan: limiteVuelos,
                estadoPlan: formulario.estadoPlan,
            }
        } else {
            datos = {}

            if (nombre !== planEdicion.nombrePlan) {
                datos.nombrePlan = nombre
            }

            if (
                descripcion !==
                (planEdicion.descripcionPlan ?? '')
            ) {
                datos.descripcionPlan = descripcion || null
            }

            if (
                precio !== Number(planEdicion.precioMensualPlan)
            ) {
                datos.precioMensualPlan = precio
            }

            if (
                limiteUsuarios !==
                planEdicion.limiteUsuariosPlan
            ) {
                datos.limiteUsuariosPlan = limiteUsuarios
            }

            if (
                limiteAviones !== planEdicion.limiteAvionesPlan
            ) {
                datos.limiteAvionesPlan = limiteAviones
            }

            if (
                limiteVuelos !==
                planEdicion.limiteVuelosMensualesPlan
            ) {
                datos.limiteVuelosMensualesPlan = limiteVuelos
            }

            if (formulario.estadoPlan !== planEdicion.estadoPlan) {
                datos.estadoPlan = formulario.estadoPlan
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
            const planGuardado = await solicitar<Plan>(
                esEdicion
                    ? `/planes/${planEdicion.idPlan}`
                    : '/planes',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setPlanes((lista) =>
                ordenarPlanes([
                    ...lista.filter(
                        (plan) => plan.idPlan !== planGuardado.idPlan,
                    ),
                    planGuardado,
                ]),
            )
            setFormularioAbierto(false)
            setPlanEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Plan actualizado correctamente.'
                    : 'Plan registrado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el plan.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!planEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar<unknown>(
                `/planes/${planEliminar.idPlan}`,
                token,
                { method: 'DELETE' },
            )

            setPlanes((lista) =>
                lista.filter(
                    (plan) => plan.idPlan !== planEliminar.idPlan,
                ),
            )
            setPlanEliminar(null)
            setMensajeExito('Plan eliminado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el plan.',
            )
            setPlanEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    if (!esSuperadmin) {
        return (
            <section className="planes-modulo">
                <div className="planes-acceso-denegado">
                    <Icono nombre="alerta" tamano={30} />
                    <div>
                        <h2>Acceso restringido</h2>
                        <p>
                            La administración de planes está reservada
                            para usuarios SUPERADMIN.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="planes-modulo">
            <header className="planes-cabecera">
                <div className="planes-cabecera__texto">
                    <span className="planes-etiqueta">
                        Catálogo comercial SaaS
                    </span>
                    <h2>Gestión de Planes</h2>
                    <p>
                        Configura precios y límites operativos para las
                        suscripciones de las aerolíneas.
                    </p>
                </div>

                <div className="planes-cabecera__acciones">
                    <button
                        type="button"
                        className="planes-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        ACTUALIZAR
                    </button>

                    <button
                        type="button"
                        className="planes-boton-principal"
                        onClick={abrirCreacion}
                    >
                        <Icono nombre="agregar" />
                        NUEVO PLAN
                    </button>
                </div>
            </header>

            <div className="planes-aviso">
                <Icono nombre="informacion" tamano={21} />
                <div>
                    <strong>Configuración global</strong>
                    <span>
                        Los planes determinan los límites aplicados a
                        cada tenant mediante su suscripción.
                    </span>
                </div>
            </div>

            {mensajeError && (
                <div
                    className="planes-mensaje planes-mensaje--error"
                    role="alert"
                >
                    <Icono nombre="alerta" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {mensajeExito && (
                <div
                    className="planes-mensaje planes-mensaje--exito"
                    role="status"
                >
                    <Icono nombre="estado" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            <div className="planes-resumen">
                <article>
                    <span className="planes-resumen__icono">
                        <Icono nombre="plan" />
                    </span>
                    <div>
                        <small>Total de planes</small>
                        <strong>{resumen.total}</strong>
                        <span>{resumen.activos} activos</span>
                    </div>
                </article>

                <article>
                    <span className="planes-resumen__icono">
                        <Icono nombre="estado" />
                    </span>
                    <div>
                        <small>Estados</small>
                        <strong>{resumen.activos}</strong>
                        <span>{resumen.inactivos} inactivos</span>
                    </div>
                </article>

                <article>
                    <span className="planes-resumen__icono">
                        <Icono nombre="usuarios" />
                    </span>
                    <div>
                        <small>Límites de usuarios</small>
                        <strong>{resumen.usuarios}</strong>
                        <span>Suma del catálogo</span>
                    </div>
                </article>

                <article>
                    <span className="planes-resumen__icono">
                        <Icono nombre="aviones" />
                    </span>
                    <div>
                        <small>Límites de aviones</small>
                        <strong>{resumen.aviones}</strong>
                        <span>Suma del catálogo</span>
                    </div>
                </article>

                <article>
                    <span className="planes-resumen__icono">
                        <Icono nombre="vuelos" />
                    </span>
                    <div>
                        <small>Vuelos mensuales</small>
                        <strong>{resumen.vuelos}</strong>
                        <span>Suma del catálogo</span>
                    </div>
                </article>
            </div>

            <div className="planes-filtros">
                <label className="planes-buscador">
                    <Icono nombre="buscar" />
                    <input
                        type="search"
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(evento.target.value)
                        }
                        placeholder="Buscar por plan, descripción o límite"
                    />
                </label>

                <label className="planes-filtro">
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
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>
                </label>

                <span className="planes-resultados">
                    {planesFiltrados.length}{' '}
                    {planesFiltrados.length === 1
                        ? 'resultado'
                        : 'resultados'}
                </span>
            </div>

            {cargando ? (
                <div className="planes-estado-central">
                    <span className="planes-spinner" />
                    <strong>Cargando planes</strong>
                    <p>Consultando el catálogo comercial.</p>
                </div>
            ) : planesFiltrados.length === 0 ? (
                <div className="planes-estado-central">
                    <Icono nombre="plan" tamano={36} />
                    <strong>
                        {planes.length === 0
                            ? 'No existen planes registrados'
                            : 'No hay coincidencias'}
                    </strong>
                    <p>
                        {planes.length === 0
                            ? 'Registra el primer plan para configurar suscripciones.'
                            : 'Modifica la búsqueda o el filtro seleccionado.'}
                    </p>
                    {planes.length === 0 && (
                        <button
                            type="button"
                            className="planes-boton-principal"
                            onClick={abrirCreacion}
                        >
                            <Icono nombre="agregar" />
                            Registrar el primero
                        </button>
                    )}
                </div>
            ) : (
                <div className="planes-listado">
                    {planesFiltrados.map((plan) => (
                        <article
                            key={plan.idPlan}
                            className="planes-tarjeta"
                        >
                            <div className="planes-tarjeta__encabezado">
                                <div className="planes-tarjeta__identidad">
                                    <span className="planes-tarjeta__icono">
                                        <Icono nombre="plan" tamano={23} />
                                    </span>
                                    <div>
                                        <span>Plan #{plan.idPlan}</span>
                                        <h3>{plan.nombrePlan}</h3>
                                    </div>
                                </div>

                                <span
                                    className={`planes-estado planes-estado--${plan.estadoPlan.toLowerCase()}`}
                                >
                                    {etiquetaEstado(plan.estadoPlan)}
                                </span>
                            </div>

                            <div className="planes-tarjeta__precio">
                                <Icono nombre="dinero" />
                                <div>
                                    <strong>
                                        {formatearPrecio(
                                            plan.precioMensualPlan,
                                        )}
                                    </strong>
                                    <span>por mes</span>
                                </div>
                            </div>

                            <p className="planes-tarjeta__descripcion">
                                {plan.descripcionPlan ||
                                    'Sin descripción comercial.'}
                            </p>

                            <div className="planes-limites">
                                <div>
                                    <Icono nombre="usuarios" />
                                    <span>Usuarios</span>
                                    <strong>{plan.limiteUsuariosPlan}</strong>
                                </div>
                                <div>
                                    <Icono nombre="aviones" />
                                    <span>Aviones</span>
                                    <strong>{plan.limiteAvionesPlan}</strong>
                                </div>
                                <div>
                                    <Icono nombre="vuelos" />
                                    <span>Vuelos/mes</span>
                                    <strong>
                                        {plan.limiteVuelosMensualesPlan}
                                    </strong>
                                </div>
                            </div>

                            <div className="planes-tarjeta__acciones">
                                <button
                                    type="button"
                                    className="planes-accion planes-accion--editar"
                                    onClick={() => abrirEdicion(plan)}
                                    aria-label={`Editar plan ${plan.nombrePlan}`}
                                    title="Editar plan"
                                >
                                    <Icono nombre="editar" />
                                </button>

                                <button
                                    type="button"
                                    className="planes-accion planes-accion--eliminar"
                                    onClick={() => setPlanEliminar(plan)}
                                    aria-label={`Eliminar plan ${plan.nombrePlan}`}
                                    title="El backend impedirá eliminarlo si tiene suscripciones"
                                >
                                    <Icono nombre="eliminar" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {formularioAbierto && (
                <div
                    className="planes-modal"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            cerrarFormulario()
                        }
                    }}
                >
                    <section
                        className="planes-modal__contenido"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="planes-formulario-titulo"
                    >
                        <header className="planes-modal__cabecera">
                            <div className="planes-modal__titulo">
                                <span className="planes-modal__icono">
                                    <Icono nombre="plan" tamano={24} />
                                </span>

                                <div>
                                    <span>
                                        {planEdicion
                                            ? `Plan #${planEdicion.idPlan}`
                                            : 'Nuevo registro'}
                                    </span>
                                    <h3 id="planes-formulario-titulo">
                                        {planEdicion
                                            ? 'Editar plan'
                                            : 'Registrar plan'}
                                    </h3>
                                    <p>
                                        Configura el precio, estado y límites
                                        operativos del plan.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="planes-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" />
                            </button>
                        </header>

                        <form
                            className="planes-formulario"
                            onSubmit={(evento) => void guardar(evento)}
                        >
                            <label className="planes-campo planes-campo--completo">
                                <span>Nombre del plan</span>
                                <input
                                    type="text"
                                    value={formulario.nombrePlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'nombrePlan',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={50}
                                    placeholder="Ej. Empresarial"
                                    required
                                    disabled={guardando}
                                />
                                <small>Entre 3 y 50 caracteres.</small>
                            </label>

                            <label className="planes-campo planes-campo--completo">
                                <span>Descripción</span>
                                <textarea
                                    value={formulario.descripcionPlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'descripcionPlan',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Características comerciales del plan"
                                    disabled={guardando}
                                />
                                <small>
                                    Opcional ·{' '}
                                    {formulario.descripcionPlan.length}/500
                                </small>
                            </label>

                            <label className="planes-campo">
                                <span>Precio mensual (USD)</span>
                                <input
                                    type="number"
                                    value={formulario.precioMensualPlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'precioMensualPlan',
                                            evento.target.value,
                                        )
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="49.90"
                                    required
                                    disabled={guardando}
                                />
                            </label>

                            <label className="planes-campo">
                                <span>Estado</span>
                                <select
                                    value={formulario.estadoPlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'estadoPlan',
                                            evento.target.value as EstadoPlan,
                                        )
                                    }
                                    disabled={guardando}
                                >
                                    {estadosPlan.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {etiquetaEstado(estado)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="planes-campo">
                                <span>Límite de usuarios</span>
                                <input
                                    type="number"
                                    value={formulario.limiteUsuariosPlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'limiteUsuariosPlan',
                                            evento.target.value,
                                        )
                                    }
                                    min="1"
                                    step="1"
                                    placeholder="10"
                                    required
                                    disabled={guardando}
                                />
                            </label>

                            <label className="planes-campo">
                                <span>Límite de aviones</span>
                                <input
                                    type="number"
                                    value={formulario.limiteAvionesPlan}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'limiteAvionesPlan',
                                            evento.target.value,
                                        )
                                    }
                                    min="1"
                                    step="1"
                                    placeholder="5"
                                    required
                                    disabled={guardando}
                                />
                            </label>

                            <label className="planes-campo planes-campo--completo">
                                <span>Límite mensual de vuelos</span>
                                <input
                                    type="number"
                                    value={
                                        formulario.limiteVuelosMensualesPlan
                                    }
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            'limiteVuelosMensualesPlan',
                                            evento.target.value,
                                        )
                                    }
                                    min="1"
                                    step="1"
                                    placeholder="100"
                                    required
                                    disabled={guardando}
                                />
                            </label>

                            <div className="planes-formulario__nota">
                                <Icono nombre="informacion" />
                                <span>
                                    Los límites se aplican a las aerolíneas que
                                    tengan una suscripción asociada a este plan.
                                </span>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="planes-formulario__error"
                                    role="alert"
                                >
                                    <Icono nombre="alerta" />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <footer className="planes-formulario__acciones">
                                <button
                                    type="button"
                                    className="planes-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="planes-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="planes-spinner planes-spinner--pequeno" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    planEdicion ? 'editar' : 'agregar'
                                                }
                                            />
                                            {planEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar plan'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {planEliminar && (
                <div
                    className="planes-modal planes-modal--confirmacion"
                    role="presentation"
                >
                    <section
                        className="planes-confirmacion"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="planes-eliminar-titulo"
                    >
                        <span className="planes-confirmacion__icono">
                            <Icono nombre="alerta" tamano={28} />
                        </span>

                        <h3 id="planes-eliminar-titulo">
                            Eliminar plan
                        </h3>

                        <p>
                            Se intentará eliminar{' '}
                            <strong>{planEliminar.nombrePlan}</strong>.
                            Esta acción solo será permitida si el plan no
                            tiene suscripciones asociadas.
                        </p>

                        <div className="planes-confirmacion__acciones">
                            <button
                                type="button"
                                className="planes-boton-secundario"
                                onClick={() => setPlanEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="planes-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <span className="planes-spinner planes-spinner--pequeno" />
                                        Eliminando
                                    </>
                                ) : (
                                    <>
                                        <Icono nombre="eliminar" />
                                        Eliminar plan
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

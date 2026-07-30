/* saas-frontend/src/modules/usuarios/UsuariosModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './UsuariosModulo.css'

const API_URL = 'http://localhost:3000/api'

type RolGestion =
    | 'SUPERADMIN'
    | 'ADMIN_AEROLINEA'
    | 'EMPLEADO'

type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'
type FiltroRol = 'TODOS' | RolGestion
type FiltroEstado = 'TODOS' | EstadoUsuario

type IconoNombre =
    | 'usuario'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'aerolinea'
    | 'correo'
    | 'rol'
    | 'estado'
    | 'reloj'
    | 'candado'
    | 'ojo'
    | 'ojo-cerrado'
    | 'escudo'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    correoAerolinea?: string
    codigoIataAerolinea?: string
    estadoAerolinea: string
}

interface Usuario {
    idUsuario: number
    fkAerolineaUsuario: number | null
    nombresUsuario: string
    apellidosUsuario: string
    correoUsuario: string
    rolUsuario: RolGestion
    estadoUsuario: EstadoUsuario
    ultimoAccesoUsuario: string | null
    fechaCreacionUsuario: string
    fechaActualizacionUsuario: string
    aerolineaUsuario: AerolineaResumen | null
}

interface FormularioUsuario {
    fkAerolineaUsuario: string
    nombresUsuario: string
    apellidosUsuario: string
    correoUsuario: string
    contrasenaUsuario: string
    confirmarContrasena: string
    rolUsuario: RolGestion
    estadoUsuario: EstadoUsuario
}

interface UsuariosModuloProps {
    token: string
    rolUsuario: string
    idUsuarioActual: number
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    usuarios: Usuario[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioUsuario = {
    fkAerolineaUsuario: '',
    nombresUsuario: '',
    apellidosUsuario: '',
    correoUsuario: '',
    contrasenaUsuario: '',
    confirmarContrasena: '',
    rolUsuario: 'EMPLEADO',
    estadoUsuario: 'ACTIVO',
}

const rolesUsuario: RolGestion[] = [
    'SUPERADMIN',
    'ADMIN_AEROLINEA',
    'EMPLEADO',
]

const estadosUsuario: EstadoUsuario[] = [
    'ACTIVO',
    'INACTIVO',
    'BLOQUEADO',
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
        case 'usuario':
            return (
                <svg {...props}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" />
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
        case 'correo':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m4 7 8 6 8-6" />
                </svg>
            )
        case 'rol':
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
                    <path d="M9 12h6M12 9v6" />
                </svg>
            )
        case 'estado':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8.5 12 2.3 2.3 4.8-5" />
                </svg>
            )
        case 'reloj':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            )
        case 'candado':
            return (
                <svg {...props}>
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                </svg>
            )
        case 'ojo':
            return (
                <svg {...props}>
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6" />
                    <circle cx="12" cy="12" r="2.5" />
                </svg>
            )
        case 'ojo-cerrado':
            return (
                <svg {...props}>
                    <path d="M3 3l18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.7M6.2 6.2A16 16 0 0 0 2.5 12s3.5 6 9.5 6a10.5 10.5 0 0 0 3.2-.5" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
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

function nombreCompleto(usuario: Usuario): string {
    return `${usuario.nombresUsuario} ${usuario.apellidosUsuario}`.trim()
}

function obtenerIniciales(usuario: Usuario): string {
    const primera = usuario.nombresUsuario.trim().charAt(0)
    const segunda = usuario.apellidosUsuario.trim().charAt(0)

    return `${primera}${segunda || primera}`.toUpperCase()
}

function etiquetaRol(rol: RolGestion): string {
    switch (rol) {
        case 'SUPERADMIN':
            return 'Superadministrador'
        case 'ADMIN_AEROLINEA':
            return 'Administrador de aerolínea'
        case 'EMPLEADO':
            return 'Empleado'
    }
}

function etiquetaEstado(estado: EstadoUsuario): string {
    switch (estado) {
        case 'ACTIVO':
            return 'Activo'
        case 'INACTIVO':
            return 'Inactivo'
        case 'BLOQUEADO':
            return 'Bloqueado'
    }
}

function formatearFechaHora(fechaIso: string | null): string {
    if (!fechaIso) {
        return 'Nunca'
    }

    const fecha = new Date(fechaIso)

    if (Number.isNaN(fecha.getTime())) {
        return 'Fecha no válida'
    }

    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(fecha)
}

function ordenarUsuarios(lista: Usuario[]): Usuario[] {
    return [...lista].sort((a, b) => {
        if (a.rolUsuario === 'SUPERADMIN' && b.rolUsuario !== 'SUPERADMIN') {
            return -1
        }

        if (a.rolUsuario !== 'SUPERADMIN' && b.rolUsuario === 'SUPERADMIN') {
            return 1
        }

        const aerolineaA =
            a.aerolineaUsuario?.nombreComercialAerolinea ?? ''
        const aerolineaB =
            b.aerolineaUsuario?.nombreComercialAerolinea ?? ''
        const comparacionAerolinea = aerolineaA.localeCompare(
            aerolineaB,
            'es',
        )

        if (comparacionAerolinea !== 0) {
            return comparacionAerolinea
        }

        const comparacionApellidos =
            a.apellidosUsuario.localeCompare(
                b.apellidosUsuario,
                'es',
            )

        if (comparacionApellidos !== 0) {
            return comparacionApellidos
        }

        return a.nombresUsuario.localeCompare(
            b.nombresUsuario,
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

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudUsuarios = solicitar<Usuario[]>(
        '/usuarios',
        token,
        { signal },
    )

    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [usuarios, aerolineas] = await Promise.all([
        solicitudUsuarios,
        solicitudAerolineas,
    ])

    return {
        usuarios: ordenarUsuarios(
            Array.isArray(usuarios) ? usuarios : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function UsuariosModulo({
    token,
    rolUsuario,
    idUsuarioActual,
    nombreAerolinea,
    onSesionExpirada,
}: UsuariosModuloProps) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [aerolineas, setAerolineas] = useState<
        AerolineaResumen[]
    >([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroRol, setFiltroRol] =
        useState<FiltroRol>('TODOS')
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('TODOS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [usuarioEdicion, setUsuarioEdicion] =
        useState<Usuario | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioUsuario>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [usuarioEliminar, setUsuarioEliminar] =
        useState<Usuario | null>(null)
    const [mostrarContrasena, setMostrarContrasena] =
        useState(false)
    const [mostrarConfirmacion, setMostrarConfirmacion] =
        useState(false)

    const esSuperadmin = rolUsuario === 'SUPERADMIN'
    const esAdministrador = rolUsuario === 'ADMIN_AEROLINEA'

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

                setUsuarios(datos.usuarios)
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
                            : 'No fue posible cargar los usuarios.',
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

    const rolesFormulario = useMemo(
        () =>
            esSuperadmin
                ? rolesUsuario
                : rolesUsuario.filter(
                    (rol) => rol !== 'SUPERADMIN',
                ),
        [esSuperadmin],
    )

    const aerolineasFormulario = useMemo(() => {
        if (
            !usuarioEdicion?.aerolineaUsuario ||
            usuarioEdicion.aerolineaUsuario.estadoAerolinea ===
            'ACTIVA'
        ) {
            return aerolineasActivas
        }

        return ordenarAerolineas([
            ...aerolineasActivas,
            usuarioEdicion.aerolineaUsuario,
        ])
    }, [aerolineasActivas, usuarioEdicion])

    const usuariosFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return usuarios.filter((usuario) => {
            if (
                filtroRol !== 'TODOS' &&
                usuario.rolUsuario !== filtroRol
            ) {
                return false
            }

            if (
                filtroEstado !== 'TODOS' &&
                usuario.estadoUsuario !== filtroEstado
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                usuario.fkAerolineaUsuario !==
                Number(filtroAerolinea)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    nombreCompleto(usuario),
                    usuario.correoUsuario,
                    etiquetaRol(usuario.rolUsuario),
                    etiquetaEstado(usuario.estadoUsuario),
                    usuario.aerolineaUsuario
                        ?.nombreComercialAerolinea ?? '',
                    usuario.aerolineaUsuario?.correoAerolinea ?? '',
                    String(usuario.idUsuario),
                ].join(' '),
            ).includes(texto)
        })
    }, [
        usuarios,
        busqueda,
        filtroRol,
        filtroEstado,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const activos = usuarios.filter(
            (usuario) => usuario.estadoUsuario === 'ACTIVO',
        ).length
        const administradores = usuarios.filter(
            (usuario) =>
                usuario.rolUsuario === 'ADMIN_AEROLINEA',
        ).length
        const empleados = usuarios.filter(
            (usuario) => usuario.rolUsuario === 'EMPLEADO',
        ).length
        const restringidos = usuarios.filter(
            (usuario) => usuario.estadoUsuario !== 'ACTIVO',
        ).length

        return {
            total: usuarios.length,
            activos,
            administradores,
            empleados,
            restringidos,
        }
    }, [usuarios])

    const rolRequiereAerolinea =
        formulario.rolUsuario !== 'SUPERADMIN'

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

            setUsuarios(datos.usuarios)
            setAerolineas(datos.aerolineas)
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible cargar los usuarios.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        setUsuarioEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaUsuario:
                esSuperadmin && aerolineasActivas.length === 1
                    ? String(aerolineasActivas[0].idAerolinea)
                    : '',
        })
        setErrorFormulario('')
        setMostrarContrasena(false)
        setMostrarConfirmacion(false)
        setFormularioAbierto(true)
    }

    function abrirEdicion(usuario: Usuario) {
        setUsuarioEdicion(usuario)
        setFormulario({
            fkAerolineaUsuario:
                usuario.fkAerolineaUsuario === null
                    ? ''
                    : String(usuario.fkAerolineaUsuario),
            nombresUsuario: usuario.nombresUsuario,
            apellidosUsuario: usuario.apellidosUsuario,
            correoUsuario: usuario.correoUsuario,
            contrasenaUsuario: '',
            confirmarContrasena: '',
            rolUsuario: usuario.rolUsuario,
            estadoUsuario: usuario.estadoUsuario,
        })
        setErrorFormulario('')
        setMostrarContrasena(false)
        setMostrarConfirmacion(false)
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setUsuarioEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioUsuario>(
        campo: K,
        valor: FormularioUsuario[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
            ...(campo === 'rolUsuario' && valor === 'SUPERADMIN'
                ? { fkAerolineaUsuario: '' }
                : {}),
        }))
    }

    function validarContrasena(
        contrasena: string,
    ): string | null {
        if (contrasena.length < 8 || contrasena.length > 100) {
            return 'La contraseña debe contener entre 8 y 100 caracteres.'
        }

        if (!/[A-Z]/.test(contrasena)) {
            return 'La contraseña debe contener una letra mayúscula.'
        }

        if (!/[a-z]/.test(contrasena)) {
            return 'La contraseña debe contener una letra minúscula.'
        }

        if (!/[0-9]/.test(contrasena)) {
            return 'La contraseña debe contener un número.'
        }

        return null
    }

    function validarFormulario(): string | null {
        if (
            formulario.nombresUsuario.trim().length < 2 ||
            formulario.nombresUsuario.trim().length > 80
        ) {
            return 'Los nombres deben contener entre 2 y 80 caracteres.'
        }

        if (
            formulario.apellidosUsuario.trim().length < 2 ||
            formulario.apellidosUsuario.trim().length > 80
        ) {
            return 'Los apellidos deben contener entre 2 y 80 caracteres.'
        }

        const correo = formulario.correoUsuario
            .trim()
            .toLowerCase()

        if (
            correo.length > 150 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
        ) {
            return 'Ingresa un correo electrónico válido de máximo 150 caracteres.'
        }

        if (
            esSuperadmin &&
            rolRequiereAerolinea &&
            !formulario.fkAerolineaUsuario
        ) {
            return 'Selecciona la aerolínea a la que pertenecerá el usuario.'
        }

        if (
            !esSuperadmin &&
            formulario.rolUsuario === 'SUPERADMIN'
        ) {
            return 'Un administrador de aerolínea no puede asignar el rol SUPERADMIN.'
        }

        const esCreacion = usuarioEdicion === null
        const contrasena = formulario.contrasenaUsuario

        if (esCreacion && !contrasena) {
            return 'La contraseña es obligatoria al registrar un usuario.'
        }

        if (!contrasena && formulario.confirmarContrasena) {
            return 'Ingresa la nueva contraseña antes de confirmarla.'
        }

        if (contrasena) {
            const errorContrasena = validarContrasena(contrasena)

            if (errorContrasena) {
                return errorContrasena
            }

            if (contrasena !== formulario.confirmarContrasena) {
                return 'La confirmación de la contraseña no coincide.'
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

        const esEdicion = usuarioEdicion !== null
        const nombres = formulario.nombresUsuario.trim()
        const apellidos = formulario.apellidosUsuario.trim()
        const correo = formulario.correoUsuario
            .trim()
            .toLowerCase()
        const contrasena = formulario.contrasenaUsuario
        let datos: Record<string, unknown>

        if (!esEdicion) {
            datos = {
                nombresUsuario: nombres,
                apellidosUsuario: apellidos,
                correoUsuario: correo,
                contrasenaUsuario: contrasena,
                rolUsuario: formulario.rolUsuario,
                estadoUsuario: formulario.estadoUsuario,
                ...(esSuperadmin && rolRequiereAerolinea
                    ? {
                        fkAerolineaUsuario: Number(
                            formulario.fkAerolineaUsuario,
                        ),
                    }
                    : {}),
            }
        } else {
            datos = {}

            if (nombres !== usuarioEdicion.nombresUsuario) {
                datos.nombresUsuario = nombres
            }

            if (apellidos !== usuarioEdicion.apellidosUsuario) {
                datos.apellidosUsuario = apellidos
            }

            if (correo !== usuarioEdicion.correoUsuario) {
                datos.correoUsuario = correo
            }

            if (formulario.rolUsuario !== usuarioEdicion.rolUsuario) {
                datos.rolUsuario = formulario.rolUsuario
            }

            if (
                formulario.estadoUsuario !==
                usuarioEdicion.estadoUsuario
            ) {
                datos.estadoUsuario = formulario.estadoUsuario
            }

            if (contrasena) {
                datos.contrasenaUsuario = contrasena
            }

            if (esSuperadmin && rolRequiereAerolinea) {
                const idAerolinea = Number(
                    formulario.fkAerolineaUsuario,
                )

                if (
                    idAerolinea !==
                    usuarioEdicion.fkAerolineaUsuario
                ) {
                    datos.fkAerolineaUsuario = idAerolinea
                }
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
            const usuarioGuardado = await solicitar<Usuario>(
                esEdicion
                    ? `/usuarios/${usuarioEdicion.idUsuario}`
                    : '/usuarios',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setUsuarios((lista) =>
                ordenarUsuarios([
                    ...lista.filter(
                        (usuario) =>
                            usuario.idUsuario !==
                            usuarioGuardado.idUsuario,
                    ),
                    usuarioGuardado,
                ]),
            )
            setFormularioAbierto(false)
            setUsuarioEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Usuario actualizado correctamente.'
                    : 'Usuario registrado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el usuario.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!usuarioEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(
                `/usuarios/${usuarioEliminar.idUsuario}`,
                token,
                { method: 'DELETE' },
            )

            setUsuarios((lista) =>
                lista.filter(
                    (usuario) =>
                        usuario.idUsuario !== usuarioEliminar.idUsuario,
                ),
            )
            setUsuarioEliminar(null)
            setMensajeExito('Usuario eliminado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el usuario.',
            )
            setUsuarioEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="usuarios-modulo">
            <header className="usuarios-cabecera">
                <div className="usuarios-cabecera__texto">
                    <span className="usuarios-etiqueta">
                        Accesos y permisos
                    </span>
                    <h2>Gestión de Usuarios</h2>
                    <p>
                        Administra cuentas, roles, estados y pertenencia a
                        aerolíneas sin exponer las contraseñas almacenadas.
                    </p>
                </div>

                <div className="usuarios-cabecera__acciones">
                    <button
                        type="button"
                        className="usuarios-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    <button
                        type="button"
                        className="usuarios-boton-principal"
                        onClick={abrirCreacion}
                    >
                        <Icono nombre="agregar" />
                        Nuevo usuario
                    </button>
                </div>
            </header>

            {esAdministrador && (
                <div className="usuarios-aviso usuarios-aviso--alcance">
                    <Icono nombre="escudo" tamano={21} />
                    <div>
                        <strong>Administración limitada al tenant</strong>
                        <span>
                            Solo puedes consultar y gestionar usuarios de{' '}
                            {nombreAerolinea}. No puedes crear ni asignar
                            cuentas SUPERADMIN.
                        </span>
                    </div>
                </div>
            )}

            {mensajeExito && (
                <div className="usuarios-mensaje usuarios-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="usuarios-mensaje usuarios-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="usuarios-resumen">
                <article>
                    <span>Total de usuarios</span>
                    <strong>{resumen.total}</strong>
                    <small>Cuentas del alcance actual</small>
                </article>
                <article>
                    <span>Activos</span>
                    <strong>{resumen.activos}</strong>
                    <small className="usuarios-texto-activo">
                        Acceso habilitado
                    </small>
                </article>
                <article>
                    <span>Administradores</span>
                    <strong>{resumen.administradores}</strong>
                    <small>Administradores de aerolínea</small>
                </article>
                <article>
                    <span>Empleados</span>
                    <strong>{resumen.empleados}</strong>
                    <small>Operación diaria</small>
                </article>
                <article>
                    <span>Restringidos</span>
                    <strong>{resumen.restringidos}</strong>
                    <small>Inactivos o bloqueados</small>
                </article>
            </div>

            <div className="usuarios-contenedor-tabla">
                <div className="usuarios-herramientas">
                    <label className="usuarios-buscador">
                        <Icono nombre="buscar" tamano={19} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por usuario, correo, rol o aerolínea'
                                    : 'Buscar por usuario, correo o rol'
                            }
                        />
                    </label>

                    <label className="usuarios-selector-filtro">
                        <span>Rol</span>
                        <select
                            value={filtroRol}
                            onChange={(evento) =>
                                setFiltroRol(
                                    evento.target.value as FiltroRol,
                                )
                            }
                        >
                            <option value="TODOS">Todos</option>
                            {rolesFormulario.map((rol) => (
                                <option key={rol} value={rol}>
                                    {etiquetaRol(rol)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="usuarios-selector-filtro">
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
                            {estadosUsuario.map((estado) => (
                                <option key={estado} value={estado}>
                                    {etiquetaEstado(estado)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="usuarios-selector-filtro">
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

                    <span className="usuarios-resultados">
                        {usuariosFiltrados.length}{' '}
                        {usuariosFiltrados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="usuarios-estado-vacio">
                        <span className="usuarios-cargador" />
                        <strong>Cargando usuarios</strong>
                        <p>Consultando las cuentas autorizadas.</p>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="usuarios-estado-vacio">
                        <span className="usuarios-estado-vacio__icono">
                            <Icono nombre="usuario" tamano={36} />
                        </span>
                        <strong>
                            {usuarios.length === 0
                                ? 'No existen usuarios registrados'
                                : 'No hay usuarios que coincidan con los filtros'}
                        </strong>
                        <p>
                            {usuarios.length === 0
                                ? 'Registra la primera cuenta para comenzar la administración de accesos.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {usuarios.length === 0 && (
                            <button
                                type="button"
                                className="usuarios-boton-principal"
                                onClick={abrirCreacion}
                            >
                                <Icono nombre="agregar" />
                                Registrar el primero
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="usuarios-tabla-scroll">
                        <table className="usuarios-tabla">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol y estado</th>
                                    {esSuperadmin && <th>Aerolínea</th>}
                                    <th>Actividad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map((usuario) => {
                                    const esCuentaActual =
                                        usuario.idUsuario === idUsuarioActual

                                    return (
                                        <tr key={usuario.idUsuario}>
                                            <td data-label="Usuario">
                                                <div className="usuarios-identidad">
                                                    <span className="usuarios-avatar">
                                                        {obtenerIniciales(usuario)}
                                                    </span>
                                                    <div>
                                                        <strong>{nombreCompleto(usuario)}</strong>
                                                        <span>{usuario.correoUsuario}</span>
                                                        <small>ID #{usuario.idUsuario}</small>
                                                    </div>
                                                    {esCuentaActual && (
                                                        <span className="usuarios-insignia-propia">
                                                            Tu cuenta
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td data-label="Rol y estado">
                                                <div className="usuarios-rol-estado">
                                                    <span
                                                        className={`usuarios-insignia-rol usuarios-insignia-rol--${usuario.rolUsuario.toLowerCase()}`}
                                                    >
                                                        {etiquetaRol(usuario.rolUsuario)}
                                                    </span>
                                                    <span
                                                        className={`usuarios-insignia-estado usuarios-insignia-estado--${usuario.estadoUsuario.toLowerCase()}`}
                                                    >
                                                        {etiquetaEstado(
                                                            usuario.estadoUsuario,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {esSuperadmin && (
                                                <td data-label="Aerolínea">
                                                    {usuario.aerolineaUsuario ? (
                                                        <div className="usuarios-aerolinea">
                                                            <Icono
                                                                nombre="aerolinea"
                                                                tamano={18}
                                                            />
                                                            <div>
                                                                <strong>
                                                                    {
                                                                        usuario.aerolineaUsuario
                                                                            .nombreComercialAerolinea
                                                                    }
                                                                </strong>
                                                                <small>
                                                                    {usuario.aerolineaUsuario
                                                                        .estadoAerolinea === 'ACTIVA'
                                                                        ? 'Tenant activo'
                                                                        : usuario.aerolineaUsuario
                                                                            .estadoAerolinea}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="usuarios-sin-tenant">
                                                            Acceso global
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            <td data-label="Actividad">
                                                <div className="usuarios-actividad">
                                                    <Icono nombre="reloj" tamano={17} />
                                                    <div>
                                                        <span>Último acceso</span>
                                                        <strong>
                                                            {formatearFechaHora(
                                                                usuario.ultimoAccesoUsuario,
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </td>

                                            <td data-label="Acciones">
                                                <div className="usuarios-acciones-fila">
                                                    <button
                                                        type="button"
                                                        className="usuarios-boton-icono"
                                                        onClick={() => abrirEdicion(usuario)}
                                                        aria-label={`Editar a ${nombreCompleto(usuario)}`}
                                                        title="Editar usuario"
                                                    >
                                                        <Icono nombre="editar" tamano={18} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="usuarios-boton-icono usuarios-boton-icono--peligro"
                                                        onClick={() =>
                                                            setUsuarioEliminar(usuario)
                                                        }
                                                        aria-label={`Eliminar a ${nombreCompleto(usuario)}`}
                                                        title={
                                                            esCuentaActual
                                                                ? 'No puedes eliminar tu cuenta activa'
                                                                : 'Eliminar usuario'
                                                        }
                                                        disabled={esCuentaActual}
                                                    >
                                                        <Icono
                                                            nombre="eliminar"
                                                            tamano={18}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {formularioAbierto && (
                <div className="usuarios-modal-capa">
                    <section
                        className="usuarios-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-formulario-usuario"
                    >
                        <header className="usuarios-modal__cabecera">
                            <div className="usuarios-modal__titulo">
                                <span className="usuarios-modal__icono">
                                    <Icono nombre="usuario" tamano={24} />
                                </span>
                                <div>
                                    <span>
                                        {usuarioEdicion
                                            ? 'Actualizar acceso'
                                            : 'Registrar acceso'}
                                    </span>
                                    <h3 id="titulo-formulario-usuario">
                                        {usuarioEdicion
                                            ? 'Editar usuario'
                                            : 'Nuevo usuario'}
                                    </h3>
                                    <p>
                                        Define la identidad, el rol y el estado de la
                                        cuenta.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="usuarios-modal__cerrar"
                                onClick={cerrarFormulario}
                                aria-label="Cerrar formulario"
                                disabled={guardando}
                            >
                                <Icono nombre="cerrar" />
                            </button>
                        </header>

                        <form
                            className="usuarios-formulario"
                            onSubmit={guardar}
                        >
                            {errorFormulario && (
                                <div className="usuarios-mensaje usuarios-mensaje--error">
                                    <Icono nombre="alerta" tamano={19} />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <div className="usuarios-formulario__rejilla">
                                <label className="usuarios-campo">
                                    <span>Rol *</span>
                                    <select
                                        value={formulario.rolUsuario}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'rolUsuario',
                                                evento.target.value as RolGestion,
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        {rolesFormulario.map((rol) => (
                                            <option key={rol} value={rol}>
                                                {etiquetaRol(rol)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="usuarios-campo">
                                    <span>Estado *</span>
                                    <select
                                        value={formulario.estadoUsuario}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'estadoUsuario',
                                                evento.target.value as EstadoUsuario,
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        {estadosUsuario.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {etiquetaEstado(estado)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {esSuperadmin && rolRequiereAerolinea && (
                                    <label className="usuarios-campo usuarios-campo--completo">
                                        <span>Aerolínea propietaria *</span>
                                        <select
                                            value={formulario.fkAerolineaUsuario}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'fkAerolineaUsuario',
                                                    evento.target.value,
                                                )
                                            }
                                            required
                                            disabled={guardando}
                                        >
                                            <option value="">
                                                Selecciona una aerolínea activa
                                            </option>
                                            {aerolineasFormulario.map((aerolinea) => (
                                                <option
                                                    key={aerolinea.idAerolinea}
                                                    value={aerolinea.idAerolinea}
                                                >
                                                    {aerolinea.nombreComercialAerolinea}
                                                    {aerolinea.estadoAerolinea !== 'ACTIVA'
                                                        ? ' (no activa)'
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {usuarioEdicion && (
                                            <small>
                                                El backend impedirá trasladar la cuenta si
                                                tiene reservas registradas.
                                            </small>
                                        )}
                                    </label>
                                )}

                                {esSuperadmin && !rolRequiereAerolinea && (
                                    <div className="usuarios-campo usuarios-campo--completo usuarios-campo-informativo">
                                        <Icono nombre="informacion" tamano={19} />
                                        <span>
                                            Una cuenta SUPERADMIN tiene alcance global y no
                                            pertenece a una aerolínea.
                                        </span>
                                    </div>
                                )}

                                <label className="usuarios-campo">
                                    <span>Nombres *</span>
                                    <input
                                        type="text"
                                        value={formulario.nombresUsuario}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'nombresUsuario',
                                                evento.target.value,
                                            )
                                        }
                                        minLength={2}
                                        maxLength={80}
                                        autoComplete="off"
                                        disabled={guardando}
                                        required
                                    />
                                </label>

                                <label className="usuarios-campo">
                                    <span>Apellidos *</span>
                                    <input
                                        type="text"
                                        value={formulario.apellidosUsuario}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'apellidosUsuario',
                                                evento.target.value,
                                            )
                                        }
                                        minLength={2}
                                        maxLength={80}
                                        autoComplete="off"
                                        disabled={guardando}
                                        required
                                    />
                                </label>

                                <label className="usuarios-campo usuarios-campo--completo">
                                    <span>Correo electrónico *</span>
                                    <div className="usuarios-campo-con-icono">
                                        <Icono nombre="correo" tamano={19} />
                                        <input
                                            type="email"
                                            value={formulario.correoUsuario}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'correoUsuario',
                                                    evento.target.value,
                                                )
                                            }
                                            maxLength={150}
                                            autoComplete="off"
                                            disabled={guardando}
                                            required
                                        />
                                    </div>
                                    <small>
                                        El correo debe ser único en toda la plataforma.
                                    </small>
                                </label>

                                <label className="usuarios-campo">
                                    <span>
                                        Contraseña {usuarioEdicion ? '(opcional)' : '*'}
                                    </span>
                                    <div className="usuarios-campo-con-icono">
                                        <Icono nombre="candado" tamano={19} />
                                        <input
                                            type={mostrarContrasena ? 'text' : 'password'}
                                            value={formulario.contrasenaUsuario}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'contrasenaUsuario',
                                                    evento.target.value,
                                                )
                                            }
                                            minLength={8}
                                            maxLength={100}
                                            autoComplete="new-password"
                                            disabled={guardando}
                                            required={!usuarioEdicion}
                                        />
                                        <button
                                            type="button"
                                            className="usuarios-boton-visibilidad"
                                            onClick={() =>
                                                setMostrarContrasena(
                                                    (estadoActual) => !estadoActual,
                                                )
                                            }
                                            aria-label={
                                                mostrarContrasena
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                        >
                                            <Icono
                                                nombre={
                                                    mostrarContrasena
                                                        ? 'ojo-cerrado'
                                                        : 'ojo'
                                                }
                                                tamano={19}
                                            />
                                        </button>
                                    </div>
                                </label>

                                <label className="usuarios-campo">
                                    <span>
                                        Confirmar contraseña{' '}
                                        {usuarioEdicion ? '(opcional)' : '*'}
                                    </span>
                                    <div className="usuarios-campo-con-icono">
                                        <Icono nombre="candado" tamano={19} />
                                        <input
                                            type={
                                                mostrarConfirmacion ? 'text' : 'password'
                                            }
                                            value={formulario.confirmarContrasena}
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'confirmarContrasena',
                                                    evento.target.value,
                                                )
                                            }
                                            minLength={8}
                                            maxLength={100}
                                            autoComplete="new-password"
                                            disabled={guardando}
                                            required={
                                                !usuarioEdicion ||
                                                Boolean(formulario.contrasenaUsuario)
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="usuarios-boton-visibilidad"
                                            onClick={() =>
                                                setMostrarConfirmacion(
                                                    (estadoActual) => !estadoActual,
                                                )
                                            }
                                            aria-label={
                                                mostrarConfirmacion
                                                    ? 'Ocultar confirmación'
                                                    : 'Mostrar confirmación'
                                            }
                                        >
                                            <Icono
                                                nombre={
                                                    mostrarConfirmacion
                                                        ? 'ojo-cerrado'
                                                        : 'ojo'
                                                }
                                                tamano={19}
                                            />
                                        </button>
                                    </div>
                                </label>
                            </div>

                            <div className="usuarios-regla-contrasena">
                                <Icono nombre="informacion" tamano={18} />
                                <span>
                                    La contraseña necesita mínimo 8 caracteres, una
                                    mayúscula, una minúscula y un número. En edición,
                                    deja ambos campos vacíos para conservarla.
                                </span>
                            </div>

                            {usuarioEdicion?.idUsuario === idUsuarioActual && (
                                <div className="usuarios-aviso usuarios-aviso--advertencia">
                                    <Icono nombre="alerta" tamano={20} />
                                    <div>
                                        <strong>Estás editando tu propia cuenta</strong>
                                        <span>
                                            Cambiar su estado, rol o contraseña puede afectar
                                            la siguiente validación de tu sesión.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <footer className="usuarios-modal__acciones">
                                <button
                                    type="button"
                                    className="usuarios-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="usuarios-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="usuarios-spinner" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    usuarioEdicion ? 'editar' : 'agregar'
                                                }
                                            />
                                            {usuarioEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar usuario'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {usuarioEliminar && (
                <div className="usuarios-modal-capa">
                    <section
                        className="usuarios-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-eliminar-usuario"
                    >
                        <div className="usuarios-confirmacion__icono">
                            <Icono nombre="alerta" tamano={31} />
                        </div>
                        <span className="usuarios-etiqueta">
                            Confirmar eliminación
                        </span>
                        <h3 id="titulo-eliminar-usuario">
                            ¿Eliminar a {nombreCompleto(usuarioEliminar)}?
                        </h3>
                        <p>
                            Esta acción elimina la cuenta del sistema. El backend
                            impedirá eliminar al único administrador activo de una
                            aerolínea o al único SUPERADMIN activo.
                        </p>
                        <div className="usuarios-confirmacion__datos">
                            <span>{usuarioEliminar.correoUsuario}</span>
                            <strong>
                                {etiquetaRol(usuarioEliminar.rolUsuario)} ·{' '}
                                {etiquetaEstado(usuarioEliminar.estadoUsuario)}
                            </strong>
                        </div>
                        <div className="usuarios-confirmacion__acciones">
                            <button
                                type="button"
                                className="usuarios-boton-secundario"
                                onClick={() => setUsuarioEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="usuarios-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <span className="usuarios-spinner" />
                                        Eliminando
                                    </>
                                ) : (
                                    <>
                                        <Icono nombre="eliminar" />
                                        Eliminar usuario
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

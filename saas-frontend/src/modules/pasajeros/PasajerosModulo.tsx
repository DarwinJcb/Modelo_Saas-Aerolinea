/* saas-frontend/src/modules/pasajeros/PasajerosModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './PasajerosModulo.css'

const API_URL = 'http://localhost:3000/api'

type TipoDocumento = 'CEDULA' | 'PASAPORTE' | 'OTRO'
type FiltroTipoDocumento = 'TODOS' | TipoDocumento
type FiltroContacto = 'TODOS' | 'CON_CONTACTO' | 'SIN_CONTACTO'

type IconoNombre =
    | 'pasajero'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'documento'
    | 'calendario'
    | 'mundo'
    | 'correo'
    | 'telefono'
    | 'aerolinea'
    | 'contacto'

interface AerolineaResumen {
    idAerolinea: number
    nombreComercialAerolinea: string
    codigoIataAerolinea: string
    estadoAerolinea: string
}

interface Pasajero {
    idPasajero: number
    fkAerolineaPasajero: number
    tipoDocumentoPasajero: TipoDocumento
    numeroDocumentoPasajero: string
    nombresPasajero: string
    apellidosPasajero: string
    fechaNacimientoPasajero: string
    nacionalidadPasajero: string
    correoPasajero: string | null
    telefonoPasajero: string | null
    aerolineaPasajero: AerolineaResumen
}

interface FormularioPasajero {
    fkAerolineaPasajero: string
    tipoDocumentoPasajero: TipoDocumento
    numeroDocumentoPasajero: string
    nombresPasajero: string
    apellidosPasajero: string
    fechaNacimientoPasajero: string
    nacionalidadPasajero: string
    correoPasajero: string
    telefonoPasajero: string
}

interface PasajerosModuloProps {
    token: string
    rolUsuario: string
    nombreAerolinea: string
    onSesionExpirada: () => void
}

interface DatosModulo {
    pasajeros: Pasajero[]
    aerolineas: AerolineaResumen[]
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioPasajero = {
    fkAerolineaPasajero: '',
    tipoDocumentoPasajero: 'CEDULA',
    numeroDocumentoPasajero: '',
    nombresPasajero: '',
    apellidosPasajero: '',
    fechaNacimientoPasajero: '',
    nacionalidadPasajero: 'Ecuatoriana',
    correoPasajero: '',
    telefonoPasajero: '',
}

const tiposDocumento: TipoDocumento[] = [
    'CEDULA',
    'PASAPORTE',
    'OTRO',
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
        case 'pasajero':
            return (
                <svg {...props}>
                    <rect x="4" y="3" width="16" height="18" rx="2.5" />
                    <circle cx="12" cy="9" r="3" />
                    <path d="M7.5 17c.6-2.5 2-3.8 4.5-3.8s3.9 1.3 4.5 3.8" />
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
        case 'documento':
            return (
                <svg {...props}>
                    <rect x="4" y="3" width="16" height="18" rx="2.5" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
            )
        case 'calendario':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2.5" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                </svg>
            )
        case 'mundo':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.7 2.5 4 5.5 4 9s-1.3 6.5-4 9c-2.7-2.5-4-5.5-4-9s1.3-6.5 4-9" />
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
        case 'aerolinea':
            return (
                <svg {...props}>
                    <path d="M4 20V9l8-5 8 5v11" />
                    <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
                    <path d="M2 20h20" />
                </svg>
            )
        case 'contacto':
            return (
                <svg {...props}>
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3.5 18c.5-3.3 2.3-5 5.5-5s5 1.7 5.5 5" />
                    <path d="M16 8h5M18.5 5.5v5" />
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

function ordenarPasajeros(lista: Pasajero[]): Pasajero[] {
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

function etiquetaTipoDocumento(
    tipoDocumento: TipoDocumento,
): string {
    switch (tipoDocumento) {
        case 'CEDULA':
            return 'Cédula'
        case 'PASAPORTE':
            return 'Pasaporte'
        case 'OTRO':
            return 'Otro documento'
    }
}

function extraerFechaLocal(
    fechaIso: string,
): { anio: number; mes: number; dia: number } | null {
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(
        fechaIso,
    )

    if (!coincidencia) {
        return null
    }

    const anio = Number(coincidencia[1])
    const mes = Number(coincidencia[2])
    const dia = Number(coincidencia[3])
    const fecha = new Date(anio, mes - 1, dia)

    if (
        fecha.getFullYear() !== anio ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return null
    }

    return { anio, mes, dia }
}

function aFechaInput(fechaIso: string): string {
    const partes = extraerFechaLocal(fechaIso)

    if (!partes) {
        return ''
    }

    return `${String(partes.anio).padStart(4, '0')}-${String(
        partes.mes,
    ).padStart(2, '0')}-${String(partes.dia).padStart(2, '0')}`
}

function formatearFechaNacimiento(fechaIso: string): string {
    const partes = extraerFechaLocal(fechaIso)

    if (!partes) {
        return 'Fecha no válida'
    }

    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(
        new Date(partes.anio, partes.mes - 1, partes.dia),
    )
}

function obtenerFechaActualInput(): string {
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')

    return `${anio}-${mes}-${dia}`
}

function calcularEdad(fechaIso: string): number | null {
    const partes = extraerFechaLocal(fechaIso)

    if (!partes) {
        return null
    }

    const hoy = new Date()
    let edad = hoy.getFullYear() - partes.anio
    const diferenciaMes = hoy.getMonth() + 1 - partes.mes

    if (
        diferenciaMes < 0 ||
        (diferenciaMes === 0 && hoy.getDate() < partes.dia)
    ) {
        edad -= 1
    }

    return edad >= 0 ? edad : null
}

function obtenerIniciales(pasajero: Pasajero): string {
    const primera = pasajero.nombresPasajero.trim().charAt(0)
    const segunda = pasajero.apellidosPasajero.trim().charAt(0)

    return `${primera}${segunda || primera}`.toUpperCase()
}

function tieneContacto(pasajero: Pasajero): boolean {
    return Boolean(
        pasajero.correoPasajero?.trim() ||
        pasajero.telefonoPasajero?.trim(),
    )
}

async function cargarDatosModulo(
    token: string,
    esSuperadmin: boolean,
    signal?: AbortSignal,
): Promise<DatosModulo> {
    const solicitudPasajeros = solicitar<Pasajero[]>(
        '/pasajeros',
        token,
        { signal },
    )

    const solicitudAerolineas = esSuperadmin
        ? solicitar<AerolineaResumen[]>('/aerolineas', token, {
            signal,
        })
        : Promise.resolve([] as AerolineaResumen[])

    const [pasajeros, aerolineas] = await Promise.all([
        solicitudPasajeros,
        solicitudAerolineas,
    ])

    return {
        pasajeros: ordenarPasajeros(
            Array.isArray(pasajeros) ? pasajeros : [],
        ),
        aerolineas: ordenarAerolineas(
            Array.isArray(aerolineas) ? aerolineas : [],
        ),
    }
}

export function PasajerosModulo({
    token,
    rolUsuario,
    nombreAerolinea,
    onSesionExpirada,
}: PasajerosModuloProps) {
    const [pasajeros, setPasajeros] = useState<Pasajero[]>([])
    const [aerolineas, setAerolineas] = useState<
        AerolineaResumen[]
    >([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipoDocumento, setFiltroTipoDocumento] =
        useState<FiltroTipoDocumento>('TODOS')
    const [filtroContacto, setFiltroContacto] =
        useState<FiltroContacto>('TODOS')
    const [filtroAerolinea, setFiltroAerolinea] =
        useState('TODAS')
    const [formularioAbierto, setFormularioAbierto] =
        useState(false)
    const [pasajeroEdicion, setPasajeroEdicion] =
        useState<Pasajero | null>(null)
    const [formulario, setFormulario] =
        useState<FormularioPasajero>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [pasajeroEliminar, setPasajeroEliminar] =
        useState<Pasajero | null>(null)

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
                            : 'No fue posible cargar los pasajeros.',
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
        puedeCrear &&
        (!esSuperadmin || aerolineasActivas.length > 0)

    const pasajerosFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return pasajeros.filter((pasajero) => {
            if (
                filtroTipoDocumento !== 'TODOS' &&
                pasajero.tipoDocumentoPasajero !==
                filtroTipoDocumento
            ) {
                return false
            }

            if (
                filtroContacto === 'CON_CONTACTO' &&
                !tieneContacto(pasajero)
            ) {
                return false
            }

            if (
                filtroContacto === 'SIN_CONTACTO' &&
                tieneContacto(pasajero)
            ) {
                return false
            }

            if (
                esSuperadmin &&
                filtroAerolinea !== 'TODAS' &&
                pasajero.fkAerolineaPasajero !==
                Number(filtroAerolinea)
            ) {
                return false
            }

            if (!texto) {
                return true
            }

            return normalizarBusqueda(
                [
                    pasajero.nombresPasajero,
                    pasajero.apellidosPasajero,
                    pasajero.numeroDocumentoPasajero,
                    etiquetaTipoDocumento(
                        pasajero.tipoDocumentoPasajero,
                    ),
                    pasajero.nacionalidadPasajero,
                    pasajero.correoPasajero ?? '',
                    pasajero.telefonoPasajero ?? '',
                    pasajero.aerolineaPasajero
                        .nombreComercialAerolinea,
                    pasajero.aerolineaPasajero
                        .codigoIataAerolinea,
                ].join(' '),
            ).includes(texto)
        })
    }, [
        pasajeros,
        busqueda,
        filtroTipoDocumento,
        filtroContacto,
        filtroAerolinea,
        esSuperadmin,
    ])

    const resumen = useMemo(() => {
        const cedulas = pasajeros.filter(
            (pasajero) =>
                pasajero.tipoDocumentoPasajero === 'CEDULA',
        ).length
        const pasaportes = pasajeros.filter(
            (pasajero) =>
                pasajero.tipoDocumentoPasajero === 'PASAPORTE',
        ).length
        const conContacto = pasajeros.filter(tieneContacto).length

        return {
            total: pasajeros.length,
            cedulas,
            pasaportes,
            conContacto,
            sinContacto: pasajeros.length - conContacto,
        }
    }, [pasajeros])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const datos = await cargarDatosModulo(
                token,
                esSuperadmin,
            )

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
                    : 'No fue posible cargar los pasajeros.',
            )
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        if (!puedeAbrirCreacion) {
            return
        }

        setPasajeroEdicion(null)
        setFormulario({
            ...formularioInicial,
            fkAerolineaPasajero:
                esSuperadmin && aerolineasActivas.length === 1
                    ? String(aerolineasActivas[0].idAerolinea)
                    : '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(pasajero: Pasajero) {
        setPasajeroEdicion(pasajero)
        setFormulario({
            fkAerolineaPasajero: String(
                pasajero.fkAerolineaPasajero,
            ),
            tipoDocumentoPasajero:
                pasajero.tipoDocumentoPasajero,
            numeroDocumentoPasajero:
                pasajero.numeroDocumentoPasajero,
            nombresPasajero: pasajero.nombresPasajero,
            apellidosPasajero: pasajero.apellidosPasajero,
            fechaNacimientoPasajero: aFechaInput(
                pasajero.fechaNacimientoPasajero,
            ),
            nacionalidadPasajero:
                pasajero.nacionalidadPasajero,
            correoPasajero: pasajero.correoPasajero ?? '',
            telefonoPasajero:
                pasajero.telefonoPasajero ?? '',
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) {
            return
        }

        setFormularioAbierto(false)
        setPasajeroEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioPasajero>(
        campo: K,
        valor: FormularioPasajero[K],
    ) {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    function validarFormulario(): string | null {
        if (
            esSuperadmin &&
            pasajeroEdicion === null &&
            !formulario.fkAerolineaPasajero
        ) {
            return 'Selecciona la aerolínea propietaria del pasajero.'
        }

        if (
            !/^[A-Z0-9-]{5,25}$/.test(
                formulario.numeroDocumentoPasajero,
            )
        ) {
            return 'El número de documento debe tener entre 5 y 25 caracteres y usar solo letras, números o guiones.'
        }

        if (
            formulario.nombresPasajero.trim().length < 2 ||
            formulario.nombresPasajero.trim().length > 80
        ) {
            return 'Los nombres deben contener entre 2 y 80 caracteres.'
        }

        if (
            formulario.apellidosPasajero.trim().length < 2 ||
            formulario.apellidosPasajero.trim().length > 80
        ) {
            return 'Los apellidos deben contener entre 2 y 80 caracteres.'
        }

        const fechaNacimiento = new Date(
            `${formulario.fechaNacimientoPasajero}T00:00:00`,
        )

        if (
            !formulario.fechaNacimientoPasajero ||
            Number.isNaN(fechaNacimiento.getTime())
        ) {
            return 'Selecciona una fecha de nacimiento válida.'
        }

        const hoy = new Date()
        hoy.setHours(23, 59, 59, 999)

        if (fechaNacimiento > hoy) {
            return 'La fecha de nacimiento no puede ser posterior a la fecha actual.'
        }

        if (
            formulario.nacionalidadPasajero.trim().length < 2 ||
            formulario.nacionalidadPasajero.trim().length > 80
        ) {
            return 'La nacionalidad debe contener entre 2 y 80 caracteres.'
        }

        const correo = formulario.correoPasajero.trim()

        if (
            correo &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
        ) {
            return 'El correo del pasajero no tiene un formato válido.'
        }

        if (correo.length > 150) {
            return 'El correo del pasajero no puede superar los 150 caracteres.'
        }

        const telefono = formulario.telefonoPasajero.trim()

        if (
            telefono &&
            !/^\+?[0-9\s()-]{7,20}$/.test(telefono)
        ) {
            return 'El teléfono del pasajero no tiene un formato válido.'
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

        const esEdicion = pasajeroEdicion !== null
        const correo = formulario.correoPasajero
            .trim()
            .toLowerCase()
        const telefono = formulario.telefonoPasajero.trim()

        const datos: Record<string, unknown> = {
            tipoDocumentoPasajero:
                formulario.tipoDocumentoPasajero,
            numeroDocumentoPasajero:
                formulario.numeroDocumentoPasajero.trim(),
            nombresPasajero:
                formulario.nombresPasajero.trim(),
            apellidosPasajero:
                formulario.apellidosPasajero.trim(),
            fechaNacimientoPasajero:
                formulario.fechaNacimientoPasajero,
            nacionalidadPasajero:
                formulario.nacionalidadPasajero.trim(),
            correoPasajero: correo || null,
            telefonoPasajero: telefono || null,
            ...(!esEdicion && esSuperadmin
                ? {
                    fkAerolineaPasajero: Number(
                        formulario.fkAerolineaPasajero,
                    ),
                }
                : {}),
        }

        try {
            const pasajeroGuardado = await solicitar<Pasajero>(
                esEdicion
                    ? `/pasajeros/${pasajeroEdicion.idPasajero}`
                    : '/pasajeros',
                token,
                {
                    method: esEdicion ? 'PATCH' : 'POST',
                    body: JSON.stringify(datos),
                },
            )

            setPasajeros((lista) =>
                ordenarPasajeros([
                    ...lista.filter(
                        (pasajero) =>
                            pasajero.idPasajero !==
                            pasajeroGuardado.idPasajero,
                    ),
                    pasajeroGuardado,
                ]),
            )
            setFormularioAbierto(false)
            setPasajeroEdicion(null)
            setMensajeExito(
                esEdicion
                    ? 'Pasajero actualizado correctamente.'
                    : 'Pasajero registrado correctamente.',
            )
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setErrorFormulario(
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el pasajero.',
            )
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!pasajeroEliminar) {
            return
        }

        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(
                `/pasajeros/${pasajeroEliminar.idPasajero}`,
                token,
                { method: 'DELETE' },
            )

            setPasajeros((lista) =>
                lista.filter(
                    (pasajero) =>
                        pasajero.idPasajero !==
                        pasajeroEliminar.idPasajero,
                ),
            )
            setPasajeroEliminar(null)
            setMensajeExito('Pasajero eliminado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) {
                onSesionExpirada()
                return
            }

            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No fue posible eliminar el pasajero.',
            )
            setPasajeroEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="pasajeros-modulo">
            <header className="pasajeros-cabecera">
                <div className="pasajeros-cabecera__texto">
                    <span className="pasajeros-etiqueta">
                        Registro por aerolínea
                    </span>
                    <h2>Gestión de pasajeros</h2>
                    <p>
                        Administra identidad, documentos y datos de
                        contacto de los viajeros dentro de cada tenant.
                    </p>
                </div>

                <div className="pasajeros-cabecera__acciones">
                    <button
                        type="button"
                        className="pasajeros-boton-secundario"
                        onClick={() => void recargar()}
                        disabled={cargando}
                    >
                        <Icono nombre="actualizar" />
                        Actualizar
                    </button>

                    {puedeCrear && (
                        <button
                            type="button"
                            className="pasajeros-boton-principal"
                            onClick={abrirCreacion}
                            disabled={!puedeAbrirCreacion}
                            title={
                                puedeAbrirCreacion
                                    ? 'Registrar un nuevo pasajero'
                                    : 'Debe existir una aerolínea activa'
                            }
                        >
                            <Icono nombre="agregar" />
                            Nuevo pasajero
                        </button>
                    )}
                </div>
            </header>

            {esEmpleado && (
                <div className="pasajeros-aviso pasajeros-aviso--operacion">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>Gestión de pasajeros habilitada</strong>
                        <span>
                            Puedes registrar y actualizar pasajeros de{' '}
                            {nombreAerolinea}. La eliminación corresponde a
                            los administradores.
                        </span>
                    </div>
                </div>
            )}

            {esSuperadmin &&
                aerolineasActivas.length === 0 &&
                !cargando && (
                    <div className="pasajeros-aviso pasajeros-aviso--advertencia">
                        <Icono nombre="alerta" tamano={21} />
                        <div>
                            <strong>No existen aerolíneas operativas</strong>
                            <span>
                                Debe existir una aerolínea ACTIVA para
                                registrar pasajeros.
                            </span>
                        </div>
                    </div>
                )}

            {mensajeExito && (
                <div className="pasajeros-mensaje pasajeros-mensaje--exito">
                    <span>✓</span>
                    {mensajeExito}
                </div>
            )}

            {mensajeError && !cargando && (
                <div className="pasajeros-mensaje pasajeros-mensaje--error">
                    <Icono nombre="alerta" tamano={19} />
                    <span>{mensajeError}</span>
                </div>
            )}

            <div className="pasajeros-resumen">
                <article>
                    <span>Total de pasajeros</span>
                    <strong>{resumen.total}</strong>
                    <small>Registros del alcance actual</small>
                </article>
                <article>
                    <span>Cédulas</span>
                    <strong>{resumen.cedulas}</strong>
                    <small>Documento nacional</small>
                </article>
                <article>
                    <span>Pasaportes</span>
                    <strong>{resumen.pasaportes}</strong>
                    <small>Documento internacional</small>
                </article>
                <article>
                    <span>Con contacto</span>
                    <strong>{resumen.conContacto}</strong>
                    <small>{resumen.sinContacto} sin datos de contacto</small>
                </article>
            </div>

            <section className="pasajeros-catalogo">
                <div className="pasajeros-filtros">
                    <label className="pasajeros-buscador">
                        <Icono nombre="buscar" tamano={20} />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                setBusqueda(evento.target.value)
                            }
                            placeholder={
                                esSuperadmin
                                    ? 'Buscar por pasajero, documento, contacto, nacionalidad o aerolínea'
                                    : 'Buscar por pasajero, documento, contacto o nacionalidad'
                            }
                        />
                    </label>

                    <label className="pasajeros-selector-filtro">
                        <span>Documento</span>
                        <select
                            value={filtroTipoDocumento}
                            onChange={(evento) =>
                                setFiltroTipoDocumento(
                                    evento.target
                                        .value as FiltroTipoDocumento,
                                )
                            }
                        >
                            <option value="TODOS">Todos</option>
                            {tiposDocumento.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {etiquetaTipoDocumento(tipo)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="pasajeros-selector-filtro">
                        <span>Contacto</span>
                        <select
                            value={filtroContacto}
                            onChange={(evento) =>
                                setFiltroContacto(
                                    evento.target
                                        .value as FiltroContacto,
                                )
                            }
                        >
                            <option value="TODOS">Todos</option>
                            <option value="CON_CONTACTO">
                                Con contacto
                            </option>
                            <option value="SIN_CONTACTO">
                                Sin contacto
                            </option>
                        </select>
                    </label>

                    {esSuperadmin && (
                        <label className="pasajeros-selector-filtro">
                            <span>Aerolínea</span>
                            <select
                                value={filtroAerolinea}
                                onChange={(evento) =>
                                    setFiltroAerolinea(
                                        evento.target.value,
                                    )
                                }
                            >
                                <option value="TODAS">Todas</option>
                                {aerolineas.map((aerolinea) => (
                                    <option
                                        key={aerolinea.idAerolinea}
                                        value={aerolinea.idAerolinea}
                                    >
                                        {
                                            aerolinea.nombreComercialAerolinea
                                        }
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <span className="pasajeros-resultados">
                        {pasajerosFiltrados.length}{' '}
                        {pasajerosFiltrados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </span>
                </div>

                {cargando ? (
                    <div className="pasajeros-estado-vacio">
                        <span className="pasajeros-cargador" />
                        <strong>Cargando pasajeros</strong>
                        <p>Consultando el registro de viajeros.</p>
                    </div>
                ) : pasajerosFiltrados.length === 0 ? (
                    <div className="pasajeros-estado-vacio">
                        <span className="pasajeros-estado-vacio__icono">
                            <Icono nombre="pasajero" tamano={35} />
                        </span>
                        <strong>
                            {pasajeros.length === 0
                                ? 'No existen pasajeros registrados'
                                : 'No hay pasajeros que coincidan con los filtros'}
                        </strong>
                        <p>
                            {pasajeros.length === 0
                                ? 'El catálogo todavía no contiene viajeros registrados.'
                                : 'Modifica la búsqueda o los filtros para mostrar otros resultados.'}
                        </p>
                        {pasajeros.length === 0 &&
                            puedeAbrirCreacion && (
                                <button
                                    type="button"
                                    className="pasajeros-boton-principal"
                                    onClick={abrirCreacion}
                                >
                                    <Icono nombre="agregar" />
                                    Registrar el primero
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="pasajeros-tabla-contenedor">
                        <table className="pasajeros-tabla">
                            <thead>
                                <tr>
                                    <th>Pasajero</th>
                                    <th>Documento</th>
                                    <th>Perfil</th>
                                    <th>Contacto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pasajerosFiltrados.map((pasajero) => {
                                    const edad = calcularEdad(
                                        pasajero.fechaNacimientoPasajero,
                                    )

                                    return (
                                        <tr key={pasajero.idPasajero}>
                                            <td data-label="Pasajero">
                                                <div className="pasajeros-identidad">
                                                    <span className="pasajeros-avatar">
                                                        {obtenerIniciales(
                                                            pasajero,
                                                        )}
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {
                                                                pasajero.nombresPasajero
                                                            }{' '}
                                                            {
                                                                pasajero.apellidosPasajero
                                                            }
                                                        </strong>
                                                        <span>
                                                            ID #
                                                            {
                                                                pasajero.idPasajero
                                                            }
                                                        </span>
                                                        {esSuperadmin && (
                                                            <small>
                                                                {
                                                                    pasajero
                                                                        .aerolineaPasajero
                                                                        .nombreComercialAerolinea
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td data-label="Documento">
                                                <div className="pasajeros-documento">
                                                    <span
                                                        className={`pasajeros-insignia-documento pasajeros-insignia-documento--${pasajero.tipoDocumentoPasajero.toLowerCase()}`}
                                                    >
                                                        {etiquetaTipoDocumento(
                                                            pasajero.tipoDocumentoPasajero,
                                                        )}
                                                    </span>
                                                    <strong>
                                                        {
                                                            pasajero.numeroDocumentoPasajero
                                                        }
                                                    </strong>
                                                </div>
                                            </td>

                                            <td data-label="Perfil">
                                                <div className="pasajeros-perfil-datos">
                                                    <div>
                                                        <Icono
                                                            nombre="mundo"
                                                            tamano={17}
                                                        />
                                                        <span>
                                                            {
                                                                pasajero.nacionalidadPasajero
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Icono
                                                            nombre="calendario"
                                                            tamano={17}
                                                        />
                                                        <span>
                                                            {formatearFechaNacimiento(
                                                                pasajero.fechaNacimientoPasajero,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <small>
                                                        {edad === null
                                                            ? 'Edad no disponible'
                                                            : `${edad} ${edad === 1
                                                                ? 'año'
                                                                : 'años'
                                                            }`}
                                                    </small>
                                                </div>
                                            </td>

                                            <td data-label="Contacto">
                                                {tieneContacto(pasajero) ? (
                                                    <div className="pasajeros-contacto">
                                                        {pasajero.correoPasajero && (
                                                            <div>
                                                                <Icono
                                                                    nombre="correo"
                                                                    tamano={17}
                                                                />
                                                                <span>
                                                                    {
                                                                        pasajero.correoPasajero
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {pasajero.telefonoPasajero && (
                                                            <div>
                                                                <Icono
                                                                    nombre="telefono"
                                                                    tamano={17}
                                                                />
                                                                <span>
                                                                    {
                                                                        pasajero.telefonoPasajero
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="pasajeros-sin-contacto">
                                                        Sin datos de contacto
                                                    </span>
                                                )}
                                            </td>

                                            <td data-label="Acciones">
                                                <div className="pasajeros-acciones-fila">
                                                    {puedeEditar && (
                                                        <button
                                                            type="button"
                                                            className="pasajeros-boton-icono"
                                                            onClick={() =>
                                                                abrirEdicion(
                                                                    pasajero,
                                                                )
                                                            }
                                                            aria-label={`Editar pasajero ${pasajero.nombresPasajero} ${pasajero.apellidosPasajero}`}
                                                            title="Editar pasajero"
                                                        >
                                                            <Icono
                                                                nombre="editar"
                                                                tamano={19}
                                                            />
                                                        </button>
                                                    )}
                                                    {puedeEliminar && (
                                                        <button
                                                            type="button"
                                                            className="pasajeros-boton-icono pasajeros-boton-icono--peligro"
                                                            onClick={() =>
                                                                setPasajeroEliminar(
                                                                    pasajero,
                                                                )
                                                            }
                                                            aria-label={`Eliminar pasajero ${pasajero.nombresPasajero} ${pasajero.apellidosPasajero}`}
                                                            title="Eliminar pasajero"
                                                        >
                                                            <Icono
                                                                nombre="eliminar"
                                                                tamano={19}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div
                    className="pasajeros-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target === evento.currentTarget
                        ) {
                            cerrarFormulario()
                        }
                    }}
                >
                    <section
                        className="pasajeros-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pasajeros-formulario-titulo"
                    >
                        <header className="pasajeros-modal__cabecera">
                            <div className="pasajeros-modal__titulo">
                                <span className="pasajeros-modal__icono">
                                    <Icono
                                        nombre="pasajero"
                                        tamano={24}
                                    />
                                </span>
                                <div>
                                    <span>
                                        {pasajeroEdicion
                                            ? 'Actualización de datos'
                                            : 'Nuevo registro'}
                                    </span>
                                    <h3 id="pasajeros-formulario-titulo">
                                        {pasajeroEdicion
                                            ? 'Editar pasajero'
                                            : 'Registrar pasajero'}
                                    </h3>
                                    <p>
                                        Registra identidad, documento y
                                        medios de contacto del viajero.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="pasajeros-modal__cerrar"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                                aria-label="Cerrar formulario"
                            >
                                <Icono nombre="cerrar" tamano={23} />
                            </button>
                        </header>

                        <form
                            className="pasajeros-formulario"
                            onSubmit={guardar}
                        >
                            {esSuperadmin &&
                                pasajeroEdicion === null ? (
                                <label className="pasajeros-campo pasajeros-campo--completo">
                                    <span>Aerolínea propietaria</span>
                                    <select
                                        value={
                                            formulario.fkAerolineaPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fkAerolineaPasajero',
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
                                <div className="pasajeros-propietario">
                                    <Icono
                                        nombre="aerolinea"
                                        tamano={20}
                                    />
                                    <div>
                                        <span>Aerolínea propietaria</span>
                                        <strong>
                                            {pasajeroEdicion
                                                ? pasajeroEdicion
                                                    .aerolineaPasajero
                                                    .nombreComercialAerolinea
                                                : nombreAerolinea}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className="pasajeros-formulario__rejilla">
                                <label className="pasajeros-campo">
                                    <span>Tipo de documento</span>
                                    <select
                                        value={
                                            formulario.tipoDocumentoPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'tipoDocumentoPasajero',
                                                evento.target
                                                    .value as TipoDocumento,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    >
                                        {tiposDocumento.map((tipo) => (
                                            <option
                                                key={tipo}
                                                value={tipo}
                                            >
                                                {etiquetaTipoDocumento(
                                                    tipo,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="pasajeros-campo">
                                    <span>Número de documento</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.numeroDocumentoPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'numeroDocumentoPasajero',
                                                evento.target.value
                                                    .toUpperCase()
                                                    .replace(
                                                        /[^A-Z0-9-]/g,
                                                        '',
                                                    ),
                                            )
                                        }
                                        placeholder="0102030405"
                                        minLength={5}
                                        maxLength={25}
                                        required
                                        disabled={guardando}
                                    />
                                    <small>
                                        Debe ser único dentro de la
                                        aerolínea.
                                    </small>
                                </label>
                            </div>

                            <div className="pasajeros-formulario__rejilla">
                                <label className="pasajeros-campo">
                                    <span>Nombres</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.nombresPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'nombresPasajero',
                                                evento.target.value,
                                            )
                                        }
                                        placeholder="María Elena"
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        disabled={guardando}
                                    />
                                </label>

                                <label className="pasajeros-campo">
                                    <span>Apellidos</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.apellidosPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'apellidosPasajero',
                                                evento.target.value,
                                            )
                                        }
                                        placeholder="Paredes Molina"
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        disabled={guardando}
                                    />
                                </label>
                            </div>

                            <div className="pasajeros-formulario__rejilla">
                                <label className="pasajeros-campo">
                                    <span>Fecha de nacimiento</span>
                                    <input
                                        type="date"
                                        value={
                                            formulario.fechaNacimientoPasajero
                                        }
                                        max={obtenerFechaActualInput()}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'fechaNacimientoPasajero',
                                                evento.target.value,
                                            )
                                        }
                                        required
                                        disabled={guardando}
                                    />
                                </label>

                                <label className="pasajeros-campo">
                                    <span>Nacionalidad</span>
                                    <input
                                        type="text"
                                        value={
                                            formulario.nacionalidadPasajero
                                        }
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                'nacionalidadPasajero',
                                                evento.target.value,
                                            )
                                        }
                                        placeholder="Ecuatoriana"
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        disabled={guardando}
                                    />
                                </label>
                            </div>

                            <div className="pasajeros-formulario__rejilla">
                                <label className="pasajeros-campo">
                                    <span>Correo electrónico</span>
                                    <div className="pasajeros-campo-con-icono">
                                        <Icono
                                            nombre="correo"
                                            tamano={19}
                                        />
                                        <input
                                            type="email"
                                            value={
                                                formulario.correoPasajero
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'correoPasajero',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="pasajero@correo.com"
                                            maxLength={150}
                                            disabled={guardando}
                                        />
                                    </div>
                                    <small>Campo opcional.</small>
                                </label>

                                <label className="pasajeros-campo">
                                    <span>Teléfono</span>
                                    <div className="pasajeros-campo-con-icono">
                                        <Icono
                                            nombre="telefono"
                                            tamano={19}
                                        />
                                        <input
                                            type="tel"
                                            value={
                                                formulario.telefonoPasajero
                                            }
                                            onChange={(evento) =>
                                                cambiarCampo(
                                                    'telefonoPasajero',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="+593 99 123 4567"
                                            maxLength={20}
                                            disabled={guardando}
                                        />
                                    </div>
                                    <small>Campo opcional.</small>
                                </label>
                            </div>

                            <div className="pasajeros-nota-formulario">
                                <Icono
                                    nombre="informacion"
                                    tamano={19}
                                />
                                <span>
                                    El tipo y número de documento se
                                    validan de forma única dentro de la
                                    aerolínea propietaria.
                                </span>
                            </div>

                            {errorFormulario && (
                                <div
                                    className="pasajeros-mensaje pasajeros-mensaje--error"
                                    role="alert"
                                >
                                    <Icono
                                        nombre="alerta"
                                        tamano={19}
                                    />
                                    <span>{errorFormulario}</span>
                                </div>
                            )}

                            <footer className="pasajeros-modal__acciones">
                                <button
                                    type="button"
                                    className="pasajeros-boton-secundario"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="pasajeros-boton-principal"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="pasajeros-cargador pasajeros-cargador--boton" />
                                            Guardando
                                        </>
                                    ) : (
                                        <>
                                            <Icono
                                                nombre={
                                                    pasajeroEdicion
                                                        ? 'editar'
                                                        : 'agregar'
                                                }
                                            />
                                            {pasajeroEdicion
                                                ? 'Guardar cambios'
                                                : 'Registrar pasajero'}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {pasajeroEliminar && (
                <div
                    className="pasajeros-modal-capa"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (
                            evento.target === evento.currentTarget
                        ) {
                            setPasajeroEliminar(null)
                        }
                    }}
                >
                    <section
                        className="pasajeros-confirmacion"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="pasajeros-eliminar-titulo"
                    >
                        <span className="pasajeros-confirmacion__icono">
                            <Icono nombre="eliminar" tamano={26} />
                        </span>
                        <span className="pasajeros-etiqueta">
                            Eliminar registro
                        </span>
                        <h3 id="pasajeros-eliminar-titulo">
                            ¿Eliminar a{' '}
                            {pasajeroEliminar.nombresPasajero}{' '}
                            {pasajeroEliminar.apellidosPasajero}?
                        </h3>
                        <p>
                            Esta acción elimina definitivamente al
                            pasajero. Si tiene reservas asociadas, el
                            backend impedirá la eliminación.
                        </p>
                        <div className="pasajeros-confirmacion__detalle">
                            <strong>
                                {etiquetaTipoDocumento(
                                    pasajeroEliminar.tipoDocumentoPasajero,
                                )}{' '}
                                ·{' '}
                                {
                                    pasajeroEliminar.numeroDocumentoPasajero
                                }
                            </strong>
                            <span>
                                {
                                    pasajeroEliminar.nacionalidadPasajero
                                }{' '}
                                ·{' '}
                                {
                                    pasajeroEliminar
                                        .aerolineaPasajero
                                        .nombreComercialAerolinea
                                }
                            </span>
                        </div>
                        <div className="pasajeros-confirmacion__acciones">
                            <button
                                type="button"
                                className="pasajeros-boton-secundario"
                                onClick={() =>
                                    setPasajeroEliminar(null)
                                }
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="pasajeros-boton-peligro"
                                onClick={() => void eliminar()}
                                disabled={eliminando}
                            >
                                <Icono nombre="eliminar" />
                                {eliminando
                                    ? 'Eliminando'
                                    : 'Eliminar pasajero'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

/* saas-frontend/src/App.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { AeropuertosModulo } from './modules/aeropuertos/AeropuertosModulo'
import { RutasModulo } from './modules/rutas/RutasModulo'
import { VuelosModulo } from './modules/vuelos/VuelosModulo'
import { PasajerosModulo } from './modules/pasajeros/PasajerosModulo'
import { CambiarContrasenaModal } from './components/CambiarContrasenaModal'

const API_URL = 'http://localhost:3000/api'
const TOKEN_STORAGE_KEY = 'aerosaas_token'

type RolUsuario = | 'SUPERADMIN' | 'ADMIN_AEROLINEA' | 'EMPLEADO' | string

type NombreIcono =
  | 'menu'
  | 'panel'
  | 'plan'
  | 'aerolinea'
  | 'suscripcion'
  | 'usuario'
  | 'avion'
  | 'aeropuerto'
  | 'ruta'
  | 'vuelo'
  | 'pasajero'
  | 'reserva'
  | 'boleto'
  | 'salir'
  | 'correo'
  | 'candado'
  | 'ojo'
  | 'ojo-cerrado'
  | 'flecha'
  | 'escudo'
  | 'nube'

type EstadoSesion = | 'sin-sesion' | 'verificando' | 'autenticado'

interface UsuarioSesion {
  idUsuario: number
  nombresUsuario: string
  apellidosUsuario: string
  correoUsuario: string
  rolUsuario: RolUsuario
  fkAerolineaUsuario: number | null
  nombreAerolinea: string | null
}

interface Modulo {
  id: string
  nombre: string
  descripcion: string
  icono: NombreIcono
}

interface IconoProps {
  nombre: NombreIcono
  tamano?: number
  className?: string
}

interface PantallaLoginProps {
  avisoSesion: string
  onAutenticado: (token: string) => void
}

interface PanelPrincipalProps {
  usuario: UsuarioSesion
  token: string
  onCerrarSesion: () => void
  onContrasenaCambiada: () => void
}

function Icono({
  nombre,
  tamano = 22,
  className = '',
}: IconoProps) {
  const propiedades = {
    width: tamano,
    height: tamano,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }

  switch (nombre) {
    case 'menu':
      return (
        <svg {...propiedades}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )

    case 'panel':
      return (
        <svg {...propiedades}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )

    case 'plan':
      return (
        <svg {...propiedades}>
          <path d="M7 3h8l4 4v14H7z" />
          <path d="M15 3v5h5M10 12h6M10 16h5" />
        </svg>
      )

    case 'aerolinea':
      return (
        <svg {...propiedades}>
          <path d="M4 20V9l8-5 8 5v11" />
          <path d="M8 20v-6h8v6M8 10h.01M12 10h.01M16 10h.01" />
          <path d="M2 20h20" />
        </svg>
      )

    case 'suscripcion':
      return (
        <svg {...propiedades}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 9h18M7 15l2 2 4-4" />
        </svg>
      )

    case 'usuario':
      return (
        <svg {...propiedades}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" />
        </svg>
      )

    case 'avion':
      return (
        <svg {...propiedades}>
          <path d="M3 13.2 21 5l-5.7 14-3.7-5.1L6 16z" />
          <path d="m11.6 13.9 4.6-4.5" />
        </svg>
      )

    case 'aeropuerto':
      return (
        <svg {...propiedades}>
          <path d="M8 21h8M10 21l1-11h2l1 11" />
          <path d="M9 10h6l-1-4h-4zM6 14h4M14 14h4" />
          <path d="M5 6h3M16 6h3" />
        </svg>
      )

    case 'ruta':
      return (
        <svg {...propiedades}>
          <circle cx="5" cy="18" r="2.5" />
          <circle cx="19" cy="6" r="2.5" />
          <path d="M7.5 18c4 0 1.5-7 6-7h1.5" />
          <path d="m12.5 7.5 2.5 3.5-4 1" />
        </svg>
      )

    case 'vuelo':
      return (
        <svg {...propiedades}>
          <path d="M4 17c4-7 8-10 16-11" />
          <path d="m12 10 7-4-3 7-2-2-3 1z" />
          <circle cx="4" cy="17" r="2" />
        </svg>
      )

    case 'pasajero':
      return (
        <svg {...propiedades}>
          <rect x="4" y="3" width="16" height="18" rx="2.5" />
          <circle cx="12" cy="9" r="3" />
          <path d="M7.5 17c.6-2.5 2-3.8 4.5-3.8s3.9 1.3 4.5 3.8" />
        </svg>
      )

    case 'reserva':
      return (
        <svg {...propiedades}>
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M7 3v4M17 3v4M3 10h18" />
          <path d="m8 15 2.2 2.2L16 12" />
        </svg>
      )

    case 'boleto':
      return (
        <svg {...propiedades}>
          <path d="M3 7.5A2.5 2.5 0 0 0 5.5 5h13A2.5 2.5 0 0 0 21 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 0 18.5 19h-13A2.5 2.5 0 0 0 3 16.5v-2a2.5 2.5 0 0 0 0-5z" />
          <path d="M9 8v8M13 9h4M13 13h4" />
        </svg>
      )

    case 'salir':
      return (
        <svg {...propiedades}>
          <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
        </svg>
      )

    case 'correo':
      return (
        <svg {...propiedades}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )

    case 'candado':
      return (
        <svg {...propiedades}>
          <rect x="4" y="10" width="16" height="11" rx="2.5" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </svg>
      )

    case 'ojo':
      return (
        <svg {...propiedades}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )

    case 'ojo-cerrado':
      return (
        <svg {...propiedades}>
          <path d="M3 3l18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.7M6.2 6.2A16 16 0 0 0 2.5 12s3.5 6 9.5 6a10.5 10.5 0 0 0 3.2-.5" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      )

    case 'flecha':
      return (
        <svg {...propiedades}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      )

    case 'escudo':
      return (
        <svg {...propiedades}>
          <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
          <path d="m8.5 12 2.3 2.3 4.8-5" />
        </svg>
      )

    case 'nube':
      return (
        <svg {...propiedades}>
          <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9" />
          <path d="m9 13 3-2 3 2M12 11v5" />
        </svg>
      )
  }
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function obtenerCadena(
  objeto: Record<string, unknown>,
  propiedad: string,
): string | null {
  const valor = objeto[propiedad]

  return typeof valor === 'string' && valor.trim()
    ? valor.trim()
    : null
}

function obtenerNumero(
  objeto: Record<string, unknown>,
  propiedad: string,
): number | null {
  const valor = objeto[propiedad]

  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return valor
  }

  if (
    typeof valor === 'string' &&
    valor.trim() &&
    Number.isFinite(Number(valor))
  ) {
    return Number(valor)
  }

  return null
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

function obtenerMensajeApi(
  respuesta: unknown,
  mensajeAlternativo: string,
): string {
  if (!esObjeto(respuesta)) {
    return mensajeAlternativo
  }

  const mensaje = respuesta.message

  if (typeof mensaje === 'string') {
    return mensaje
  }

  if (
    Array.isArray(mensaje) &&
    mensaje.every((elemento) => typeof elemento === 'string')
  ) {
    return mensaje.join('. ')
  }

  const error = respuesta.error

  if (typeof error === 'string') {
    return error
  }

  return mensajeAlternativo
}

function extraerToken(respuesta: unknown): string | null {
  if (!esObjeto(respuesta)) {
    return null
  }

  const posiblesPropiedades = [
    'token',
    'tokenAcceso',
    'accessToken',
    'access_token',
  ]

  for (const propiedad of posiblesPropiedades) {
    const valor = respuesta[propiedad]

    if (typeof valor === 'string' && valor.trim()) {
      return valor
    }
  }

  return null
}

function normalizarUsuario(
  respuesta: unknown,
): UsuarioSesion | null {
  if (!esObjeto(respuesta)) {
    return null
  }

  const contenedorUsuario = esObjeto(respuesta.usuario)
    ? respuesta.usuario
    : respuesta

  const idUsuario = obtenerNumero(
    contenedorUsuario,
    'idUsuario',
  )

  const correoUsuario = obtenerCadena(
    contenedorUsuario,
    'correoUsuario',
  )

  const rolUsuario = obtenerCadena(
    contenedorUsuario,
    'rolUsuario',
  )

  if (
    idUsuario === null ||
    correoUsuario === null ||
    rolUsuario === null
  ) {
    return null
  }

  const aerolineaRelacionada = esObjeto(
    contenedorUsuario.aerolineaUsuario,
  )
    ? contenedorUsuario.aerolineaUsuario
    : esObjeto(contenedorUsuario.aerolinea)
      ? contenedorUsuario.aerolinea
      : null

  const nombreAerolinea = aerolineaRelacionada
    ? obtenerCadena(
      aerolineaRelacionada,
      'nombreComercialAerolinea',
    ) ??
    obtenerCadena(
      aerolineaRelacionada,
      'nombreAerolinea',
    )
    : null

  return {
    idUsuario,
    nombresUsuario:
      obtenerCadena(
        contenedorUsuario,
        'nombresUsuario',
      ) ?? 'Usuario',
    apellidosUsuario:
      obtenerCadena(
        contenedorUsuario,
        'apellidosUsuario',
      ) ?? '',
    correoUsuario,
    rolUsuario,
    fkAerolineaUsuario: obtenerNumero(
      contenedorUsuario,
      'fkAerolineaUsuario',
    ),
    nombreAerolinea,
  }
}

function obtenerEtiquetaRol(rolUsuario: RolUsuario): string {
  switch (rolUsuario) {
    case 'SUPERADMIN':
      return 'Superadministrador'
    case 'ADMIN_AEROLINEA':
      return 'Administrador de aerolínea'
    case 'EMPLEADO':
      return 'Empleado'
    default:
      return rolUsuario.replaceAll('_', ' ')
  }
}

function obtenerIniciales(usuario: UsuarioSesion): string {
  const primeraInicial =
    usuario.nombresUsuario.trim().charAt(0)
  const segundaInicial =
    usuario.apellidosUsuario.trim().charAt(0)

  return `${primeraInicial}${segundaInicial || primeraInicial}`
    .toUpperCase()
}

function obtenerNombreAerolinea(
  usuario: UsuarioSesion,
): string {
  if (usuario.rolUsuario === 'SUPERADMIN') {
    return 'Administración global'
  }

  if (usuario.nombreAerolinea) {
    return usuario.nombreAerolinea
  }

  if (usuario.fkAerolineaUsuario !== null) {
    return `Aerolínea #${usuario.fkAerolineaUsuario}`
  }

  return 'Aerolínea no asignada'
}

const modulosSistema: Modulo[] = [
  {
    id: 'panel',
    nombre: 'Panel principal',
    descripcion:
      'Resumen de sesión, alcance de datos y acceso a los módulos.',
    icono: 'panel',
  },
  {
    id: 'planes',
    nombre: 'Planes',
    descripcion:
      'Configuración de límites y características de los planes SaaS.',
    icono: 'plan',
  },
  {
    id: 'aerolineas',
    nombre: 'Aerolíneas',
    descripcion:
      'Administración de los tenants registrados en la plataforma.',
    icono: 'aerolinea',
  },
  {
    id: 'suscripciones',
    nombre: 'Suscripciones',
    descripcion:
      'Control de vigencia, estado y plan contratado por cada aerolínea.',
    icono: 'suscripcion',
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion:
      'Gestión de administradores, empleados, roles y estados.',
    icono: 'usuario',
  },
  {
    id: 'aviones',
    nombre: 'Aviones',
    descripcion:
      'Registro de aeronaves, capacidad y estado operativo.',
    icono: 'avion',
  },
  {
    id: 'aeropuertos',
    nombre: 'Aeropuertos',
    descripcion:
      'Catálogo global de aeropuertos utilizados por las rutas.',
    icono: 'aeropuerto',
  },
  {
    id: 'rutas',
    nombre: 'Rutas',
    descripcion:
      'Conexiones entre aeropuertos pertenecientes a cada aerolínea.',
    icono: 'ruta',
  },
  {
    id: 'vuelos',
    nombre: 'Vuelos',
    descripcion:
      'Programación de vuelos, horarios, aviones y estados.',
    icono: 'vuelo',
  },
  {
    id: 'pasajeros',
    nombre: 'Pasajeros',
    descripcion:
      'Registro de información personal y documentos de pasajeros.',
    icono: 'pasajero',
  },
  {
    id: 'reservas',
    nombre: 'Reservas',
    descripcion:
      'Gestión de reservas, capacidad y pasajeros por vuelo.',
    icono: 'reserva',
  },
  {
    id: 'boletos',
    nombre: 'Boletos',
    descripcion:
      'Emisión de boletos, asignación de asientos y estados.',
    icono: 'boleto',
  },
]

function obtenerModulosPorRol(
  rolUsuario: RolUsuario,
): Modulo[] {
  if (rolUsuario === 'SUPERADMIN') {
    return modulosSistema
  }

  if (rolUsuario === 'ADMIN_AEROLINEA') {
    const permitidos = new Set([
      'panel',
      'usuarios',
      'aviones',
      'aeropuertos',
      'rutas',
      'vuelos',
      'pasajeros',
      'reservas',
      'boletos',
    ])

    return modulosSistema.filter((modulo) =>
      permitidos.has(modulo.id),
    )
  }

  const permitidosEmpleado = new Set([
    'panel',
    'aviones',
    'aeropuertos',
    'rutas',
    'vuelos',
    'pasajeros',
    'reservas',
    'boletos',
  ])

  return modulosSistema.filter((modulo) =>
    permitidosEmpleado.has(modulo.id),
  )
}

function PantallaCarga() {
  return (
    <main className="pantalla-carga">
      <div className="marca-carga">
        <div className="logo-sistema logo-sistema--grande">
          <Icono nombre="avion" tamano={29} />
        </div>

        <div>
          <strong>AeroSaaS</strong>
          <span>Verificando sesión segura</span>
        </div>
      </div>

      <div className="cargador" aria-label="Cargando">
        <span />
        <span />
        <span />
      </div>
    </main>
  )
}

function PantallaLogin({
  avisoSesion,
  onAutenticado,
}: PantallaLoginProps) {
  const [correoUsuario, setCorreoUsuario] = useState('')
  const [contrasenaUsuario, setContrasenaUsuario] =
    useState('')
  const [mostrarContrasena, setMostrarContrasena] =
    useState(false)
  const [procesando, setProcesando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  async function iniciarSesion(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault()
    setMensajeError('')
    setProcesando(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correoUsuario,
          contrasenaUsuario,
        }),
      })

      const respuesta = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(
          obtenerMensajeApi(
            respuesta,
            'No fue posible iniciar sesión.',
          ),
        )
      }

      const token = extraerToken(respuesta)

      if (!token) {
        throw new Error(
          'El backend no devolvió un token de acceso válido.',
        )
      }

      setContrasenaUsuario('')
      onAutenticado(token)
    } catch (error: unknown) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.',
      )
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="login">
      <section className="login-presentacion">
        <div className="login-presentacion__contenido">
          <div className="marca">
            <div className="logo-sistema">
              <Icono nombre="avion" tamano={24} />
            </div>

            <div className="marca__texto">
              <strong>AeroSaaS</strong>
              <span>Gestión integral de aerolíneas</span>
            </div>
          </div>

          <div className="login-mensaje">
            <span className="etiqueta-producto">
              Plataforma SaaS multi-tenant
            </span>

            <h1>
              Operaciones aéreas
              <span> bajo control.</span>
            </h1>

            <p>
              Administra vuelos, rutas, pasajeros y reservas
              desde una plataforma centralizada y segura.
            </p>
          </div>

          <div className="ilustracion-aerea">
            <svg
              viewBox="0 0 640 340"
              role="presentation"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="rutaGradiente"
                  x1="0"
                  x2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(255,255,255,0.15)"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgba(73,219,225,0.9)"
                  />
                </linearGradient>
              </defs>

              <circle
                cx="96"
                cy="244"
                r="9"
                className="punto-ruta"
              />
              <circle
                cx="530"
                cy="84"
                r="9"
                className="punto-ruta"
              />

              <path
                d="M96 244C210 102 380 258 530 84"
                className="linea-ruta"
                stroke="url(#rutaGradiente)"
              />

              <g
                className="avion-ilustracion"
                transform="translate(345 146) rotate(-22)"
              >
                <path d="M0 18 88 0 58 57 39 36 9 46z" />
                <path d="m39 36 23-22" />
              </g>

              <path
                d="M30 292h580"
                className="linea-horizonte"
              />
            </svg>

            <div className="dato-flotante dato-flotante--uno">
              <Icono nombre="escudo" tamano={19} />
              <div>
                <strong>Acceso seguro</strong>
                <span>Autenticación con JWT</span>
              </div>
            </div>

            <div className="dato-flotante dato-flotante--dos">
              <Icono nombre="nube" tamano={19} />
              <div>
                <strong>Datos aislados</strong>
                <span>Un tenant por aerolínea</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-acceso">
        <div className="login-acceso__contenedor">
          <div className="marca marca--movil">
            <div className="logo-sistema">
              <Icono nombre="avion" tamano={24} />
            </div>

            <div className="marca__texto">
              <strong>AeroSaaS</strong>
              <span>Gestión integral de aerolíneas</span>
            </div>
          </div>

          <div className="encabezado-formulario">
            <span className="encabezado-formulario__indicador">
              Acceso al sistema
            </span>

            <h2>Iniciar sesión</h2>

            <p>
              Ingresa tus credenciales para acceder a tu
              espacio de trabajo.
            </p>
          </div>

          <form
            className="formulario-login"
            onSubmit={iniciarSesion}
          >
            <label className="grupo-campo">
              <span>Correo electrónico</span>

              <div className="campo-con-icono">
                <Icono nombre="correo" tamano={20} />

                <input
                  type="email"
                  value={correoUsuario}
                  onChange={(evento) =>
                    setCorreoUsuario(evento.target.value)
                  }
                  placeholder="usuario@aerolinea.com"
                  autoComplete="email"
                  required
                  disabled={procesando}
                />
              </div>
            </label>

            <label className="grupo-campo">
              <span>Contraseña</span>

              <div className="campo-con-icono">
                <Icono nombre="candado" tamano={20} />

                <input
                  type={
                    mostrarContrasena ? 'text' : 'password'
                  }
                  value={contrasenaUsuario}
                  onChange={(evento) =>
                    setContrasenaUsuario(
                      evento.target.value,
                    )
                  }
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  disabled={procesando}
                />

                <button
                  type="button"
                  className="boton-visibilidad"
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
                    tamano={20}
                  />
                </button>
              </div>
            </label>

            {(mensajeError || avisoSesion) && (
              <div className="mensaje-error" role="alert">
                <span>!</span>
                <p>{mensajeError || avisoSesion}</p>
              </div>
            )}

            <button
              type="submit"
              className="boton-principal"
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <span className="spinner" />
                  Verificando credenciales
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <Icono nombre="flecha" tamano={20} />
                </>
              )}
            </button>
          </form>

          <div className="seguridad-login">
            <Icono nombre="escudo" tamano={18} />
            <span>
              Tus credenciales se transmiten mediante una
              conexión protegida.
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

function PanelPrincipal({
  usuario,
  token,
  onCerrarSesion,
  onContrasenaCambiada,
}: PanelPrincipalProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const [
    cambiarContrasenaAbierto,
    setCambiarContrasenaAbierto,
  ] = useState(false)
  const [seccionActiva, setSeccionActiva] =
    useState('panel')

  const modulos = useMemo(
    () => obtenerModulosPorRol(usuario.rolUsuario),
    [usuario.rolUsuario],
  )

  const moduloActivo =
    modulos.find(
      (modulo) => modulo.id === seccionActiva,
    ) ?? modulos[0]

  const fechaActual = new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  function seleccionarModulo(idModulo: string) {
    setSeccionActiva(idModulo)
    setMenuAbierto(false)
    setPerfilAbierto(false)
  }

  return (
    <div className="aplicacion">
      <button
        type="button"
        className={`fondo-menu-movil ${menuAbierto
          ? 'fondo-menu-movil--visible'
          : ''
          }`}
        onClick={() => setMenuAbierto(false)}
        aria-label="Cerrar menú"
      />

      <aside
        className={`barra-lateral ${menuAbierto ? 'barra-lateral--abierta' : ''
          }`}
      >
        <div className="barra-lateral__marca">
          <div className="logo-sistema">
            <Icono nombre="avion" tamano={23} />
          </div>

          <div className="marca__texto">
            <strong>AeroSaaS</strong>
            <span>Control aeronáutico</span>
          </div>
        </div>

        <nav
          className="navegacion"
          aria-label="Navegación principal"
        >
          <span className="navegacion__titulo">
            Menú principal
          </span>

          {modulos.map((modulo) => (
            <button
              key={modulo.id}
              type="button"
              className={`navegacion__opcion ${moduloActivo.id === modulo.id
                ? 'navegacion__opcion--activa'
                : ''
                }`}
              onClick={() =>
                seleccionarModulo(modulo.id)
              }
            >
              <span className="navegacion__icono">
                <Icono
                  nombre={modulo.icono}
                  tamano={20}
                />
              </span>

              <span>{modulo.nombre}</span>
            </button>
          ))}
        </nav>

        <div className="barra-lateral__estado">
          <span className="estado-conexion">
            <span className="estado-conexion__punto" />
            Backend conectado
          </span>

          <small>API: localhost:3000</small>
        </div>
      </aside>

      <div className="contenido-aplicacion">
        <header className="barra-superior">
          <div className="barra-superior__izquierda">
            <button
              type="button"
              className="boton-menu"
              onClick={() =>
                setMenuAbierto(
                  (estadoActual) => !estadoActual,
                )
              }
              aria-label="Abrir menú"
            >
              <Icono nombre="menu" tamano={23} />
            </button>

            <div>
              <span className="ruta-actual">
                AeroSaaS / {moduloActivo.nombre}
              </span>
              <h1>{moduloActivo.nombre}</h1>
            </div>
          </div>

          <div className="perfil">
            <button
              type="button"
              className="perfil__boton"
              onClick={() =>
                setPerfilAbierto(
                  (estadoActual) => !estadoActual,
                )
              }
              aria-expanded={perfilAbierto}
            >
              <span className="avatar">
                {obtenerIniciales(usuario)}
              </span>

              <span className="perfil__datos">
                <strong>
                  {usuario.nombresUsuario}{' '}
                  {usuario.apellidosUsuario}
                </strong>
                <small>
                  {obtenerEtiquetaRol(
                    usuario.rolUsuario,
                  )}
                </small>
              </span>

              <span className="perfil__flecha">⌄</span>
            </button>

            {perfilAbierto && (
              <div className="perfil__menu">
                <div className="perfil__resumen">
                  <span className="avatar avatar--grande">
                    {obtenerIniciales(usuario)}
                  </span>

                  <div>
                    <strong>
                      {usuario.nombresUsuario}{' '}
                      {usuario.apellidosUsuario}
                    </strong>
                    <span>{usuario.correoUsuario}</span>
                  </div>
                </div>

                <div className="perfil__aerolinea">
                  <span>Aerolínea</span>
                  <strong>
                    {obtenerNombreAerolinea(usuario)}
                  </strong>
                </div>

                <button
                  type="button"
                  className="boton-cambiar-contrasena"
                  onClick={() => {
                    setPerfilAbierto(false)
                    setCambiarContrasenaAbierto(true)
                  }}
                >
                  <Icono nombre="candado" tamano={19} />
                  Cambiar contraseña
                </button>

                <button
                  type="button"
                  className="boton-cerrar-sesion"
                  onClick={onCerrarSesion}
                >
                  <Icono nombre="salir" tamano={19} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="contenido-principal">
          {moduloActivo.id === 'panel' ? (
            <>
              <section className="bienvenida">
                <div className="bienvenida__texto">
                  <span className="bienvenida__fecha">
                    {fechaActual}
                  </span>

                  <h2>
                    Bienvenido, {usuario.nombresUsuario}
                  </h2>

                  <p>
                    Tu sesión está activa. Los módulos
                    visibles corresponden a los permisos de
                    tu rol.
                  </p>
                </div>

                <div className="bienvenida__grafico">
                  <div className="orbita orbita--uno" />
                  <div className="orbita orbita--dos" />

                  <div className="avion-panel">
                    <Icono nombre="avion" tamano={53} />
                  </div>
                </div>
              </section>

              <section className="tarjetas-resumen">
                <article className="tarjeta-resumen">
                  <div className="tarjeta-resumen__icono">
                    <Icono nombre="usuario" tamano={23} />
                  </div>

                  <div>
                    <span>Rol actual</span>
                    <strong>
                      {obtenerEtiquetaRol(
                        usuario.rolUsuario,
                      )}
                    </strong>
                  </div>
                </article>

                <article className="tarjeta-resumen">
                  <div className="tarjeta-resumen__icono">
                    <Icono
                      nombre="aerolinea"
                      tamano={23}
                    />
                  </div>

                  <div>
                    <span>Espacio de trabajo</span>
                    <strong>
                      {obtenerNombreAerolinea(usuario)}
                    </strong>
                  </div>
                </article>

                <article className="tarjeta-resumen">
                  <div className="tarjeta-resumen__icono">
                    <Icono nombre="escudo" tamano={23} />
                  </div>

                  <div>
                    <span>Alcance de datos</span>
                    <strong>
                      {usuario.rolUsuario === 'SUPERADMIN'
                        ? 'Todos los tenants'
                        : 'Solo tu aerolínea'}
                    </strong>
                  </div>
                </article>

                <article className="tarjeta-resumen">
                  <div className="tarjeta-resumen__icono">
                    <Icono nombre="nube" tamano={23} />
                  </div>

                  <div>
                    <span>Estado de sesión</span>
                    <strong className="texto-activo">
                      Conectado
                    </strong>
                  </div>
                </article>
              </section>

              <section className="panel-informativo">
                <div className="panel-informativo__encabezado">
                  <div>
                    <span className="subtitulo-seccion">
                      Arquitectura del sistema
                    </span>
                    <h3>Protecciones activas</h3>
                  </div>

                  <span className="insignia-seguridad">
                    <Icono nombre="escudo" tamano={17} />
                    Sesión verificada
                  </span>
                </div>

                <div className="protecciones">
                  <article>
                    <span className="protecciones__numero">
                      01
                    </span>
                    <div>
                      <strong>Autenticación JWT</strong>
                      <p>
                        El backend valida el token antes de
                        permitir el acceso.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span className="protecciones__numero">
                      02
                    </span>
                    <div>
                      <strong>Aislamiento multi-tenant</strong>
                      <p>
                        Los datos se filtran según la
                        aerolínea del usuario.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span className="protecciones__numero">
                      03
                    </span>
                    <div>
                      <strong>Permisos por rol</strong>
                      <p>
                        Cada rol visualiza únicamente las
                        funciones autorizadas.
                      </p>
                    </div>
                  </article>
                </div>
              </section>
            </>


          ) : moduloActivo.id === 'aeropuertos' ? (
            <AeropuertosModulo
              token={token}
              rolUsuario={usuario.rolUsuario}
              onSesionExpirada={onCerrarSesion}
            />
          ) : moduloActivo.id === 'rutas' ? (
            <RutasModulo
              token={token}
              rolUsuario={usuario.rolUsuario}
              nombreAerolinea={obtenerNombreAerolinea(usuario)}
              onSesionExpirada={onCerrarSesion}
            />
          ) : moduloActivo.id === 'vuelos' ? (
            <VuelosModulo
              token={token}
              rolUsuario={usuario.rolUsuario}
              nombreAerolinea={obtenerNombreAerolinea(usuario)}
              onSesionExpirada={onCerrarSesion}
            />
          ) : moduloActivo.id === 'pasajeros' ? (
            <PasajerosModulo
              token={token}
              rolUsuario={usuario.rolUsuario}
              nombreAerolinea={obtenerNombreAerolinea(usuario)}
              onSesionExpirada={onCerrarSesion}
            />
          ) : (

            <section className="modulo-en-construccion">
              <div className="modulo-en-construccion__icono">
                <Icono
                  nombre={moduloActivo.icono}
                  tamano={42}
                />
              </div>

              <span className="subtitulo-seccion">
                Módulo seleccionado
              </span>

              <h2>{moduloActivo.nombre}</h2>

              <p>{moduloActivo.descripcion}</p>

              <div className="aviso-proxima-etapa">
                <span>Próxima etapa</span>
                <strong>
                  Conectar tablas y formularios con la API.
                </strong>
              </div>
            </section>
          )}
        </main>
      </div>

      {cambiarContrasenaAbierto && (
        <CambiarContrasenaModal
          token={token}
          onCerrar={() =>
            setCambiarContrasenaAbierto(false)
          }
          onSesionExpirada={onCerrarSesion}
          onCambioExitoso={onContrasenaCambiada}
        />
      )}
    </div>
  )
}

function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(TOKEN_STORAGE_KEY),
  )

  const [usuario, setUsuario] =
    useState<UsuarioSesion | null>(null)

  const [estadoSesion, setEstadoSesion] =
    useState<EstadoSesion>(
      token ? 'verificando' : 'sin-sesion',
    )

  const [avisoSesion, setAvisoSesion] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    const controlador = new AbortController()

    async function cargarPerfil() {
      try {
        const response = await fetch(
          `${API_URL}/auth/perfil`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controlador.signal,
          },
        )

        const respuesta = await leerRespuesta(response)

        if (!response.ok) {
          throw new Error(
            obtenerMensajeApi(
              respuesta,
              'La sesión no es válida o expiró.',
            ),
          )
        }

        const usuarioNormalizado =
          normalizarUsuario(respuesta)

        if (!usuarioNormalizado) {
          throw new Error(
            'No fue posible interpretar los datos del perfil.',
          )
        }

        setUsuario(usuarioNormalizado)
        setEstadoSesion('autenticado')
        setAvisoSesion('')
      } catch (error: unknown) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setUsuario(null)
        setEstadoSesion('sin-sesion')
        setAvisoSesion(
          error instanceof Error
            ? error.message
            : 'La sesión no pudo verificarse.',
        )
      }
    }

    void cargarPerfil()

    return () => {
      controlador.abort()
    }
  }, [token])

  function guardarToken(nuevoToken: string) {
    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      nuevoToken,
    )

    setAvisoSesion('')
    setEstadoSesion('verificando')
    setToken(nuevoToken)
  }

  function cerrarSesion() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUsuario(null)
    setAvisoSesion('')
    setEstadoSesion('sin-sesion')
  }

  function cerrarSesionPorCambioContrasena() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUsuario(null)
    setAvisoSesion(
      'Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.',
    )
    setEstadoSesion('sin-sesion')
  }

  if (estadoSesion === 'verificando') {
    return <PantallaCarga />
  }

  if (
    estadoSesion === 'autenticado' &&
    usuario !== null &&
    token !== null
  ) {
    return (
      <PanelPrincipal
        usuario={usuario}
        token={token}
        onCerrarSesion={cerrarSesion}
        onContrasenaCambiada={
          cerrarSesionPorCambioContrasena
        }
      />
    )
  }

  return (
    <PantallaLogin
      avisoSesion={avisoSesion}
      onAutenticado={guardarToken}
    />
  )
}

export default App
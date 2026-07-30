/* saas-frontend/src/modules/aeropuertos/AeropuertosModulo.tsx */
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './AeropuertosModulo.css'

const API_URL = 'http://localhost:3000/api'

type EstadoAeropuerto = 'ACTIVO' | 'INACTIVO'
type FiltroEstado = 'TODOS' | EstadoAeropuerto

type IconoNombre =
    | 'aeropuerto'
    | 'buscar'
    | 'agregar'
    | 'editar'
    | 'eliminar'
    | 'actualizar'
    | 'cerrar'
    | 'informacion'
    | 'alerta'
    | 'ubicacion'

interface Aeropuerto {
    idAeropuerto: number
    codigoIataAeropuerto: string
    codigoIcaoAeropuerto: string
    nombreAeropuerto: string
    ciudadAeropuerto: string
    paisAeropuerto: string
    zonaHorariaAeropuerto: string
    estadoAeropuerto: EstadoAeropuerto
}

interface FormularioAeropuerto {
    codigoIataAeropuerto: string
    codigoIcaoAeropuerto: string
    nombreAeropuerto: string
    ciudadAeropuerto: string
    paisAeropuerto: string
    zonaHorariaAeropuerto: string
    estadoAeropuerto: EstadoAeropuerto
}

interface AeropuertosModuloProps {
    token: string
    rolUsuario: string
    onSesionExpirada: () => void
}

class SesionExpiradaError extends Error { }

const formularioInicial: FormularioAeropuerto = {
    codigoIataAeropuerto: '',
    codigoIcaoAeropuerto: '',
    nombreAeropuerto: '',
    ciudadAeropuerto: '',
    paisAeropuerto: 'Ecuador',
    zonaHorariaAeropuerto: 'America/Guayaquil',
    estadoAeropuerto: 'ACTIVO',
}

function Icono({ nombre, tamano = 20 }: { nombre: IconoNombre; tamano?: number }) {
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
        case 'aeropuerto':
            return <svg {...props}><path d="M8 21h8M10 21l1-11h2l1 11" /><path d="M9 10h6l-1-4h-4zM6 14h4M14 14h4" /><path d="M5 6h3M16 6h3" /></svg>
        case 'buscar':
            return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        case 'agregar':
            return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>
        case 'editar':
            return <svg {...props}><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2z" /><path d="m14.5 7.1 2.8 2.8" /></svg>
        case 'eliminar':
            return <svg {...props}><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /><path d="M10 11v5M14 11v5" /></svg>
        case 'actualizar':
            return <svg {...props}><path d="M20 7v5h-5" /><path d="M18.5 16a8 8 0 1 1 .8-8" /></svg>
        case 'cerrar':
            return <svg {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>
        case 'informacion':
            return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
        case 'alerta':
            return <svg {...props}><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5M12 17h.01" /></svg>
        case 'ubicacion':
            return <svg {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0" /><circle cx="12" cy="10" r="2.5" /></svg>
    }
}

async function leerRespuesta(response: Response): Promise<unknown> {
    const texto = await response.text()
    if (!texto) return null

    try {
        return JSON.parse(texto) as unknown
    } catch {
        return texto
    }
}

function obtenerMensaje(respuesta: unknown, alternativo: string): string {
    if (typeof respuesta !== 'object' || respuesta === null) return alternativo

    const objeto = respuesta as Record<string, unknown>
    if (typeof objeto.message === 'string') return objeto.message
    if (Array.isArray(objeto.message)) return objeto.message.join('. ')
    if (typeof objeto.error === 'string') return objeto.error
    return alternativo
}

async function solicitar<T>(
    ruta: string,
    token: string,
    opciones: RequestInit = {},
): Promise<T> {
    const headers = new Headers(opciones.headers)
    headers.set('Authorization', `Bearer ${token}`)
    if (opciones.body !== undefined) headers.set('Content-Type', 'application/json')

    const response = await fetch(`${API_URL}${ruta}`, { ...opciones, headers })
    const respuesta = await leerRespuesta(response)

    if (response.status === 401) throw new SesionExpiradaError()
    if (!response.ok) {
        throw new Error(obtenerMensaje(respuesta, 'No fue posible completar la operación.'))
    }

    return respuesta as T
}

function normalizarBusqueda(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')
}

function ordenarAeropuertos(lista: Aeropuerto[]): Aeropuerto[] {
    return [...lista].sort((a, b) =>
        a.codigoIataAeropuerto.localeCompare(b.codigoIataAeropuerto, 'es'),
    )
}

export function AeropuertosModulo({
    token,
    rolUsuario,
    onSesionExpirada,
}: AeropuertosModuloProps) {
    const [aeropuertos, setAeropuertos] = useState<Aeropuerto[]>([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')
    const [mensajeExito, setMensajeExito] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS')
    const [formularioAbierto, setFormularioAbierto] = useState(false)
    const [aeropuertoEdicion, setAeropuertoEdicion] = useState<Aeropuerto | null>(null)
    const [formulario, setFormulario] = useState<FormularioAeropuerto>(formularioInicial)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [aeropuertoEliminar, setAeropuertoEliminar] = useState<Aeropuerto | null>(null)

    const puedeGestionar = rolUsuario === 'SUPERADMIN'

    useEffect(() => {
        const controlador = new AbortController()
        let activo = true

        solicitar<Aeropuerto[]>('/aeropuertos', token, { signal: controlador.signal })
            .then((lista) => {
                if (!activo) return
                setAeropuertos(ordenarAeropuertos(lista))
                setMensajeError('')
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return
                if (error instanceof SesionExpiradaError) {
                    onSesionExpirada()
                    return
                }
                if (activo) {
                    setMensajeError(error instanceof Error ? error.message : 'No fue posible cargar los aeropuertos.')
                }
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
            controlador.abort()
        }
    }, [token, onSesionExpirada])

    useEffect(() => {
        if (!mensajeExito) return
        const temporizador = window.setTimeout(() => setMensajeExito(''), 3500)
        return () => window.clearTimeout(temporizador)
    }, [mensajeExito])

    const aeropuertosFiltrados = useMemo(() => {
        const texto = normalizarBusqueda(busqueda.trim())

        return aeropuertos.filter((aeropuerto) => {
            if (filtroEstado !== 'TODOS' && aeropuerto.estadoAeropuerto !== filtroEstado) return false
            if (!texto) return true

            return normalizarBusqueda([
                aeropuerto.codigoIataAeropuerto,
                aeropuerto.codigoIcaoAeropuerto,
                aeropuerto.nombreAeropuerto,
                aeropuerto.ciudadAeropuerto,
                aeropuerto.paisAeropuerto,
                aeropuerto.zonaHorariaAeropuerto,
            ].join(' ')).includes(texto)
        })
    }, [aeropuertos, busqueda, filtroEstado])

    const resumen = useMemo(() => {
        const activos = aeropuertos.filter((a) => a.estadoAeropuerto === 'ACTIVO').length
        const paises = new Set(aeropuertos.map((a) => a.paisAeropuerto.toLowerCase())).size
        return { total: aeropuertos.length, activos, inactivos: aeropuertos.length - activos, paises }
    }, [aeropuertos])

    async function recargar() {
        setCargando(true)
        setMensajeError('')

        try {
            const lista = await solicitar<Aeropuerto[]>('/aeropuertos', token)
            setAeropuertos(ordenarAeropuertos(lista))
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) return onSesionExpirada()
            setMensajeError(error instanceof Error ? error.message : 'No fue posible cargar los aeropuertos.')
        } finally {
            setCargando(false)
        }
    }

    function abrirCreacion() {
        setAeropuertoEdicion(null)
        setFormulario(formularioInicial)
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function abrirEdicion(aeropuerto: Aeropuerto) {
        setAeropuertoEdicion(aeropuerto)
        setFormulario({
            codigoIataAeropuerto: aeropuerto.codigoIataAeropuerto,
            codigoIcaoAeropuerto: aeropuerto.codigoIcaoAeropuerto,
            nombreAeropuerto: aeropuerto.nombreAeropuerto,
            ciudadAeropuerto: aeropuerto.ciudadAeropuerto,
            paisAeropuerto: aeropuerto.paisAeropuerto,
            zonaHorariaAeropuerto: aeropuerto.zonaHorariaAeropuerto,
            estadoAeropuerto: aeropuerto.estadoAeropuerto,
        })
        setErrorFormulario('')
        setFormularioAbierto(true)
    }

    function cerrarFormulario() {
        if (guardando) return
        setFormularioAbierto(false)
        setAeropuertoEdicion(null)
        setErrorFormulario('')
    }

    function cambiarCampo<K extends keyof FormularioAeropuerto>(
        campo: K,
        valor: FormularioAeropuerto[K],
    ) {
        setFormulario((actual) => ({ ...actual, [campo]: valor }))
    }

    function validarFormulario(): string | null {
        if (!/^[A-Z]{3}$/.test(formulario.codigoIataAeropuerto)) return 'El código IATA debe tener exactamente 3 letras.'
        if (!/^[A-Z]{4}$/.test(formulario.codigoIcaoAeropuerto)) return 'El código ICAO debe tener exactamente 4 letras.'
        if (formulario.nombreAeropuerto.trim().length < 3) return 'El nombre debe contener al menos 3 caracteres.'
        if (formulario.ciudadAeropuerto.trim().length < 2) return 'La ciudad debe contener al menos 2 caracteres.'
        if (formulario.paisAeropuerto.trim().length < 2) return 'El país debe contener al menos 2 caracteres.'
        if (!/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+-]+)+$/.test(formulario.zonaHorariaAeropuerto.trim())) {
            return 'La zona horaria debe tener un formato como America/Guayaquil.'
        }
        return null
    }

    async function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        const errorValidacion = validarFormulario()
        if (errorValidacion) return setErrorFormulario(errorValidacion)

        setGuardando(true)
        setErrorFormulario('')

        const datos = {
            ...formulario,
            nombreAeropuerto: formulario.nombreAeropuerto.trim(),
            ciudadAeropuerto: formulario.ciudadAeropuerto.trim(),
            paisAeropuerto: formulario.paisAeropuerto.trim(),
            zonaHorariaAeropuerto: formulario.zonaHorariaAeropuerto.trim(),
        }

        try {
            const esEdicion = aeropuertoEdicion !== null
            const aeropuertoGuardado = await solicitar<Aeropuerto>(
                esEdicion ? `/aeropuertos/${aeropuertoEdicion.idAeropuerto}` : '/aeropuertos',
                token,
                { method: esEdicion ? 'PATCH' : 'POST', body: JSON.stringify(datos) },
            )

            setAeropuertos((lista) => ordenarAeropuertos([
                ...lista.filter((a) => a.idAeropuerto !== aeropuertoGuardado.idAeropuerto),
                aeropuertoGuardado,
            ]))
            setFormularioAbierto(false)
            setAeropuertoEdicion(null)
            setMensajeExito(esEdicion ? 'Aeropuerto actualizado correctamente.' : 'Aeropuerto registrado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) return onSesionExpirada()
            setErrorFormulario(error instanceof Error ? error.message : 'No fue posible guardar el aeropuerto.')
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        if (!aeropuertoEliminar) return
        setEliminando(true)
        setMensajeError('')

        try {
            await solicitar(`/aeropuertos/${aeropuertoEliminar.idAeropuerto}`, token, { method: 'DELETE' })
            setAeropuertos((lista) => lista.filter((a) => a.idAeropuerto !== aeropuertoEliminar.idAeropuerto))
            setAeropuertoEliminar(null)
            setMensajeExito('Aeropuerto eliminado correctamente.')
        } catch (error: unknown) {
            if (error instanceof SesionExpiradaError) return onSesionExpirada()
            setMensajeError(error instanceof Error ? error.message : 'No fue posible eliminar el aeropuerto.')
            setAeropuertoEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <section className="aeropuertos-modulo">
            <header className="aeropuertos-cabecera">
                <div className="aeropuertos-cabecera__texto">
                    <span className="aeropuertos-etiqueta">Catálogo global</span>
                    <h2>Gestión de Aeropuertos</h2>
                    <p>Consulta los aeropuertos disponibles para construir rutas y programar vuelos.</p>
                </div>

                <div className="aeropuertos-cabecera__acciones">
                    <button type="button" className="aeropuertos-boton-secundario" onClick={() => void recargar()} disabled={cargando}>
                        <Icono nombre="actualizar" /> ACTUALIZAR
                    </button>
                    {puedeGestionar && (
                        <button type="button" className="aeropuertos-boton-principal" onClick={abrirCreacion}>
                            <Icono nombre="agregar" /> NUEVO AEROPUERTO
                        </button>
                    )}
                </div>
            </header>

            {!puedeGestionar && (
                <div className="aeropuertos-aviso-lectura">
                    <Icono nombre="informacion" tamano={21} />
                    <div>
                        <strong>Catálogo en modo consulta</strong>
                        <span>Los aeropuertos son globales. Solo el SUPERADMIN puede crearlos, modificarlos o eliminarlos.</span>
                    </div>
                </div>
            )}

            {mensajeExito && <div className="aeropuertos-mensaje aeropuertos-mensaje--exito"><span>✓</span>{mensajeExito}</div>}
            {mensajeError && !cargando && <div className="aeropuertos-mensaje aeropuertos-mensaje--error"><Icono nombre="alerta" tamano={19} /><span>{mensajeError}</span></div>}

            <div className="aeropuertos-resumen">
                <article><span>Total registrados</span><strong>{resumen.total}</strong><small>Catálogo disponible</small></article>
                <article><span>Operativos</span><strong>{resumen.activos}</strong><small className="aeropuertos-texto-activo">Estado ACTIVO</small></article>
                <article><span>No operativos</span><strong>{resumen.inactivos}</strong><small>Estado INACTIVO</small></article>
                <article><span>Países</span><strong>{resumen.paises}</strong><small>Cobertura del catálogo</small></article>
            </div>

            <section className="aeropuertos-panel">
                <div className="aeropuertos-herramientas">
                    <div className="aeropuertos-buscador">
                        <Icono nombre="buscar" tamano={19} />
                        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por código, nombre, ciudad o país" aria-label="Buscar aeropuertos" />
                    </div>

                    <label className="aeropuertos-filtro">
                        <span>Estado</span>
                        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}>
                            <option value="TODOS">Todos</option>
                            <option value="ACTIVO">Activos</option>
                            <option value="INACTIVO">Inactivos</option>
                        </select>
                    </label>

                    <span className="aeropuertos-resultados">{aeropuertosFiltrados.length} {aeropuertosFiltrados.length === 1 ? 'resultado' : 'resultados'}</span>
                </div>

                {cargando ? (
                    <div className="aeropuertos-estado-vacio">
                        <span className="aeropuertos-cargador" />
                        <strong>Cargando aeropuertos</strong>
                        <p>Consultando el catálogo global del sistema.</p>
                    </div>
                ) : aeropuertosFiltrados.length === 0 ? (
                    <div className="aeropuertos-estado-vacio">
                        <div className="aeropuertos-estado-vacio__icono"><Icono nombre="aeropuerto" tamano={36} /></div>
                        <strong>{aeropuertos.length === 0 ? 'No existen aeropuertos registrados' : 'No se encontraron coincidencias'}</strong>
                        <p>{aeropuertos.length === 0 ? 'El catálogo todavía está vacío.' : 'Prueba con otro texto o cambia el filtro de estado.'}</p>
                        {puedeGestionar && aeropuertos.length === 0 && (
                            <button type="button" className="aeropuertos-boton-principal" onClick={abrirCreacion}><Icono nombre="agregar" /> Registrar el primero</button>
                        )}
                    </div>
                ) : (
                    <div className="aeropuertos-tabla-contenedor">
                        <table className="aeropuertos-tabla">
                            <thead><tr><th>Códigos</th><th>Aeropuerto</th><th>Ubicación</th><th>Zona horaria</th><th>Estado</th>{puedeGestionar && <th className="aeropuertos-columna-acciones">Acciones</th>}</tr></thead>
                            <tbody>
                                {aeropuertosFiltrados.map((aeropuerto) => (
                                    <tr key={aeropuerto.idAeropuerto}>
                                        <td data-label="Códigos"><div className="aeropuertos-codigos"><strong>{aeropuerto.codigoIataAeropuerto}</strong><span>{aeropuerto.codigoIcaoAeropuerto}</span></div></td>
                                        <td data-label="Aeropuerto"><div className="aeropuertos-nombre"><span className="aeropuertos-nombre__icono"><Icono nombre="aeropuerto" tamano={19} /></span><div><strong>{aeropuerto.nombreAeropuerto}</strong><small>ID #{aeropuerto.idAeropuerto}</small></div></div></td>
                                        <td data-label="Ubicación"><div className="aeropuertos-ubicacion"><Icono nombre="ubicacion" tamano={17} /><div><strong>{aeropuerto.ciudadAeropuerto}</strong><span>{aeropuerto.paisAeropuerto}</span></div></div></td>
                                        <td data-label="Zona horaria"><span className="aeropuertos-zona-horaria">{aeropuerto.zonaHorariaAeropuerto}</span></td>
                                        <td data-label="Estado"><span className={`aeropuertos-estado aeropuertos-estado--${aeropuerto.estadoAeropuerto.toLowerCase()}`}><span />{aeropuerto.estadoAeropuerto}</span></td>
                                        {puedeGestionar && (
                                            <td data-label="Acciones"><div className="aeropuertos-acciones-fila">
                                                <button type="button" className="aeropuertos-boton-icono" onClick={() => abrirEdicion(aeropuerto)} aria-label={`Editar ${aeropuerto.codigoIataAeropuerto}`} title="Editar aeropuerto"><Icono nombre="editar" tamano={18} /></button>
                                                <button type="button" className="aeropuertos-boton-icono aeropuertos-boton-icono--peligro" onClick={() => setAeropuertoEliminar(aeropuerto)} aria-label={`Eliminar ${aeropuerto.codigoIataAeropuerto}`} title="Eliminar aeropuerto"><Icono nombre="eliminar" tamano={18} /></button>
                                            </div></td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {formularioAbierto && (
                <div className="aeropuertos-modal-capa">
                    <section className="aeropuertos-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-aeropuerto">
                        <header className="aeropuertos-modal__cabecera">
                            <div className="aeropuertos-modal__titulo">
                                <span className="aeropuertos-modal__icono">
                                    <Icono nombre="aeropuerto" tamano={24} />
                                </span>
                                <div>
                                    <span>{aeropuertoEdicion ? 'Actualizar registro' : 'Nuevo registro'}</span>
                                    <h3 id="titulo-formulario-aeropuerto">{aeropuertoEdicion ? 'Editar aeropuerto' : 'Registrar aeropuerto'}</h3>
                                    <p>Completa los datos del catálogo global.</p>
                                </div>
                            </div>
                            <button type="button" className="aeropuertos-modal__cerrar" onClick={cerrarFormulario} disabled={guardando} aria-label="Cerrar formulario"><Icono nombre="cerrar" /></button>
                        </header>

                        <form className="aeropuertos-formulario" onSubmit={(e) => void guardar(e)}>
                            <div className="aeropuertos-formulario__rejilla">
                                <label className="aeropuertos-campo"><span>Código IATA</span><input value={formulario.codigoIataAeropuerto} onChange={(e) => cambiarCampo('codigoIataAeropuerto', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="UIO" maxLength={3} required disabled={guardando} /><small>Exactamente 3 letras.</small></label>
                                <label className="aeropuertos-campo"><span>Código ICAO</span><input value={formulario.codigoIcaoAeropuerto} onChange={(e) => cambiarCampo('codigoIcaoAeropuerto', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))} placeholder="SEQM" maxLength={4} required disabled={guardando} /><small>Exactamente 4 letras.</small></label>
                                <label className="aeropuertos-campo aeropuertos-campo--completo"><span>Nombre del aeropuerto</span><input value={formulario.nombreAeropuerto} onChange={(e) => cambiarCampo('nombreAeropuerto', e.target.value)} placeholder="Aeropuerto Internacional Mariscal Sucre" minLength={3} maxLength={150} required disabled={guardando} /></label>
                                <label className="aeropuertos-campo"><span>Ciudad</span><input value={formulario.ciudadAeropuerto} onChange={(e) => cambiarCampo('ciudadAeropuerto', e.target.value)} placeholder="Quito" minLength={2} maxLength={100} required disabled={guardando} /></label>
                                <label className="aeropuertos-campo"><span>País</span><input value={formulario.paisAeropuerto} onChange={(e) => cambiarCampo('paisAeropuerto', e.target.value)} placeholder="Ecuador" minLength={2} maxLength={80} required disabled={guardando} /></label>
                                <label className="aeropuertos-campo"><span>Zona horaria</span><input value={formulario.zonaHorariaAeropuerto} onChange={(e) => cambiarCampo('zonaHorariaAeropuerto', e.target.value)} placeholder="America/Guayaquil" maxLength={100} required disabled={guardando} /></label>
                                <label className="aeropuertos-campo"><span>Estado</span><select value={formulario.estadoAeropuerto} onChange={(e) => cambiarCampo('estadoAeropuerto', e.target.value as EstadoAeropuerto)} disabled={guardando}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">INACTIVO</option></select></label>
                            </div>

                            {errorFormulario && <div className="aeropuertos-error-formulario" role="alert"><Icono nombre="alerta" tamano={19} /><span>{errorFormulario}</span></div>}

                            <footer className="aeropuertos-modal__acciones">
                                <button type="button" className="aeropuertos-boton-secundario" onClick={cerrarFormulario} disabled={guardando}>Cancelar</button>
                                <button type="submit" className="aeropuertos-boton-principal" disabled={guardando}>
                                    {guardando ? <><span className="aeropuertos-cargador aeropuertos-cargador--pequeno" />Guardando</> : <>{aeropuertoEdicion ? <Icono nombre="editar" /> : <Icono nombre="agregar" />}{aeropuertoEdicion ? 'Guardar cambios' : 'Registrar aeropuerto'}</>}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {aeropuertoEliminar && (
                <div className="aeropuertos-modal-capa">
                    <section className="aeropuertos-confirmacion" role="alertdialog" aria-modal="true" aria-labelledby="titulo-eliminar-aeropuerto">
                        <div className="aeropuertos-confirmacion__icono"><Icono nombre="alerta" tamano={31} /></div>
                        <span className="aeropuertos-etiqueta">Confirmar eliminación</span>
                        <h3 id="titulo-eliminar-aeropuerto">¿Eliminar {aeropuertoEliminar.codigoIataAeropuerto}?</h3>
                        <p>Se eliminará <strong>{aeropuertoEliminar.nombreAeropuerto}</strong>. La operación será bloqueada si existen rutas asociadas.</p>
                        <div className="aeropuertos-confirmacion__acciones">
                            <button type="button" className="aeropuertos-boton-secundario" onClick={() => setAeropuertoEliminar(null)} disabled={eliminando}>Conservar registro</button>
                            <button type="button" className="aeropuertos-boton-peligro" onClick={() => void eliminar()} disabled={eliminando}>
                                {eliminando ? <><span className="aeropuertos-cargador aeropuertos-cargador--pequeno" />Eliminando</> : <><Icono nombre="eliminar" />Eliminar aeropuerto</>}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

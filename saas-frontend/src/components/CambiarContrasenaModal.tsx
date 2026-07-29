/* saas-frontend/src/components/CambiarContrasenaModal.tsx */
import { useState } from 'react'
import type { FormEvent } from 'react'
import './CambiarContrasenaModal.css'

const API_URL = 'http://localhost:3000/api'

type CampoContrasena =
    | 'actual'
    | 'nueva'
    | 'confirmacion'

interface CambiarContrasenaModalProps {
    token: string
    onCerrar: () => void
    onSesionExpirada: () => void
    onCambioExitoso: () => void
}

interface IconoProps {
    nombre: 'candado' | 'cerrar' | 'ojo' | 'ojo-cerrado'
    tamano?: number
}

function Icono({
    nombre,
    tamano = 20,
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
        'aria-hidden': true,
    }

    switch (nombre) {
        case 'candado':
            return (
                <svg {...propiedades}>
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                </svg>
            )

        case 'cerrar':
            return (
                <svg {...propiedades}>
                    <path d="M6 6l12 12M18 6 6 18" />
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
    }
}

async function leerRespuesta(
    response: Response,
): Promise<unknown> {
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
    mensajeAlternativo: string,
): string {
    if (
        typeof respuesta !== 'object' ||
        respuesta === null
    ) {
        return mensajeAlternativo
    }

    const objeto = respuesta as Record<string, unknown>
    const mensaje = objeto.message

    if (typeof mensaje === 'string') {
        return mensaje
    }

    if (
        Array.isArray(mensaje) &&
        mensaje.every(
            (elemento) => typeof elemento === 'string',
        )
    ) {
        return mensaje.join('. ')
    }

    if (typeof objeto.error === 'string') {
        return objeto.error
    }

    return mensajeAlternativo
}

export function CambiarContrasenaModal({
    token,
    onCerrar,
    onSesionExpirada,
    onCambioExitoso,
}: CambiarContrasenaModalProps) {
    const [contrasenaActual, setContrasenaActual] =
        useState('')
    const [nuevaContrasena, setNuevaContrasena] =
        useState('')
    const [
        confirmarNuevaContrasena,
        setConfirmarNuevaContrasena,
    ] = useState('')
    const [camposVisibles, setCamposVisibles] = useState<
        Set<CampoContrasena>
    >(() => new Set())
    const [procesando, setProcesando] = useState(false)
    const [mensajeError, setMensajeError] = useState('')

    function alternarVisibilidad(
        campo: CampoContrasena,
    ) {
        setCamposVisibles((camposActuales) => {
            const nuevosCampos = new Set(camposActuales)

            if (nuevosCampos.has(campo)) {
                nuevosCampos.delete(campo)
            } else {
                nuevosCampos.add(campo)
            }

            return nuevosCampos
        })
    }

    function validarFormulario(): string | null {
        if (!contrasenaActual) {
            return 'Ingresa tu contraseña actual.'
        }

        if (nuevaContrasena.length < 8) {
            return 'La nueva contraseña debe contener al menos 8 caracteres.'
        }

        if (nuevaContrasena.length > 100) {
            return 'La nueva contraseña no puede superar los 100 caracteres.'
        }

        if (
            nuevaContrasena !== confirmarNuevaContrasena
        ) {
            return 'La nueva contraseña y su confirmación no coinciden.'
        }

        if (nuevaContrasena === contrasenaActual) {
            return 'La nueva contraseña debe ser diferente de la actual.'
        }

        return null
    }

    async function cambiarContrasena(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault()

        const errorValidacion = validarFormulario()

        if (errorValidacion) {
            setMensajeError(errorValidacion)
            return
        }

        setProcesando(true)
        setMensajeError('')

        try {
            const response = await fetch(
                `${API_URL}/auth/cambiar-contrasena`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contrasenaActual,
                        nuevaContrasena,
                        confirmarNuevaContrasena,
                    }),
                },
            )

            const respuesta = await leerRespuesta(response)

            if (response.status === 401) {
                onSesionExpirada()
                return
            }

            if (!response.ok) {
                throw new Error(
                    obtenerMensaje(
                        respuesta,
                        'No fue posible cambiar la contraseña.',
                    ),
                )
            }

            onCambioExitoso()
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
        <div
            className="cuenta-modal-capa"
            role="presentation"
            onMouseDown={(evento) => {
                if (
                    !procesando &&
                    evento.target === evento.currentTarget
                ) {
                    onCerrar()
                }
            }}
        >
            <section
                className="cuenta-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-cambiar-contrasena"
            >
                <header className="cuenta-modal__cabecera">
                    <div className="cuenta-modal__icono">
                        <Icono nombre="candado" tamano={23} />
                    </div>

                    <div>
                        <span>Seguridad de la cuenta</span>
                        <h2 id="titulo-cambiar-contrasena">
                            Cambiar contraseña
                        </h2>
                        <p>
                            Confirma tu contraseña actual y establece una
                            nueva.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="cuenta-modal__cerrar"
                        onClick={onCerrar}
                        disabled={procesando}
                        aria-label="Cerrar formulario"
                    >
                        <Icono nombre="cerrar" />
                    </button>
                </header>

                <form
                    className="cuenta-formulario"
                    onSubmit={(evento) =>
                        void cambiarContrasena(evento)
                    }
                >
                    <CampoContrasenaFormulario
                        etiqueta="Contraseña actual"
                        valor={contrasenaActual}
                        onCambiar={setContrasenaActual}
                        visible={camposVisibles.has('actual')}
                        onAlternar={() =>
                            alternarVisibilidad('actual')
                        }
                        autoComplete="current-password"
                        disabled={procesando}
                    />

                    <CampoContrasenaFormulario
                        etiqueta="Nueva contraseña"
                        valor={nuevaContrasena}
                        onCambiar={setNuevaContrasena}
                        visible={camposVisibles.has('nueva')}
                        onAlternar={() =>
                            alternarVisibilidad('nueva')
                        }
                        autoComplete="new-password"
                        disabled={procesando}
                        ayuda="Debe contener entre 8 y 100 caracteres."
                    />

                    <CampoContrasenaFormulario
                        etiqueta="Confirmar nueva contraseña"
                        valor={confirmarNuevaContrasena}
                        onCambiar={setConfirmarNuevaContrasena}
                        visible={camposVisibles.has('confirmacion')}
                        onAlternar={() =>
                            alternarVisibilidad('confirmacion')
                        }
                        autoComplete="new-password"
                        disabled={procesando}
                    />

                    {mensajeError && (
                        <div
                            className="cuenta-formulario__error"
                            role="alert"
                        >
                            <span>!</span>
                            <p>{mensajeError}</p>
                        </div>
                    )}

                    <div className="cuenta-formulario__aviso">
                        Al guardar, la sesión se cerrará y deberás
                        ingresar con la nueva contraseña.
                    </div>

                    <footer className="cuenta-formulario__acciones">
                        <button
                            type="button"
                            className="cuenta-boton-secundario"
                            onClick={onCerrar}
                            disabled={procesando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="cuenta-boton-principal"
                            disabled={procesando}
                        >
                            {procesando ? (
                                <>
                                    <span className="cuenta-spinner" />
                                    Actualizando
                                </>
                            ) : (
                                <>
                                    <Icono nombre="candado" tamano={18} />
                                    Guardar contraseña
                                </>
                            )}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    )
}

interface CampoContrasenaFormularioProps {
    etiqueta: string
    valor: string
    onCambiar: (valor: string) => void
    visible: boolean
    onAlternar: () => void
    autoComplete: string
    disabled: boolean
    ayuda?: string
}

function CampoContrasenaFormulario({
    etiqueta,
    valor,
    onCambiar,
    visible,
    onAlternar,
    autoComplete,
    disabled,
    ayuda,
}: CampoContrasenaFormularioProps) {
    return (
        <label className="cuenta-campo">
            <span>{etiqueta}</span>

            <div className="cuenta-campo__control">
                <Icono nombre="candado" tamano={18} />

                <input
                    type={visible ? 'text' : 'password'}
                    value={valor}
                    onChange={(evento) =>
                        onCambiar(evento.target.value)
                    }
                    autoComplete={autoComplete}
                    maxLength={100}
                    required
                    disabled={disabled}
                />

                <button
                    type="button"
                    onClick={onAlternar}
                    disabled={disabled}
                    aria-label={
                        visible
                            ? `Ocultar ${etiqueta.toLowerCase()}`
                            : `Mostrar ${etiqueta.toLowerCase()}`
                    }
                >
                    <Icono
                        nombre={visible ? 'ojo-cerrado' : 'ojo'}
                        tamano={19}
                    />
                </button>
            </div>

            {ayuda && <small>{ayuda}</small>}
        </label>
    )
}

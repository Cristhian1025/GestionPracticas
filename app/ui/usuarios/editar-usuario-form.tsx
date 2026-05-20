'use client'

import { useState } from 'react'
import { actualizarUsuario } from '@/app/actions/usuarios'
import Link from 'next/link'

const ROLES = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'centro_progresa', label: 'Centro Progresa' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'admin', label: 'Administrador' },
]

export default function EditarUsuarioForm({ 
  usuarioId,
  initialData,
  programas 
}: { 
  usuarioId: string,
  initialData: any,
  programas: { id: string, nombre: string }[] 
}) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rol, setRol] = useState<string>(initialData.rol || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      setLoading(true)
      setError(null)
      const result = await actualizarUsuario(usuarioId, formData)

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (e) {
      setError("Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center w-full">
        <div className="text-green-600 text-4xl mb-3">✓</div>
        <p className="text-gray-900 font-medium">Usuario actualizado exitosamente</p>
        <Link
          href="/admin/usuarios"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Volver a usuarios
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              type="text"
              required
              defaultValue={initialData.nombre}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              name="apellido"
              type="text"
              required
              defaultValue={initialData.apellido}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo institucional
          </label>
          <input
            name="email"
            type="email"
            required
            defaultValue={initialData.email}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="correo@uniminuto.edu.co"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva contraseña
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Opcional. Déjalo en blanco si no deseas cambiarla.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            name="rol"
            required
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un rol</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            name="telefono"
            type="tel"
            defaultValue={initialData.telefono || ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {rol === 'estudiante' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa</label>
              <select
                name="programa_id"
                defaultValue={initialData.programa_id || ''}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un programa</option>
                {programas.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Meses de Práctica</label>
              <select
                name="meses_practica"
                defaultValue={initialData.meses_practica || ''}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona duración</option>
                <option value="6">6 Meses</option>
                <option value="12">12 Meses</option>
                <option value="18">18 Meses</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Académico</label>
                <select
                  name="estado_academico"
                  defaultValue={initialData.estado_academico || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="habilitado">Habilitado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Búsqueda</label>
                <select
                  name="estado_busqueda"
                  defaultValue={initialData.estado_busqueda || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sin_postulaciones">Sin postulaciones</option>
                  <option value="postulado">Postulado</option>
                  <option value="contratado">Contratado</option>
                </select>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/usuarios"
            className="flex-1 text-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPrograma, actualizarPrograma } from '@/app/actions/programas'
import Link from 'next/link'

export default function ProgramaForm({ programa }: { programa?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!programa

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await actualizarPrograma(programa.id, formData)
      : await crearPrograma(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/programas')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2">
          <h3 className="text-lg font-medium text-gray-900">Detalles del Programa Académico</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Carrera *</label>
          <input
            type="text"
            name="nombre"
            required
            defaultValue={programa?.nombre}
            placeholder="Ej. Ingeniería de Sistemas"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código (SNIES o Interno)</label>
          <input
            type="text"
            name="codigo"
            defaultValue={programa?.codigo}
            placeholder="Ej. SNIES 10293"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
          <input
            type="text"
            name="sede"
            required
            defaultValue={programa?.sede}
            placeholder="Ej. Sede Principal"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meses de Práctica *</label>
          <select
            name="meses_practica"
            required
            defaultValue={programa?.meses_practica || '6'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="6">6 Meses</option>
            <option value="12">12 Meses</option>
            <option value="18">18 Meses</option>
          </select>
        </div>

        <div className="md:col-span-2 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="activo"
              value="true"
              defaultChecked={isEdit ? programa?.activo : true}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Programa Activo (Permite vincular estudiantes)</span>
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/admin/programas"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Registrar Programa')}
        </button>
      </div>
    </form>
  )
}

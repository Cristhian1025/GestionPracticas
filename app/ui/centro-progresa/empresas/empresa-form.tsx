'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearEmpresa, actualizarEmpresa } from '@/app/actions/empresas'
import Link from 'next/link'

export default function EmpresaForm({ empresa }: { empresa?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!empresa

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await actualizarEmpresa(empresa.id, formData)
      : await crearEmpresa(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/centro-progresa/empresas')
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
        {/* Datos de la Empresa */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2">
          <h3 className="text-lg font-medium text-gray-900">Datos de la Empresa</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Razón Social)</label>
          <input
            type="text"
            name="nombre"
            required
            defaultValue={empresa?.nombre}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
          <input
            type="text"
            name="nit"
            required
            defaultValue={empresa?.nit}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sector (Ej. Tecnología, Salud...)</label>
          <input
            type="text"
            name="sector"
            required
            defaultValue={empresa?.sector}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            required
            defaultValue={empresa?.ciudad}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Datos del Contacto */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900">Datos del Contacto</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
          <input
            type="text"
            name="nombre_contacto"
            required
            defaultValue={empresa?.nombre_contacto}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo del Contacto</label>
          <input
            type="text"
            name="cargo_contacto"
            defaultValue={empresa?.cargo_contacto}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            name="email_contacto"
            required
            defaultValue={empresa?.email_contacto}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono_contacto"
            required
            defaultValue={empresa?.telefono_contacto}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Estado */}
        <div className="md:col-span-2 border-b border-gray-100 pb-4 mb-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900">Estado de la Empresa</h3>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="activa"
              value="true"
              defaultChecked={isEdit ? empresa?.activa : true}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Empresa Activa (Puede recibir practicantes)</span>
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/centro-progresa/empresas"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Registrar Empresa')}
        </button>
      </div>
    </form>
  )
}

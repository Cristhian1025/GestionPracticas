'use client'

import { useState, useTransition } from 'react'
import { registrarOfertaExterna } from '@/app/actions/estudiante'
import { useRouter } from 'next/navigation'

export default function OfertaExternaForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      setError(null)
      const result = await registrarOfertaExterna(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        alert('Postulación externa registrada exitosamente.')
        router.refresh()
        // Here we could redirect or just reset form, for now let's reset form
        const form = e.target as HTMLFormElement
        form.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">¿Conseguiste práctica por tu cuenta?</h3>
        <p className="text-sm text-gray-500">
          Si fuiste aceptado en una empresa que no está en la bolsa de empleo de Centro Progresa, registra los datos básicos aquí para que podamos hacer el seguimiento oficial de tu práctica.
        </p>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
          <input
            type="text"
            name="nombre_empresa_propia"
            required
            placeholder="Ej. Ecopetrol S.A."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo a ocupar</label>
          <input
            type="text"
            name="cargo_aspirado"
            required
            placeholder="Ej. Practicante Administrativo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Registrando...' : 'Registrar Empresa Propia'}
        </button>
      </div>
    </form>
  )
}

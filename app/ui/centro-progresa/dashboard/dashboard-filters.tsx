'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function DashboardFilters({ programas }: { programas: {id: string, nombre: string}[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`)
  }

  // Opciones de periodos genéricas para el filtro
  const ano = new Date().getFullYear()
  const periodos = [
    `${ano}-10`, `${ano}-40`, `${ano}-45`, `${ano}-50`, `${ano}-60`,
    `${ano+1}-10`, `${ano+1}-40`
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Filtrar por Programa
        </label>
        <select
          defaultValue={searchParams.get('programa_id') || ''}
          onChange={(e) => handleChange('programa_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="">Todos los programas</option>
          {programas.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Filtrar por Periodo
        </label>
        <select
          defaultValue={searchParams.get('periodo') || ''}
          onChange={(e) => handleChange('periodo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="">Todos los periodos</option>
          {periodos.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {(searchParams.get('programa_id') || searchParams.get('periodo')) && (
        <button
          onClick={() => router.push(pathname)}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  )
}

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Programa = { id: string; nombre: string }

export default function EstudiantesFilters({ programas }: { programas: Programa[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Reset to page 1 on any filter change
      params.set('page', '1')
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

        {/* Búsqueda por nombre/correo */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Buscar estudiante
          </label>
          <input
            type="text"
            placeholder="Nombre, apellido o correo..."
            defaultValue={searchParams.get('query') || ''}
            onChange={(e) => handleChange('query', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Filtro por Carrera */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Carrera / Programa
          </label>
          <select
            defaultValue={searchParams.get('programa_id') || ''}
            onChange={(e) => handleChange('programa_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Todas las carreras</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado Académico */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estado Académico
          </label>
          <select
            defaultValue={searchParams.get('estado_academico') || ''}
            onChange={(e) => handleChange('estado_academico', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            <option value="habilitado">Habilitado</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        {/* Filtro por Estado de Búsqueda */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estado de Búsqueda
          </label>
          <select
            defaultValue={searchParams.get('estado_busqueda') || ''}
            onChange={(e) => handleChange('estado_busqueda', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            <option value="sin_postulaciones">Sin Postulaciones</option>
            <option value="postulado">Postulado</option>
            <option value="carta_enviada">Carta Enviada</option>
            <option value="carta_aprobada">Carta Aprobada</option>
            <option value="contratado">Contratado</option>
          </select>
        </div>

      </div>

      {/* Segunda fila: filtro Meses de práctica + botón limpiar */}
      <div className="flex flex-wrap gap-3 mt-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Meses de Práctica
          </label>
          <select
            defaultValue={searchParams.get('meses_practica') || ''}
            onChange={(e) => handleChange('meses_practica', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            <option value="6">6 Meses</option>
            <option value="12">12 Meses</option>
            <option value="18">18 Meses</option>
          </select>
        </div>

        <button
          onClick={() => router.push(pathname)}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ✕ Limpiar filtros
        </button>
      </div>
    </div>
  )
}

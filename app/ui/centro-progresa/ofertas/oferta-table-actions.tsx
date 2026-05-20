'use client'

import Link from 'next/link'
import { cambiarEstadoOferta } from '@/app/actions/ofertas'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function OfertaTableActions({ 
  ofertaId, 
  estado 
}: { 
  ofertaId: string, 
  estado: string 
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isActiva = estado === 'activa'

  const handleToggleEstado = () => {
    const actionWord = isActiva ? 'cerrar' : 'activar'
    if (confirm(`¿Estás seguro de que deseas ${actionWord} esta oferta?`)) {
      startTransition(async () => {
        await cambiarEstadoOferta(ofertaId, isActiva ? 'cerrada' : 'activa')
        router.refresh()
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/centro-progresa/ofertas/editar/${ofertaId}`}
        className="text-sm px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
      >
        Editar
      </Link>
      
      <button
        onClick={handleToggleEstado}
        disabled={isPending}
        className={`text-sm px-3 py-1 rounded-md border transition-colors disabled:opacity-50 ${
          isActiva 
            ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' 
            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
        }`}
      >
        {isPending ? '...' : isActiva ? 'Cerrar Oferta' : 'Activar Oferta'}
      </button>
    </div>
  )
}

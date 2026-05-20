'use client'

import Link from 'next/link'
import { cambiarEstadoPrograma } from '@/app/actions/programas'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function ProgramaTableActions({ 
  programaId, 
  activo 
}: { 
  programaId: string, 
  activo: boolean 
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggleEstado = () => {
    const actionWord = activo ? 'desactivar' : 'activar'
    if (confirm(`¿Estás seguro de que deseas ${actionWord} este programa?`)) {
      startTransition(async () => {
        await cambiarEstadoPrograma(programaId, !activo)
        router.refresh()
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/programas/editar/${programaId}`}
        className="text-sm px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
      >
        Editar
      </Link>
      
      <button
        onClick={handleToggleEstado}
        disabled={isPending}
        className={`text-sm px-3 py-1 rounded-md border transition-colors disabled:opacity-50 ${
          activo 
            ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' 
            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
        }`}
      >
        {isPending ? '...' : activo ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}

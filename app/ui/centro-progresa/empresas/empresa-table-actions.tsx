'use client'

import Link from 'next/link'
import { cambiarEstadoEmpresa } from '@/app/actions/empresas'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function EmpresaTableActions({ 
  empresaId, 
  activa 
}: { 
  empresaId: string, 
  activa: boolean 
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggleEstado = () => {
    const actionWord = activa ? 'desactivar' : 'activar'
    if (confirm(`¿Estás seguro de que deseas ${actionWord} esta empresa?`)) {
      startTransition(async () => {
        await cambiarEstadoEmpresa(empresaId, !activa)
        router.refresh()
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/centro-progresa/empresas/editar/${empresaId}`}
        className="text-sm px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
      >
        Editar
      </Link>
      
      <button
        onClick={handleToggleEstado}
        disabled={isPending}
        className={`text-sm px-3 py-1 rounded-md border transition-colors disabled:opacity-50 ${
          activa 
            ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' 
            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
        }`}
      >
        {isPending ? '...' : activa ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { postularAOfertaSistema } from '@/app/actions/estudiante'

export default function PostularBtn({ ofertaId, yaPostulado }: { ofertaId: string, yaPostulado: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [postulado, setPostulado] = useState(yaPostulado)
  const [error, setError] = useState<string | null>(null)

  const handlePostular = () => {
    if (confirm('¿Estás seguro de postularte a esta oferta? El Centro Progresa será notificado.')) {
      startTransition(async () => {
        setError(null)
        const result = await postularAOfertaSistema(ofertaId)
        if (result?.error) {
          setError(result.error)
        } else {
          setPostulado(true)
          alert('¡Postulación enviada con éxito!')
        }
      })
    }
  }

  if (postulado) {
    return (
      <button 
        disabled
        className="w-full mt-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200"
      >
        ✓ Ya estás postulado
      </button>
    )
  }

  return (
    <div className="mt-4">
      <button 
        onClick={handlePostular}
        disabled={isPending}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? 'Postulando...' : 'Postularme a esta oferta'}
      </button>
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  )
}

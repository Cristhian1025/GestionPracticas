'use client'

import { useState, useTransition } from 'react'
import { revisarDocumento } from '@/app/actions/coordinador'

export default function RevisionActions({ 
  documentoId 
}: { 
  documentoId: string 
}) {
  const [isPending, startTransition] = useTransition()
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'aprobado' | 'rechazado'}>({isOpen: false, type: 'aprobado'})
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalState.type === 'rechazado' && !observaciones.trim()) {
      alert('Debes ingresar el motivo del rechazo.')
      return
    }

    if (modalState.type === 'aprobado') {
      if (!confirm('¿Estás seguro de que deseas aprobar esta Carta de Funciones?')) return
    }

    startTransition(async () => {
      setError(null)
      const result = await revisarDocumento(documentoId, modalState.type, observaciones)
      if (result?.error) {
        setError(result.error)
      } else {
        setModalState({ isOpen: false, type: 'aprobado' })
        alert(`Documento ${modalState.type}.`)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      <button
        onClick={() => setModalState({ isOpen: true, type: 'aprobado' })}
        disabled={isPending}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        Aprobar
      </button>
      
      <button
        onClick={() => setModalState({ isOpen: true, type: 'rechazado' })}
        disabled={isPending}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        Rechazar
      </button>

      {/* Modal de Acción (Aprobar/Rechazar) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {modalState.type === 'aprobado' ? 'Aprobar Carta de Funciones' : 'Rechazar Carta de Funciones'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {modalState.type === 'aprobado' 
                ? 'Puedes añadir un comentario opcional al estudiante al aprobar su carta.'
                : 'Por favor, detalla las observaciones o motivos por los cuales estás rechazando este documento para que el estudiante pueda corregirlo.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                required={modalState.type === 'rechazado'}
                rows={4}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder={modalState.type === 'aprobado' ? 'Comentarios adicionales (opcional)...' : 'Ej. Las funciones descritas no corresponden al perfil...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, type: 'aprobado' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${modalState.type === 'aprobado' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {isPending ? 'Enviando...' : modalState.type === 'aprobado' ? 'Aprobar' : 'Rechazar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

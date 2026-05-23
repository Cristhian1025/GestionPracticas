'use client'

import { useState, useTransition } from 'react'
import { revisarDocumento } from '@/app/actions/coordinador'

export default function RevisionActions({ 
  documentoId 
}: { 
  documentoId: string 
}) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAprobar = () => {
    if (!confirm('¿Estás seguro de que deseas aprobar esta Carta de Funciones? Esto formalizará la práctica del estudiante en el sistema.')) return

    startTransition(async () => {
      setError(null)
      const result = await revisarDocumento(documentoId, 'aprobado')
      if (result?.error) {
        setError(result.error)
      } else {
        alert('Carta de funciones aprobada. La práctica del estudiante ha sido formalizada exitosamente.')
      }
    })
  }

  const handleRechazarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!observaciones.trim()) {
      alert('Debes ingresar el motivo del rechazo.')
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await revisarDocumento(documentoId, 'rechazado', observaciones)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowModal(false)
        alert('Documento rechazado con observaciones.')
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
        onClick={handleAprobar}
        disabled={isPending}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        Aprobar
      </button>
      
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        Rechazar
      </button>

      {/* Modal de Rechazo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rechazar Carta de Funciones</h3>
            <p className="text-sm text-gray-500 mb-4">
              Por favor, detalla las observaciones o motivos por los cuales estás rechazando este documento para que el estudiante pueda corregirlo.
            </p>
            
            <form onSubmit={handleRechazarSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Las funciones descritas no corresponden al perfil laboral o falta la firma del jefe inmediato."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Enviando...' : 'Rechazar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

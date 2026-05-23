'use client'

import { useState, useTransition } from 'react'
import { subirCartaFunciones, marcarComoContratado } from '@/app/actions/tramites'

export default function UploadCartaFunciones({ 
  postulacionId, 
  documentoActual,
  estadoBusqueda
}: { 
  postulacionId: string
  documentoActual?: any
  estadoBusqueda?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [isContractPending, startContractTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      setError(null)
      const result = await subirCartaFunciones(postulacionId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        alert('Documento enviado correctamente para revisión.')
      }
    })
  }

  const handleMarcarContratado = () => {
    if (!confirm('¿Estás seguro de marcar esta práctica como Contratado? Esto oficializará el inicio de tu práctica.')) return

    startContractTransition(async () => {
      setError(null)
      const result = await marcarComoContratado(postulacionId)
      if (result?.error) {
        setError(result.error)
      } else {
        alert('¡Felicidades! Has sido marcado como Contratado oficialmente.')
      }
    })
  }

  // Si ya hay un documento, mostrar su estado en lugar del formulario de subida
  if (documentoActual) {
    const isPendiente = documentoActual.estado === 'pendiente'
    const isAprobado = documentoActual.estado === 'aprobado'
    const isRechazado = documentoActual.estado === 'rechazado'

    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Estado del Documento: 
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPendiente ? 'bg-yellow-100 text-yellow-800' :
            isAprobado ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {documentoActual.estado.toUpperCase()}
          </span>
        </h4>
        
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <svg className="w-6 h-6 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
            <span className="text-sm text-gray-700 truncate">{documentoActual.nombre_archivo}</span>
          </div>
          <a 
            href={documentoActual.url_storage} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-medium hover:underline shrink-0"
          >
            Ver Archivo
          </a>
        </div>

        {isRechazado && documentoActual.observaciones && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
            <h5 className="text-xs font-bold text-red-800 mb-1">Observaciones del Coordinador:</h5>
            <p className="text-sm text-red-700">{documentoActual.observaciones}</p>
            {/* TODO: Si es rechazado, idealmente debería poder subir uno nuevo. 
                Por ahora requeriría eliminar el anterior o actualizarlo. */}
            <p className="text-xs text-gray-500 mt-2">Por favor contacta a tu coordinador para reenviar el documento corregido.</p>
          </div>
        )}

        {isAprobado && estadoBusqueda === 'carta_aprobada' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
            <h5 className="text-sm font-bold text-blue-900 mb-2">¡Tu Carta ha sido Aprobada!</h5>
            <p className="text-sm text-blue-700 mb-3">
              Para formalizar el inicio de tu práctica en el sistema, por favor haz clic en el siguiente botón.
            </p>
            <button
              onClick={handleMarcarContratado}
              disabled={isContractPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isContractPending ? 'Procesando...' : 'Marcar como Contratado'}
            </button>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        )}

        {estadoBusqueda === 'contratado' && isAprobado && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center text-sm font-medium text-green-800">
            ✅ Práctica formalizada y en curso.
          </div>
        )}
      </div>
    )
  }

  // Formulario de subida original
  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Adjuntar archivo PDF
      </label>
      <input 
        type="file" 
        name="file" 
        accept="application/pdf"
        required
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <p className="mt-1 text-xs text-gray-500">Solo PDF (Máx. 5MB).</p>
      
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : 'Enviar para Revisión'}
      </button>
    </form>
  )
}

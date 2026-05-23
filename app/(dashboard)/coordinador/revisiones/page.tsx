import { listarRevisionesCoordinador } from '@/app/actions/coordinador'
import RevisionActions from '@/app/ui/coordinador/revision-actions'

export default async function CoordinatorRevisionesPage() {
  const { data: revisiones, error } = await listarRevisionesCoordinador()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bandeja de Revisiones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Valida y aprueba las Cartas de Funciones subidas por los estudiantes de tu programa.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Documentos por Validar</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Estudiante / Fecha</th>
                <th className="py-3 px-6">Origen de Práctica</th>
                <th className="py-3 px-6">Documento</th>
                <th className="py-3 px-6 text-center">Estado</th>
                <th className="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {revisiones && revisiones.length > 0 ? (
                revisiones.map((doc: any) => {
                  const isPendiente = doc.estado === 'pendiente'
                  const isAprobado = doc.estado === 'aprobado'
                  const isRechazado = doc.estado === 'rechazado'

                  const postulacion = doc.postulaciones
                  const titulo = postulacion?.origen === 'empresa_propia'
                    ? `Empresa Propia: ${postulacion.nombre_empresa_propia} (${postulacion.cargo_aspirado || 'Practicante'})`
                    : `Oferta Sistema: ${postulacion?.ofertas?.titulo} (${postulacion?.ofertas?.empresas?.nombre || 'Empresa'})`

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{doc.estudiante_nombre}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Enviado: {new Date(doc.created_at).toLocaleDateString('es-CO')}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {titulo}
                      </td>
                      <td className="py-4 px-6">
                        <a 
                          href={doc.url_storage} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                          Ver PDF Adjunto
                        </a>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPendiente ? 'bg-yellow-100 text-yellow-800' :
                          isAprobado ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.estado?.toUpperCase()}
                        </span>
                        {isRechazado && doc.observaciones && (
                          <div className="text-[11px] text-red-600 mt-1 max-w-[200px] mx-auto text-left leading-tight italic">
                            Obs: {doc.observaciones}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right flex justify-end">
                        {isPendiente ? (
                          <RevisionActions documentoId={doc.id} />
                        ) : (
                          <span className="text-xs text-gray-400 italic">Validado</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No tienes cartas de funciones pendientes de revisión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

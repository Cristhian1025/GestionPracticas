import CartaPresentacionInfo from '@/app/ui/estudiante/tramites/carta-presentacion-info'
import UploadCartaFunciones from '@/app/ui/estudiante/tramites/upload-carta-funciones'
import { listarPostulacionesEstudiante } from '@/app/actions/tramites'
import Link from 'next/link'

export default async function EstudianteTramitesPage() {
  const { data: postulaciones, estado_busqueda } = await listarPostulacionesEstudiante()

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Trámites</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona los documentos necesarios para formalizar tu proceso de práctica.
        </p>
      </div>

      <div className="space-y-10">
        
        {/* Paso 1: Carta de Presentación */}
        <section>
          <CartaPresentacionInfo />
        </section>

        {/* Paso 2: Carta de Funciones */}
        <section>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">2. Carta de Funciones</h2>
                <p className="text-sm text-gray-600">
                  Una vez la empresa te entregue la Carta de Funciones firmada, debes subirla aquí para que tu 
                  coordinador académico la revise y apruebe. Al ser aprobada, tu práctica quedará formalizada en el sistema.
                </p>
              </div>
            </div>

            {/* Listar las postulaciones activas para subirles la carta */}
            {postulaciones && postulaciones.length > 0 ? (
              <div className="space-y-4">
                {postulaciones.map((postulacion: any) => {
                  const titulo = postulacion.origen === 'empresa_propia' 
                    ? `Empresa Propia: ${postulacion.nombre_empresa_propia} - ${postulacion.cargo_aspirado}`
                    : `Oferta del Sistema: ${postulacion.ofertas?.titulo} (${postulacion.ofertas?.empresas?.nombre})`
                  
                  // Buscar si ya tiene una carta de funciones subida
                  const cartaFunciones = postulacion.documentos?.find((d: any) => d.tipo === 'carta_funciones')

                  return (
                    <div key={postulacion.id} className="border border-gray-100 rounded-xl p-5 bg-white">
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Postulación</span>
                        <h3 className="text-sm font-bold text-gray-900 mt-1">{titulo}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Fecha de postulación: {new Date(postulacion.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      
                      <UploadCartaFunciones 
                        postulacionId={postulacion.id} 
                        documentoActual={cartaFunciones} 
                        estadoBusqueda={estado_busqueda}
                        tienePracticaActiva={postulacion.practicas && postulacion.practicas.length > 0}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <p className="text-sm text-gray-500">
                  Aún no tienes postulaciones activas a las cuales adjuntar una carta de funciones.
                </p>
                <Link href="/estudiante/ofertas" className="text-sm text-blue-600 font-medium hover:underline mt-2 inline-block">
                  Ir a ver ofertas
                </Link>
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  )
}

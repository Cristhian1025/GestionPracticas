import { listarOfertasParaEstudiante } from '@/app/actions/estudiante'
import PostularBtn from '@/app/ui/estudiante/ofertas/postular-btn'
import OfertaExternaForm from '@/app/ui/estudiante/ofertas/oferta-externa-form'
import Link from 'next/link'

export default async function EstudianteOfertasPage(props: {
  searchParams?: Promise<{ page?: string }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  const limit = 12

  const { data: ofertas, count, postuladas } = await listarOfertasParaEstudiante(currentPage, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ofertas de Prácticas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explora las vacantes disponibles publicadas por nuestras Empresas Aliadas y postúlate.
        </p>
      </div>

      {/* Grid de Ofertas */}
      {ofertas && ofertas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas.map((oferta: any) => {
            const yaPostulado = postuladas?.includes(oferta.id) ?? false

            return (
              <div key={oferta.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {oferta.modalidad_contrato === 'cuota_sena' ? 'Cuota SENA' : 'Convenio'}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {oferta.modalidad_trabajo || 'Presencial'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{oferta.titulo}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-4">{oferta.empresas?.nombre}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {oferta.ciudad || oferta.empresas?.ciudad || 'Ciudad no especificada'}
                    </p>
                    {oferta.remuneracion && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {oferta.remuneracion}
                      </p>
                    )}
                  </div>

                  {oferta.descripcion && (
                    <p className="mt-4 text-sm text-gray-500 line-clamp-3">
                      {oferta.descripcion}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-gray-50">
                  <PostularBtn ofertaId={oferta.id} yaPostulado={yaPostulado} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ofertas publicadas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aún no hay ofertas disponibles para tu programa académico en este momento.
          </p>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/estudiante/ofertas?page=${currentPage - 1}`}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/estudiante/ofertas?page=${currentPage + 1}`}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Formulario de Empresa Propia */}
      <OfertaExternaForm />
      
    </main>
  )
}

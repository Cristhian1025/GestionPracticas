import { listarOfertas } from '@/app/actions/ofertas'
import Link from 'next/link'
import SearchOfertas from '@/app/ui/centro-progresa/ofertas/search-ofertas'
import OfertaTableActions from '@/app/ui/centro-progresa/ofertas/oferta-table-actions'

export default async function OfertasPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const limit = 10

  const { data: ofertas, count } = await listarOfertas(currentPage, query, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ofertas Laborales</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las vacantes de prácticas para los estudiantes
          </p>
        </div>
        <Link
          href="/centro-progresa/ofertas/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Publicar Oferta
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SearchOfertas />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Cargo / Título</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Empresa</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Programa / Nivel</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Vacantes</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas && ofertas.length > 0 ? (
                ofertas.map((oferta: any) => (
                  <tr key={oferta.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{oferta.titulo}</div>
                      <div className="text-xs text-gray-500">{oferta.modalidad_trabajo || 'Modalidad no especificada'}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {oferta.empresas?.nombre || 'Empresa Eliminada'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{oferta.programas?.nombre || 'Cualquier Programa'}</div>
                      <div className="text-xs text-gray-500">
                        {oferta.meses_practica ? `${oferta.meses_practica} Meses` : 'Cualquier duración'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{oferta.vacantes}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        oferta.estado === 'activa' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {oferta.estado === 'activa' ? 'Activa' : 'Cerrada'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-end">
                      <OfertaTableActions 
                        ofertaId={oferta.id} 
                        estado={oferta.estado} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron ofertas laborales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/centro-progresa/ofertas?page=${currentPage - 1}${query ? `&query=${query}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/centro-progresa/ofertas?page=${currentPage + 1}${query ? `&query=${query}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

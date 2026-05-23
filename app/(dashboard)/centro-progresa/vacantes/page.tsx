import { listarEmpresasVacantes } from '@/app/actions/empresas'
import Link from 'next/link'
import SearchEmpresas from '@/app/ui/centro-progresa/empresas/search-empresas'

export default async function EmpresasVacantesPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const limit = 20

  const { data: empresas, count } = await listarEmpresasVacantes(currentPage, query, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Vacantes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vista consolidada de postulaciones, estudiantes en proceso y vacantes disponibles por empresa.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SearchEmpresas />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Empresa</th>
                <th className="py-3 px-4 text-sm font-semibold text-center text-gray-600">Vacantes Totales</th>
                <th className="py-3 px-4 text-sm font-semibold text-center text-blue-600">Postulados</th>
                <th className="py-3 px-4 text-sm font-semibold text-center text-yellow-600">En Proceso</th>
                <th className="py-3 px-4 text-sm font-semibold text-center text-green-600">Contratados</th>
                <th className="py-3 px-4 text-sm font-semibold text-center text-gray-600">Vacantes Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {empresas && empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{empresa.nombre}</div>
                      <div className="text-xs text-gray-500">{empresa.ciudad} · NIT: {empresa.nit}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium text-gray-700">{empresa.vacantes_totales}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${empresa.postulados > 0 ? 'bg-blue-100 text-blue-800' : 'text-gray-400'}`}>
                        {empresa.postulados}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${empresa.en_proceso > 0 ? 'bg-yellow-100 text-yellow-800' : 'text-gray-400'}`}>
                        {empresa.en_proceso}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${empresa.contratados > 0 ? 'bg-green-100 text-green-800' : 'text-gray-400'}`}>
                        {empresa.contratados}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        empresa.vacantes_disponibles === 0
                          ? 'bg-red-100 text-red-700'
                          : empresa.vacantes_disponibles <= 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {empresa.vacantes_disponibles}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron empresas con vacantes activas.
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
                  href={`/centro-progresa/vacantes?page=${currentPage - 1}${query ? `&query=${query}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/centro-progresa/vacantes?page=${currentPage + 1}${query ? `&query=${query}` : ''}`}
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

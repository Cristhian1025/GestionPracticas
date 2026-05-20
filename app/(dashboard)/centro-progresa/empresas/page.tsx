import { listarEmpresas } from '@/app/actions/empresas'
import Link from 'next/link'
import SearchEmpresas from '@/app/ui/centro-progresa/empresas/search-empresas'
import EmpresaTableActions from '@/app/ui/centro-progresa/empresas/empresa-table-actions'

export default async function EmpresasPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const limit = 10

  const { data: empresas, count } = await listarEmpresas(currentPage, query, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas Aliadas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las empresas que participan en el programa de prácticas
          </p>
        </div>
        <Link
          href="/centro-progresa/empresas/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Registrar Empresa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SearchEmpresas />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nombre / NIT</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Ciudad</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas && empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{empresa.nombre}</div>
                      <div className="text-xs text-gray-500">NIT: {empresa.nit}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{empresa.ciudad}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{empresa.nombre_contacto}</div>
                      <div className="text-xs text-gray-500">{empresa.cargo_contacto || 'Sin cargo'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        empresa.activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-end">
                      <EmpresaTableActions 
                        empresaId={empresa.id} 
                        activa={empresa.activa} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron empresas aliadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación simple */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/centro-progresa/empresas?page=${currentPage - 1}${query ? `&query=${query}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/centro-progresa/empresas?page=${currentPage + 1}${query ? `&query=${query}` : ''}`}
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

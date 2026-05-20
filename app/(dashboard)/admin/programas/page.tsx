import { listarProgramas } from '@/app/actions/programas'
import Link from 'next/link'
import SearchProgramas from '@/app/ui/admin/programas/search-programas'
import ProgramaTableActions from '@/app/ui/admin/programas/programa-table-actions'

export default async function ProgramasPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const limit = 20

  const { data: programas, count } = await listarProgramas(currentPage, query, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programas Académicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las carreras y sus niveles de práctica
          </p>
        </div>
        <Link
          href="/admin/programas/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Programa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SearchProgramas />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nombre / Código</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Sede</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Niveles de Práctica</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas && programas.length > 0 ? (
                programas.map((programa: any) => (
                  <tr key={programa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{programa.nombre}</div>
                      <div className="text-xs text-gray-500">SNIES/Código: {programa.codigo || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{programa.sede}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {programa.niveles_practica} {programa.niveles_practica === 1 ? 'Nivel' : 'Niveles'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        programa.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {programa.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-end">
                      <ProgramaTableActions 
                        programaId={programa.id} 
                        activo={programa.activo} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron programas académicos.
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
                  href={`/admin/programas?page=${currentPage - 1}${query ? `&query=${query}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/programas?page=${currentPage + 1}${query ? `&query=${query}` : ''}`}
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

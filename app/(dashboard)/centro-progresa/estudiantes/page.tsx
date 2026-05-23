import { listarEstudiantesCentroProgresa, listarProgramasParaFiltro } from '@/app/actions/estudiantes-cp'
import EstudiantesFilters from '@/app/ui/centro-progresa/estudiantes/estudiantes-filters'
import Link from 'next/link'

export default async function EstudiantesCPPage(props: {
  searchParams?: Promise<{
    page?: string
    query?: string
    programa_id?: string
    estado_academico?: string
    estado_busqueda?: string
    meses_practica?: string
  }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  const limit = 20

  const filters = {
    query: searchParams?.query || '',
    programa_id: searchParams?.programa_id || '',
    estado_academico: searchParams?.estado_academico || '',
    estado_busqueda: searchParams?.estado_busqueda || '',
    meses_practica: searchParams?.meses_practica || '',
  }

  const [{ data: estudiantes, count, error }, programas] = await Promise.all([
    listarEstudiantesCentroProgresa(currentPage, filters),
    listarProgramasParaFiltro(),
  ])

  const totalPages = Math.ceil((count || 0) / limit)

  // Build query string for pagination links
  const filterParams = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listado de Estudiantes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Consulta y filtra los estudiantes registrados en el sistema de prácticas.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <EstudiantesFilters programas={programas} />

      {/* Info de resultados */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">
          {count} estudiante{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Nombre</th>
                <th className="py-3 px-6">Correo / Teléfono</th>
                <th className="py-3 px-6">Programa</th>
                <th className="py-3 px-6">Meses</th>
                <th className="py-3 px-6 text-center">Estado Acad.</th>
                <th className="py-3 px-6 text-center">Búsqueda</th>
                <th className="py-3 px-6">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {estudiantes && estudiantes.length > 0 ? (
                estudiantes.map((est: any) => (
                  <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                      {est.nombre} {est.apellido}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div>{est.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{est.telefono || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                      {est.programas ? (est.programas as any).nombre : <span className="text-gray-400 italic">Sin asignar</span>}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {est.meses_practica ? `${est.meses_practica}m` : '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        est.estado_academico === 'finalizado'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {est.estado_academico === 'finalizado' ? 'Finalizado' : 'Habilitado'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        est.estado_busqueda === 'contratado'
                          ? 'bg-green-100 text-green-800'
                          : est.estado_busqueda === 'postulado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {est.estado_busqueda === 'contratado' ? 'Contratado' :
                         est.estado_busqueda === 'postulado' ? 'Postulado' : 'Sin postulaciones'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(est.created_at).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, count)} de {count}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/centro-progresa/estudiantes?page=${currentPage - 1}${filterParams ? `&${filterParams}` : ''}`}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/centro-progresa/estudiantes?page=${currentPage + 1}${filterParams ? `&${filterParams}` : ''}`}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

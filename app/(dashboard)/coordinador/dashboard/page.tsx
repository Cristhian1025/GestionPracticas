import { 
  obtenerMetricasCoordinador, 
  listarEstudiantesCoordinador,
  obtenerPerfilCoordinador
} from '@/app/actions/coordinador'
import Link from 'next/link'

export default async function CoordinatorDashboardPage() {
  const { data: metricas } = await obtenerMetricasCoordinador()
  const { data: estudiantes } = await listarEstudiantesCoordinador()
  const { data: perfil } = await obtenerPerfilCoordinador()

  const nombrePrograma = (perfil?.programas as any)?.nombre || 'Programa'

  return (
    <main className="space-y-8">
      {/* Saludo y Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {perfil?.nombre}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenido al Gestor de Prácticas para el programa de **{nombrePrograma}**.
        </p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Estudiantes Activos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Estudiantes</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">{metricas?.totalEstudiantes || 0}</span>
          </div>
        </div>

        {/* Prácticas en Curso */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Prácticas Oficiales</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">{metricas?.totalPracticasActivas || 0}</span>
          </div>
        </div>

        {/* Pendientes de Aprobación */}
        <Link href="/coordinador/revisiones" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Cartas Pendientes</span>
            <span className="block text-2xl font-bold text-yellow-600 mt-0.5">{metricas?.documentosPendientes || 0}</span>
          </div>
        </Link>

      </div>

      {/* Listado de Estudiantes del Programa */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Estudiantes en el Programa</h2>
          <span className="text-xs text-gray-500 font-medium">Lista Completa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Nombre Estudiante</th>
                <th className="py-3 px-6">Correo / Teléfono</th>
                <th className="py-3 px-6">Meses de Práctica</th>
                <th className="py-3 px-6">Estado Acad.</th>
                <th className="py-3 px-6">Estado Búsqueda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {estudiantes && estudiantes.length > 0 ? (
                estudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {estudiante.nombre} {estudiante.apellido}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div>{estudiante.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{estudiante.telefono || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {estudiante.meses_practica ? `${estudiante.meses_practica} Meses` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                        {estudiante.estado_academico?.replace('_', ' ') || 'habilitado'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        estudiante.estado_busqueda === 'contratado' ? 'bg-green-100 text-green-800' :
                        estudiante.estado_busqueda === 'postulado' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      } capitalize`}>
                        {estudiante.estado_busqueda?.replace('_', ' ') || 'sin_postulaciones'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aún no hay estudiantes registrados en este programa académico.
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

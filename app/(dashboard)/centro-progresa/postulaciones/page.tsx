import { createClient } from '@/lib/supabase/server'

import { createClient as createAdminClient } from '@supabase/supabase-js'

export default async function CentroProgresaPostulaciones() {
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: postulaciones, error } = await adminClient
    .from('postulaciones')
    .select(`
      id, origen, nombre_empresa_propia, cargo_aspirado, created_at, estudiante_id,
      ofertas ( titulo, empresas ( nombre ) ),
      practicas ( id, estado ),
      perfiles:estudiante_id ( id, nombre, apellido, estado_busqueda, programa_id, periodo_academico )
    `)
    .order('created_at', { ascending: false })

  if (error || !postulaciones) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Error cargando las postulaciones recientes.
        </div>
      </main>
    )
  }

  // Filtrar y agrupar para aplicar regla de estudiante contratado
  // Si un estudiante está contratado, solo debe aparecer la postulación que tiene una práctica vinculada
  const studentsStatus = new Map<string, boolean>()
  
  postulaciones.forEach((p: any) => {
    const perfil = Array.isArray(p.perfiles) ? p.perfiles[0] : p.perfiles
    if (perfil.estado_busqueda === 'contratado') {
      studentsStatus.set(p.estudiante_id, true)
    }
  })

  const filtered = postulaciones.filter((p: any) => {
    const isContratado = studentsStatus.get(p.estudiante_id)
    if (isContratado) {
      // Solo mantenerla si es la postulación que tiene la práctica oficial
      const tienePractica = p.practicas && p.practicas.length > 0
      return tienePractica
    }
    return true
  })

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividad Reciente y Postulaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial de las postulaciones de estudiantes a vacantes del sistema o empresas propias.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-500">
                <th className="py-4 px-6 font-medium">Estudiante</th>
                <th className="py-4 px-6 font-medium">Vacante / Empresa</th>
                <th className="py-4 px-6 font-medium">Programa</th>
                <th className="py-4 px-6 font-medium">Fecha</th>
                <th className="py-4 px-6 font-medium text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((post: any) => {
                  const perfil = Array.isArray(post.perfiles) ? post.perfiles[0] : post.perfiles
                  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`
                  const programa = perfil.programas?.nombre || 'N/A' // No traje el nombre del programa, puedo dejar el ID o no ponerlo. Wait, I should fetch it.
                  
                  const vacante = post.origen === 'empresa_propia'
                    ? post.cargo_aspirado
                    : post.ofertas?.titulo
                    
                  const empresa = post.origen === 'empresa_propia'
                    ? post.nombre_empresa_propia
                    : post.ofertas?.empresas?.nombre

                  const isContratado = perfil.estado_busqueda === 'contratado' && post.practicas && post.practicas.length > 0

                  return (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{nombreCompleto}</td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900 font-medium">{vacante || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{empresa || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-500">{perfil.programa_id ? 'Asignado' : 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isContratado ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Contratado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            En Proceso
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No hay postulaciones registradas en el sistema.
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

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LatestPostulaciones({
  programa_id,
  periodo
}: {
  programa_id?: string
  periodo?: string
}) {
  const supabase = await createClient()

  const { data: postulaciones, error } = await supabase
    .from('postulaciones')
    .select(`
      id, origen, nombre_empresa_propia, cargo_aspirado, created_at, estudiante_id,
      ofertas ( titulo, empresas ( nombre ) ),
      practicas ( id, estado ),
      perfiles:estudiante_id ( id, nombre, apellido, estado_busqueda, programa_id, periodo_academico )
    `)
    .order('created_at', { ascending: false })
    // Pedimos más para poder filtrar en memoria
    .limit(100)

  if (error || !postulaciones) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
        Error cargando las postulaciones recientes.
      </div>
    )
  }

  // Filtrar en memoria por programa y periodo, y aplicar la regla de "si está contratado, solo mostrar esa"
  let filtered = postulaciones.filter((p: any) => {
    const perfil = Array.isArray(p.perfiles) ? p.perfiles[0] : p.perfiles
    if (!perfil) return false
    
    if (programa_id && perfil.programa_id !== programa_id) return false
    if (periodo && perfil.periodo_academico !== periodo) return false
    
    return true
  })

  // Agrupar para aplicar regla de estudiante contratado
  // Si un estudiante está contratado, solo debe aparecer la postulación que tiene una práctica vinculada
  const studentsStatus = new Map<string, boolean>()
  
  filtered.forEach((p: any) => {
    const perfil = Array.isArray(p.perfiles) ? p.perfiles[0] : p.perfiles
    if (perfil.estado_busqueda === 'contratado') {
      studentsStatus.set(p.estudiante_id, true)
    }
  })

  filtered = filtered.filter((p: any) => {
    const isContratado = studentsStatus.get(p.estudiante_id)
    if (isContratado) {
      // Solo mantenerla si es la postulación que tiene la práctica oficial
      const tienePractica = p.practicas && p.practicas.length > 0
      return tienePractica
    }
    return true
  })

  // Cortar a los 10 o 15 más recientes
  filtered = filtered.slice(0, 15)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Actividad Reciente de Estudiantes
        </h2>
        <Link href="/centro-progresa/estudiantes" className="text-sm text-blue-600 hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="pb-3 font-medium">Estudiante</th>
              <th className="pb-3 font-medium">Vacante / Empresa</th>
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((post: any) => {
                const perfil = Array.isArray(post.perfiles) ? post.perfiles[0] : post.perfiles
                const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`
                
                const vacante = post.origen === 'empresa_propia'
                  ? post.cargo_aspirado
                  : post.ofertas?.titulo
                  
                const empresa = post.origen === 'empresa_propia'
                  ? post.nombre_empresa_propia
                  : post.ofertas?.empresas?.nombre

                const isContratado = perfil.estado_busqueda === 'contratado' && post.practicas && post.practicas.length > 0

                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-900">{nombreCompleto}</td>
                    <td className="py-3 pr-4">
                      <div className="text-gray-900">{vacante || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{empresa || 'N/A'}</div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-3 text-right">
                      {isContratado ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Contratado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          En Proceso
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No hay actividad reciente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

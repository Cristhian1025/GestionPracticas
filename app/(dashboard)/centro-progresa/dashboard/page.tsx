import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

import KPIsEstadoBusqueda from '@/app/ui/centro-progresa/dashboard/kpis-estado-busqueda'
import EstudiantesChart from '@/app/ui/centro-progresa/dashboard/estudiantes-chart'
import DashboardFilters from '@/app/ui/centro-progresa/dashboard/dashboard-filters'

export default async function CentroProgresaDashboard(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const programa_id = searchParams?.programa_id
  const periodo = searchParams?.periodo

  const supabase = await createClient()

  // 1. Consultar KPIs principales simultáneamente para mayor rapidez
  let estudiantesPracticaQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante').eq('estado_estudiante', 'en_practica')
  let totalEstudiantesQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante')
  let perfilesQuery = supabase.from('profiles').select('estado_busqueda, programas(nombre)').eq('rol', 'estudiante')

  if (programa_id) {
    estudiantesPracticaQuery = estudiantesPracticaQuery.eq('programa_id', programa_id)
    totalEstudiantesQuery = totalEstudiantesQuery.eq('programa_id', programa_id)
    perfilesQuery = perfilesQuery.eq('programa_id', programa_id)
  }
  if (periodo) {
    estudiantesPracticaQuery = estudiantesPracticaQuery.eq('periodo_academico', periodo)
    totalEstudiantesQuery = totalEstudiantesQuery.eq('periodo_academico', periodo)
    perfilesQuery = perfilesQuery.eq('periodo_academico', periodo)
  }

  const [
    { count: empresasCount },
    { count: ofertasCount },
    { count: estudiantesPractica },
    { count: totalEstudiantes },
    { data: ultimasOfertas },
    { data: perfiles },
    { data: programasActivos }
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('ofertas').select('*', { count: 'exact', head: true }).eq('estado', 'activa'),
    estudiantesPracticaQuery,
    totalEstudiantesQuery,
    supabase.from('ofertas')
      .select('id, titulo, modalidad_trabajo, empresas(nombre)')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(4),
    perfilesQuery,
    supabase.from('programas').select('id, nombre').eq('activo', true)
  ])

  // Procesamiento para KPIs de estados de búsqueda
  const statsEstadoBusqueda = {
    sinPostulaciones: 0,
    postulados: 0,
    cartaEnviada: 0,
    cartaAprobada: 0,
    contratados: 0,
  }

  // Procesamiento para Gráfico Apilado
  const chartDataMap: Record<string, any> = {}

  if (perfiles) {
    perfiles.forEach((p: any) => {
      // 1. Conteo general
      const estado = p.estado_busqueda || 'sin_postulaciones'
      if (estado === 'sin_postulaciones') statsEstadoBusqueda.sinPostulaciones++
      else if (estado === 'postulado') statsEstadoBusqueda.postulados++
      else if (estado === 'carta_enviada') statsEstadoBusqueda.cartaEnviada++
      else if (estado === 'carta_aprobada') statsEstadoBusqueda.cartaAprobada++
      else if (estado === 'contratado') statsEstadoBusqueda.contratados++

      // 2. Conteo por programa
      const programaNombre = p.programas?.nombre || 'Sin Programa Asignado'
      if (!chartDataMap[programaNombre]) {
        chartDataMap[programaNombre] = {
          programa: programaNombre,
          sin_postulaciones: 0,
          postulado: 0,
          carta_enviada: 0,
          carta_aprobada: 0,
          contratado: 0
        }
      }
      chartDataMap[programaNombre][estado]++
    })
  }

  const chartData = Object.values(chartDataMap).sort((a: any, b: any) => a.programa.localeCompare(b.programa))

  // Cálculo para barra de progreso
  const porcentajeVinculados = totalEstudiantes && totalEstudiantes > 0
    ? Math.round(((estudiantesPractica || 0) / totalEstudiantes) * 100)
    : 0

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resumen del Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Indicadores en tiempo real de empresas, ofertas y estudiantes.
        </p>
      </div>

      <DashboardFilters programas={programasActivos || []} />

      {/* KPIs de Estados de Búsqueda */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Estudiantes por Estado de Búsqueda</h2>
        <KPIsEstadoBusqueda stats={statsEstadoBusqueda} />
      </div>

      {/* Gráfico de Barras Apiladas */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Estados de Búsqueda por Programa Académico</h2>
        <EstudiantesChart data={chartData} />
      </div>

      {/* Tarjetas de métricas globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Empresas Aliadas (Activas)</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{empresasCount || 0}</p>
          </div>
          <Link href="/centro-progresa/empresas" className="text-blue-600 text-sm font-medium mt-4 inline-block hover:underline">
            Ver empresas &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ofertas Disponibles</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{ofertasCount || 0}</p>
          </div>
          <Link href="/centro-progresa/ofertas" className="text-blue-600 text-sm font-medium mt-4 inline-block hover:underline">
            Ver ofertas &rarr;
          </Link>
        </div>


      </div>

      {/* Zona de Información Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Últimas Ofertas Publicadas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Últimas Ofertas Publicadas
          </h2>

          <div className="space-y-4">
            {ultimasOfertas && ultimasOfertas.length > 0 ? (
              ultimasOfertas.map((oferta: any) => (
                <div key={oferta.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{oferta.titulo}</h4>
                      <p className="text-sm text-gray-600">{oferta.empresas?.nombre}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600">
                      {oferta.modalidad_trabajo || 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay ofertas publicadas recientemente.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}

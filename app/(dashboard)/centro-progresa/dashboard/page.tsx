import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CentroProgresaDashboard() {
  const supabase = await createClient()

  // 1. Consultar KPIs principales simultáneamente para mayor rapidez
  const [
    { count: empresasCount },
    { count: ofertasCount },
    { count: estudiantesPractica },
    { count: totalEstudiantes },
    { data: ultimasOfertas }
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('ofertas').select('*', { count: 'exact', head: true }).eq('estado', 'activa'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante').eq('estado_estudiante', 'en_practica'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante'),
    supabase.from('ofertas')
      .select('id, titulo, modalidad_trabajo, empresas(nombre)')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(4)
  ])

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

      {/* Tarjetas de métricas */}
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Estudiantes en Práctica</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{estudiantesPractica || 0}</p>
            <p className="text-sm text-gray-500 font-medium">de {totalEstudiantes || 0}</p>
          </div>
          {/* Barra de Progreso */}
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeVinculados}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{porcentajeVinculados}% del total de estudiantes registrados</p>
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

        {/* Métrica Decorativa o de Estado Global */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-sm border border-blue-700 p-8 text-white flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Estado General Saludable</h2>
          <p className="text-blue-100 max-w-sm">
            El sistema está operando correctamente. Has registrado un total de {empresasCount || 0} empresas que actualmente mantienen {ofertasCount || 0} convocatorias abiertas para los estudiantes.
          </p>
        </div>

      </div>
    </main>
  )
}

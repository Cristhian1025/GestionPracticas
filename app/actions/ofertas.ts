'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function listarOfertas(page: number = 1, query: string = '', limit: number = 10) {
  const supabase = await createClient()
  
  const start = (page - 1) * limit
  const end = start + limit - 1

  let supabaseQuery = supabase
    .from('ofertas')
    .select(`
      *,
      empresas ( nombre ),
      programas ( nombre )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (query) {
    supabaseQuery = supabaseQuery.ilike('titulo', `%${query}%`)
  }

  const { data, count, error } = await supabaseQuery.range(start, end)

  if (error) {
    console.error('Error fetching ofertas:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data, count, error: null }
}

export async function obtenerOferta(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function obtenerOpcionesFormulario() {
  const supabase = await createClient()

  // Obtener empresas activas
  const { data: empresas } = await supabase
    .from('empresas')
    .select('id, nombre')
    .eq('activa', true)
    .order('nombre')

  // Obtener coordinadores (eliminado, ahora es texto libre)

  // Obtener programas (asumiendo que existe una tabla 'programas' con 'nombre')
  const { data: programas } = await supabase
    .from('programas')
    .select('id, nombre')
    .order('nombre')

  return {
    empresas: empresas || [], 
    programas: programas || [] 
  }
}

export async function crearOferta(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const newOferta = {
    empresa_id: formData.get('empresa_id') as string,
    coordinador_nombre: formData.get('coordinador_nombre') as string || null,
    programa_id: formData.get('programa_id') as string || null,
    meses_practica: formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : null,
    titulo: formData.get('titulo') as string,
    descripcion: formData.get('descripcion') as string || null,
    modalidad_contrato: formData.get('modalidad_contrato') as string || null,
    ciudad: formData.get('ciudad') as string || null,
    vacantes: formData.get('vacantes') ? parseInt(formData.get('vacantes') as string) : 1,
    estado: formData.get('estado') ? 'activa' : 'cerrada',
    fecha_cierre: formData.get('fecha_cierre') as string || null,
    modalidad_trabajo: formData.get('modalidad_trabajo') as string || null,
    remuneracion: formData.get('remuneracion') as string || null,
    horario: formData.get('horario') as string || null,
    cubre_arl: true // Oculto en UI, siempre true
  }

  const { error } = await supabase.from('ofertas').insert(newOferta)

  if (error) {
    console.error('Error creando oferta:', error)
    return { error: error.message }
  }

  revalidatePath('/centro-progresa/ofertas')
  revalidatePath('/centro-progresa/dashboard')
  return { success: true }
}

export async function actualizarOferta(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const updatedOferta = {
    empresa_id: formData.get('empresa_id') as string,
    coordinador_nombre: formData.get('coordinador_nombre') as string || null,
    programa_id: formData.get('programa_id') as string || null,
    meses_practica: formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : null,
    titulo: formData.get('titulo') as string,
    descripcion: formData.get('descripcion') as string || null,
    modalidad_contrato: formData.get('modalidad_contrato') as string || null,
    ciudad: formData.get('ciudad') as string || null,
    vacantes: formData.get('vacantes') ? parseInt(formData.get('vacantes') as string) : 1,
    estado: formData.get('estado') ? 'activa' : 'cerrada',
    fecha_cierre: formData.get('fecha_cierre') as string || null,
    modalidad_trabajo: formData.get('modalidad_trabajo') as string || null,
    remuneracion: formData.get('remuneracion') as string || null,
    horario: formData.get('horario') as string || null,
    cubre_arl: true
  }

  const { error } = await supabase
    .from('ofertas')
    .update(updatedOferta)
    .eq('id', id)

  if (error) {
    console.error('Error actualizando oferta:', error)
    return { error: error.message }
  }

  revalidatePath('/centro-progresa/ofertas')
  revalidatePath('/centro-progresa/dashboard')
  return { success: true }
}

export async function cambiarEstadoOferta(id: string, nuevoEstado: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ofertas')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/centro-progresa/ofertas')
  return { success: true }
}

export async function listarOfertasVacantes(page: number = 1, query: string = '', limit: number = 20) {
  const supabase = await createClient()

  const start = (page - 1) * limit
  const end = start + limit - 1

  let q = supabase
    .from('ofertas')
    .select('id, titulo, vacantes, estado, empresas(nombre, nit, ciudad)', { count: 'exact' })
    .eq('estado', 'activa')
    .order('titulo', { ascending: true })

  if (query) {
    q = q.or(`titulo.ilike.%${query}%`)
  }

  const { data, count, error } = await q.range(start, end)

  if (error) return { data: [], count: 0, error: error.message }

  // Calcular vacantes disponibles y postulados en memoria
  const processed = await Promise.all(
    (data || []).map(async (oferta: any) => {
      const vacantes_totales = oferta.vacantes || 0
      
      let postulados = 0
      let en_proceso = 0

      // Create admin client to bypass RLS for postulations
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      // Get postulaciones for this oferta using admin client
      const { data: posts } = await adminClient
        .from('postulaciones')
        .select('id, estudiante_id, profiles:estudiante_id(estado_busqueda), documentos(id), practicas(id, estado)')
        .eq('oferta_id', oferta.id)

      let contratados = 0

      posts?.forEach((p: any) => {
        // Count hired students for this postulation
        if (p.practicas) {
          const practicasArray = Array.isArray(p.practicas) ? p.practicas : [p.practicas]
          const activas = practicasArray.filter((pr: any) => pr.estado === 'en_curso')
          contratados += activas.length
        }

        const estadoGlobal = p.profiles?.estado_busqueda
        if (estadoGlobal === 'contratado') return 
        
        if (p.documentos && p.documentos.length > 0) {
          en_proceso++
        } else {
          postulados++
        }
      })

      return {
        id: oferta.id,
        cargo: oferta.titulo,
        empresa: Array.isArray(oferta.empresas) ? oferta.empresas[0]?.nombre : oferta.empresas?.nombre,
        ciudad: Array.isArray(oferta.empresas) ? oferta.empresas[0]?.ciudad : oferta.empresas?.ciudad,
        nit: Array.isArray(oferta.empresas) ? oferta.empresas[0]?.nit : oferta.empresas?.nit,
        vacantes_totales,
        postulados,
        en_proceso,
        contratados,
        vacantes_disponibles: Math.max(0, vacantes_totales - contratados)
      }
    })
  )

  return { data: processed, count, error: null }
}

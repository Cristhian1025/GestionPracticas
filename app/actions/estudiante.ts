'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function listarOfertasParaEstudiante(page: number = 1, limit: number = 12) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'No autorizado' }

  // Obtener perfil del estudiante para saber su programa
  const { data: perfil } = await supabase
    .from('profiles')
    .select('programa_id, meses_practica')
    .eq('id', user.id)
    .single()

  const start = (page - 1) * limit
  const end = start + limit - 1

  // Buscar ofertas activas que apliquen al programa del estudiante o que sean globales (programa_id = null)
  let query = supabase
    .from('ofertas')
    .select(`
      *,
      empresas (nombre, ciudad, sector)
    `, { count: 'exact' })
    .eq('estado', 'activa')
    .order('created_at', { ascending: false })

  if (perfil?.programa_id) {
    query = query.or(`programa_id.eq.${perfil.programa_id},programa_id.is.null`)
  }

  // También se podría filtrar por nivel de práctica si fuera estricto, pero por ahora mostramos todas las que apliquen a su carrera.

  const { data, count, error } = await query.range(start, end)

  if (error) {
    console.error('Error fetching ofertas for student:', error)
    return { data: [], count: 0, error: error.message }
  }

  // Buscar a cuáles ofertas ya se ha postulado el estudiante
  const { data: postulaciones } = await supabase
    .from('postulaciones')
    .select('oferta_id')
    .eq('estudiante_id', user.id)
    .eq('origen', 'oferta_sistema')

  const ofertasPostuladas = postulaciones?.map(p => p.oferta_id) || []

  return { 
    data, 
    count, 
    postuladas: ofertasPostuladas,
    error: null 
  }
}

export async function postularAOfertaSistema(ofertaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // Verificar si ya está postulado
  const { data: existente } = await supabase
    .from('postulaciones')
    .select('id')
    .eq('estudiante_id', user.id)
    .eq('oferta_id', ofertaId)
    .single()

  if (existente) {
    return { error: 'Ya te has postulado a esta oferta.' }
  }

  const { error } = await supabase.from('postulaciones').insert({
    estudiante_id: user.id,
    oferta_id: ofertaId,
    origen: 'oferta_sistema'
  })

  if (error) {
    console.error('Error al postularse:', error)
    return { error: error.message }
  }

  revalidatePath('/estudiante/ofertas')
  return { success: true }
}

export async function registrarOfertaExterna(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const nombre_empresa = formData.get('nombre_empresa_propia') as string
  const cargo = formData.get('cargo_aspirado') as string

  if (!nombre_empresa || !cargo) {
    return { error: 'Debes completar todos los campos.' }
  }

  const { error } = await supabase.from('postulaciones').insert({
    estudiante_id: user.id,
    origen: 'empresa_propia',
    nombre_empresa_propia: nombre_empresa,
    cargo_aspirado: cargo
  })

  if (error) {
    console.error('Error registrando oferta externa:', error)
    return { error: error.message }
  }

  revalidatePath('/estudiante/ofertas')
  return { success: true }
}

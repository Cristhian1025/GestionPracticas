'use server'

import { createClient } from '@/lib/supabase/server'

export async function listarEstudiantesCentroProgresa(
  page: number = 1,
  filters: {
    query?: string
    programa_id?: string
    estado_academico?: string
    estado_busqueda?: string
    meses_practica?: string
  } = {}
) {
  const supabase = await createClient()
  const limit = 20
  const start = (page - 1) * limit
  const end = start + limit - 1

  let q = supabase
    .from('profiles')
    .select(`
      id, nombre, apellido, email, telefono,
      estado_academico, estado_busqueda, meses_practica, created_at,
      programas ( id, nombre )
    `, { count: 'exact' })
    .eq('rol', 'estudiante')
    .order('apellido', { ascending: true })

  if (filters.query) {
    q = q.or(
      `nombre.ilike.%${filters.query}%,apellido.ilike.%${filters.query}%,email.ilike.%${filters.query}%`
    )
  }
  if (filters.programa_id) {
    q = q.eq('programa_id', filters.programa_id)
  }
  if (filters.estado_academico) {
    q = q.eq('estado_academico', filters.estado_academico)
  }
  if (filters.estado_busqueda) {
    q = q.eq('estado_busqueda', filters.estado_busqueda)
  }
  if (filters.meses_practica) {
    q = q.eq('meses_practica', parseInt(filters.meses_practica))
  }

  const { data, count, error } = await q.range(start, end)

  if (error) {
    console.error('Error listando estudiantes:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data, count: count || 0, error: null }
}

export async function listarProgramasParaFiltro() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('programas')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  return data || []
}

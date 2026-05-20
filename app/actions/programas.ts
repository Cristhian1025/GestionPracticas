'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function listarProgramas(page: number = 1, query: string = '', limit: number = 20) {
  const supabase = await createClient()
  
  const start = (page - 1) * limit
  const end = start + limit - 1

  let supabaseQuery = supabase
    .from('programas')
    .select('*', { count: 'exact' })
    .order('nombre', { ascending: true })

  if (query) {
    supabaseQuery = supabaseQuery.or(`nombre.ilike.%${query}%,codigo.ilike.%${query}%`)
  }

  const { data, count, error } = await supabaseQuery.range(start, end)

  if (error) {
    console.error('Error fetching programas:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data, count, error: null }
}

export async function obtenerPrograma(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function crearPrograma(formData: FormData) {
  const supabase = await createClient()
  
  const newPrograma = {
    nombre: formData.get('nombre') as string,
    codigo: formData.get('codigo') as string || null,
    sede: formData.get('sede') as string,
    meses_practica: formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : 6,
    activo: formData.get('activo') === 'true'
  }

  const { error } = await supabase.from('programas').insert(newPrograma)

  if (error) {
    console.error('Error creando programa:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/programas')
  return { success: true }
}

export async function actualizarPrograma(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const updatedPrograma = {
    nombre: formData.get('nombre') as string,
    codigo: formData.get('codigo') as string || null,
    sede: formData.get('sede') as string,
    meses_practica: formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : 6,
    activo: formData.get('activo') === 'true'
  }

  const { error } = await supabase
    .from('programas')
    .update(updatedPrograma)
    .eq('id', id)

  if (error) {
    console.error('Error actualizando programa:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/programas')
  return { success: true }
}

export async function cambiarEstadoPrograma(id: string, activo: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('programas')
    .update({ activo })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/programas')
  return { success: true }
}

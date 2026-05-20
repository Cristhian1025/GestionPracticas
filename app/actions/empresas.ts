'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function listarEmpresas(page: number = 1, query: string = '', limit: number = 20) {
  const supabase = await createClient()
  
  const start = (page - 1) * limit
  const end = start + limit - 1

  let supabaseQuery = supabase
    .from('empresas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (query) {
    supabaseQuery = supabaseQuery.or(`nombre.ilike.%${query}%,nit.ilike.%${query}%`)
  }

  const { data, count, error } = await supabaseQuery.range(start, end)

  if (error) {
    console.error('Error fetching empresas:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data, count, error: null }
}

export async function obtenerEmpresa(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function crearEmpresa(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const newEmpresa = {
    registrada_por: user.id,
    nombre: formData.get('nombre') as string,
    nit: formData.get('nit') as string,
    sector: formData.get('sector') as string,
    ciudad: formData.get('ciudad') as string,
    nombre_contacto: formData.get('nombre_contacto') as string,
    cargo_contacto: formData.get('cargo_contacto') as string,
    email_contacto: formData.get('email_contacto') as string,
    telefono_contacto: formData.get('telefono_contacto') as string,
    activa: formData.get('activa') === 'true'
  }

  const { error } = await supabase.from('empresas').insert(newEmpresa)

  if (error) {
    console.error('Error creando empresa:', error)
    return { error: error.message }
  }

  revalidatePath('/centro-progresa/empresas')
  revalidatePath('/centro-progresa/dashboard')
  return { success: true }
}

export async function actualizarEmpresa(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const updatedEmpresa = {
    nombre: formData.get('nombre') as string,
    nit: formData.get('nit') as string,
    sector: formData.get('sector') as string,
    ciudad: formData.get('ciudad') as string,
    nombre_contacto: formData.get('nombre_contacto') as string,
    cargo_contacto: formData.get('cargo_contacto') as string,
    email_contacto: formData.get('email_contacto') as string,
    telefono_contacto: formData.get('telefono_contacto') as string,
    activa: formData.get('activa') === 'true'
  }

  const { error } = await supabase
    .from('empresas')
    .update(updatedEmpresa)
    .eq('id', id)

  if (error) {
    console.error('Error actualizando empresa:', error)
    return { error: error.message }
  }

  revalidatePath('/centro-progresa/empresas')
  revalidatePath('/centro-progresa/dashboard')
  return { success: true }
}

export async function cambiarEstadoEmpresa(id: string, activar: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('empresas')
    .update({ activa: activar })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/centro-progresa/empresas')
  return { success: true }
}

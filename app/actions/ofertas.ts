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

  // Obtener coordinadores (usuarios con rol 'coordinador')
  const { data: coordinadores } = await supabase
    .from('profiles')
    .select('id, nombre, apellido')
    .eq('rol', 'coordinador')

  // Obtener programas (asumiendo que existe una tabla 'programas' con 'nombre')
  const { data: programas } = await supabase
    .from('programas')
    .select('id, nombre')
    .order('nombre')

  return { 
    empresas: empresas || [], 
    coordinadores: coordinadores || [], 
    programas: programas || [] 
  }
}

export async function crearOferta(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const newOferta = {
    empresa_id: formData.get('empresa_id') as string,
    coordinador_id: formData.get('coordinador_id') as string,
    programa_id: formData.get('programa_id') as string || null,
    nivel_practica: formData.get('nivel_practica') ? parseInt(formData.get('nivel_practica') as string) : null,
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
    cubre_arl: formData.get('cubre_arl') === 'true'
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
    coordinador_id: formData.get('coordinador_id') as string,
    programa_id: formData.get('programa_id') as string || null,
    nivel_practica: formData.get('nivel_practica') ? parseInt(formData.get('nivel_practica') as string) : null,
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
    cubre_arl: formData.get('cubre_arl') === 'true'
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

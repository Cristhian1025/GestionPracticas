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

export async function listarEmpresasVacantes(page: number = 1, query: string = '', limit: number = 20) {
  const supabase = await createClient()

  const start = (page - 1) * limit
  const end = start + limit - 1

  let q = supabase
    .from('empresas')
    .select('id, nombre, nit, ciudad, ofertas(id, vacantes, estado), practicas(id, estado)', { count: 'exact' })
    .eq('activa', true)
    .order('nombre', { ascending: true })

  if (query) q = q.or(`nombre.ilike.%${query}%,nit.ilike.%${query}%`)

  const { data, count, error } = await q.range(start, end)

  if (error) return { data: [], count: 0, error: error.message }

  // Calcular vacantes disponibles y postulados en memoria
  const processed = await Promise.all(
    (data || []).map(async (empresa: any) => {
      const vacantes_totales = empresa.ofertas
        ?.filter((o: any) => o.estado === 'activa')
        .reduce((sum: number, o: any) => sum + (o.vacantes || 0), 0) ?? 0

      const ofertaIds = empresa.ofertas?.map((o: any) => o.id) ?? []
      let postulados = 0
      let en_proceso = 0

      if (ofertaIds.length > 0) {
        const { data: posts } = await supabase
          .from('postulaciones')
          .select('estudiante_id, perfiles:estudiante_id(estado_busqueda), documentos(id)')
          .in('oferta_id', ofertaIds)

        posts?.forEach((p: any) => {
          const estadoGlobal = p.perfiles?.estado_busqueda
          // Si ya está contratado en alguna empresa, sus postulaciones restantes no cuentan
          if (estadoGlobal === 'contratado') return 
          
          if (p.documentos && p.documentos.length > 0) {
            en_proceso++
          } else {
            postulados++
          }
        })
      }

      const contratados = empresa.practicas?.filter((p: any) => p.estado === 'en_curso').length ?? 0

      return {
        id: empresa.id,
        nombre: empresa.nombre,
        nit: empresa.nit,
        ciudad: empresa.ciudad,
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

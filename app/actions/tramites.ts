'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function listarPostulacionesEstudiante() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'No autorizado' }

  // Buscamos las postulaciones del estudiante, junto con la info de la oferta (si existe) y los documentos amarrados a la postulación
  const { data, error } = await supabase
    .from('postulaciones')
    .select(`
      id, origen, nombre_empresa_propia, cargo_aspirado, created_at,
      ofertas ( titulo, empresas (nombre) ),
      documentos ( id, nombre_archivo, url_storage, estado, observaciones, tipo )
    `)
    .eq('estudiante_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching postulaciones:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function subirCartaFunciones(postulacionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No se seleccionó ningún archivo' }

  if (file.type !== 'application/pdf') {
    return { error: 'El archivo debe ser un PDF' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'El archivo no debe pesar más de 5MB' }
  }

  // 1. Subir archivo a Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${uuidv4()}.${fileExt}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documentos_practica')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    console.error('Error subiendo archivo:', uploadError)
    return { error: 'Error al subir el archivo al servidor. Verifica que el bucket "documentos_practica" exista y sea público.' }
  }

  // 2. Obtener URL pública (asumiendo que el bucket es público)
  const { data: urlData } = supabase.storage
    .from('documentos_practica')
    .getPublicUrl(fileName)

  // 3. Insertar registro en la tabla documentos
  const { error: dbError } = await supabase.from('documentos').insert({
    subido_por: user.id,
    postulacion_id: postulacionId,
    tipo: 'carta_funciones',
    nombre_archivo: file.name,
    url_storage: urlData.publicUrl,
    estado: 'pendiente'
  })

  if (dbError) {
    console.error('Error guardando en BD:', dbError)
    return { error: dbError.message }
  }

  revalidatePath('/estudiante/tramites')
  return { success: true }
}

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

  const { data: perfil } = await supabase
    .from('profiles')
    .select('estado_busqueda')
    .eq('id', user.id)
    .single()

  return { data, estado_busqueda: perfil?.estado_busqueda || null, error: null }
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

  // 1. Instanciar Admin Client para saltarse políticas RLS y auto-crear buckets en Storage
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${uuidv4()}.${fileExt}`
  
  let { data: uploadData, error: uploadError } = await adminClient.storage
    .from('documentos_practica')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError && (uploadError.message?.includes('Bucket not found') || (uploadError as any).status === 400 || (uploadError as any).statusCode === '404')) {
    console.log('Bucket "documentos_practica" no encontrado. Intentando crearlo automáticamente...')
    try {
      // Crear bucket público 'documentos_practica'
      const { error: bucketError } = await adminClient.storage.createBucket('documentos_practica', {
        public: true
      })

      if (!bucketError || bucketError.message?.includes('already exists')) {
        console.log('Bucket creado con éxito o ya existente. Reintentando la subida...')
        // Reintentar upload
        const retry = await adminClient.storage
          .from('documentos_practica')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          })
        uploadData = retry.data
        uploadError = retry.error
      } else {
        console.error('Error al crear el bucket:', bucketError)
      }
    } catch (e) {
      console.error('Error en proceso de auto-creación de bucket:', e)
    }
  }

  if (uploadError) {
    console.error('Error subiendo archivo:', uploadError)
    return { error: `Error al subir el archivo al servidor: ${uploadError.message}.` }
  }

  // 2. Obtener URL pública (asumiendo que el bucket es público)
  const { data: urlData } = adminClient.storage
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

  // Actualizar el estado del estudiante
  await supabase.from('profiles').update({ estado_busqueda: 'carta_enviada' }).eq('id', user.id)

  revalidatePath('/estudiante/tramites')
  return { success: true }
}

export async function eliminarDocumentoRechazado(documentoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // 1. Obtener documento para verificar que pertenece al usuario y está rechazado
  const { data: documento, error: docError } = await supabase
    .from('documentos')
    .select('id, url_storage, estado, postulaciones!inner(estudiante_id)')
    .eq('id', documentoId)
    .single()

  if (docError || !documento) return { error: 'Documento no encontrado.' }
  
  const postulacion = documento.postulaciones as any
  if (postulacion.estudiante_id !== user.id) return { error: 'No autorizado.' }
  if (documento.estado !== 'rechazado') return { error: 'Solo puedes eliminar documentos rechazados.' }

  // 2. Extraer fileName de la URL (opcional, si queremos borrar del storage)
  // Por simplicidad y evitar errores con el RLS del Storage, usamos el adminClient
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const urlParts = documento.url_storage.split('/')
    const fileName = urlParts[urlParts.length - 1]
    await adminClient.storage.from('documentos_practica').remove([fileName])
  } catch (e) {
    console.error('Error al intentar borrar del storage:', e)
  }

  // 3. Borrar registro de BD
  const { error: deleteError } = await adminClient
    .from('documentos')
    .delete()
    .eq('id', documentoId)

  if (deleteError) {
    console.error('Error al borrar documento:', deleteError)
    return { error: 'No se pudo eliminar el documento de la base de datos.' }
  }

  // 4. Actualizar estado del estudiante para que vuelva a estar solo "postulado" (o el que corresponda)
  await supabase.from('profiles').update({ estado_busqueda: 'postulado' }).eq('id', user.id)

  revalidatePath('/estudiante/tramites')
  return { success: true }
}

export async function marcarComoContratado(postulacionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // 1. Obtener la postulación
  const { data: postulacion, error: postError } = await supabase
    .from('postulaciones')
    .select(`
      id, estudiante_id, origen, nombre_empresa_propia, cargo_aspirado,
      ofertas ( empresa_id, modalidad_contrato, titulo )
    `)
    .eq('id', postulacionId)
    .eq('estudiante_id', user.id)
    .single()

  if (postError || !postulacion) {
    return { error: 'Postulación no encontrada.' }
  }

  // 2. Preparar datos para la práctica
  let empresaId: string | null = null
  let modalidadContrato: string | null = 'convenio_especial'
  let cargo: string = 'Practicante'

  if (postulacion.origen === 'oferta_sistema' && postulacion.ofertas) {
    const oferta: any = Array.isArray(postulacion.ofertas) ? postulacion.ofertas[0] : postulacion.ofertas
    if (oferta) {
      empresaId = oferta.empresa_id
      modalidadContrato = oferta.modalidad_contrato
      cargo = oferta.titulo
    }
  } else if (postulacion.origen === 'empresa_propia') {
    cargo = postulacion.cargo_aspirado || 'Practicante Externa'
  }

  // 3. Obtener el coordinador que aprobó la carta, o cualquier coordinador activo
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: docAprobado } = await adminClient
    .from('documentos')
    .select('revisado_por')
    .eq('postulacion_id', postulacion.id)
    .eq('tipo', 'carta_funciones')
    .eq('estado', 'aprobado')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let coordinadorId = docAprobado?.revisado_por

  if (!coordinadorId) {
    const { data: adminUser } = await adminClient.from('profiles').select('id').eq('rol', 'coordinador').limit(1).single()
    coordinadorId = adminUser?.id
  }

  // 4. Insertar la práctica oficial usando adminClient para evadir el RLS de inserción
  const { error: insertPracticaError } = await adminClient
    .from('practicas')
    .insert({
      estudiante_id: user.id,
      coordinador_id: coordinadorId,
      empresa_id: empresaId,
      postulacion_id: postulacion.id,
      modalidad_contrato: modalidadContrato,
      estado: 'activa',
      cargo: cargo,
      fecha_inicio: new Date().toISOString().split('T')[0]
    })

  if (insertPracticaError) {
    console.error('Error al crear práctica oficial:', insertPracticaError)
    return { error: `Ocurrió un error al formalizar la práctica: ${insertPracticaError.message}` }
  }

  // 4. Actualizar el perfil del estudiante
  const { error: updateStudentError } = await supabase
    .from('profiles')
    .update({
      estado_busqueda: 'contratado',
      estado_academico: 'habilitado'
    })
    .eq('id', user.id)

  if (updateStudentError) {
    console.error('Error al actualizar estados del estudiante:', updateStudentError)
  }

  revalidatePath('/estudiante/tramites')
  revalidatePath('/estudiante/ofertas')
  return { success: true }
}

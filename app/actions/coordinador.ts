'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Obtiene el perfil del coordinador logueado
export async function obtenerPerfilCoordinador() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'No autorizado' }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, apellido, rol, programa_id, programas (nombre)')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching coordinator profile:', error)
    return { data: null, error: error.message }
  }

  if (data.rol !== 'coordinador') {
    return { data: null, error: 'Acceso restringido a coordinadores' }
  }

  return { data, error: null }
}

// Obtiene estadísticas/métricas para el dashboard del coordinador
export async function obtenerMetricasCoordinador() {
  const perfilRes = await obtenerPerfilCoordinador()
  if (perfilRes.error || !perfilRes.data) return { data: null, error: perfilRes.error }

  const programaId = perfilRes.data.programa_id
  if (!programaId) return { data: null, error: 'No tienes un programa académico asignado' }

  const supabase = await createClient()

  // 1. Total estudiantes de su programa
  const { count: totalEstudiantes, error: e1 } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'estudiante')
    .eq('programa_id', programaId)

  // 2. Prácticas activas
  // Hacemos una subconsulta/join conceptual: buscamos estudiantes de este programa
  const { data: estudiantesPrograma } = await supabase
    .from('profiles')
    .select('id')
    .eq('rol', 'estudiante')
    .eq('programa_id', programaId)

  const studentIds = estudiantesPrograma?.map(e => e.id) || []

  let totalPracticasActivas = 0
  if (studentIds.length > 0) {
    const { count, error: e2 } = await supabase
      .from('practicas')
      .select('*', { count: 'exact', head: true })
      .in('estudiante_id', studentIds)
      .eq('estado', 'activa')
    totalPracticasActivas = count || 0
  }

  // 3. Cartas de funciones pendientes de revisión
  let documentosPendientes = 0
  if (studentIds.length > 0) {
    const { count, error: e3 } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .in('subido_por', studentIds)
      .eq('tipo', 'carta_funciones')
      .eq('estado', 'pendiente')
    documentosPendientes = count || 0
  }

  return {
    data: {
      totalEstudiantes: totalEstudiantes || 0,
      totalPracticasActivas,
      documentosPendientes
    },
    error: null
  }
}

// Obtiene la lista de estudiantes filtrados por el programa del coordinador
export async function listarEstudiantesCoordinador() {
  const perfilRes = await obtenerPerfilCoordinador()
  if (perfilRes.error || !perfilRes.data) return { data: [], error: perfilRes.error }

  const programaId = perfilRes.data.programa_id
  if (!programaId) return { data: [], error: 'No tienes un programa académico asignado' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, nombre, apellido, email, telefono, estado_academico, estado_busqueda, meses_practica, created_at
    `)
    .eq('rol', 'estudiante')
    .eq('programa_id', programaId)
    .order('apellido', { ascending: true })

  if (error) {
    console.error('Error al listar estudiantes:', error)
    return { data: [], error: error.message }
  }

  return { data, error: null }
}

// Obtiene las cartas de funciones pendientes (o todas) del programa del coordinador
export async function listarRevisionesCoordinador() {
  const perfilRes = await obtenerPerfilCoordinador()
  if (perfilRes.error || !perfilRes.data) return { data: [], error: perfilRes.error }

  const programaId = perfilRes.data.programa_id
  if (!programaId) return { data: [], error: 'No tienes un programa académico asignado' }

  const supabase = await createClient()

  // Buscamos documentos del tipo 'carta_funciones' subidos por estudiantes de este programa
  const { data: estudiantes } = await supabase
    .from('profiles')
    .select('id, nombre, apellido')
    .eq('rol', 'estudiante')
    .eq('programa_id', programaId)

  const studentIds = estudiantes?.map(e => e.id) || []
  const studentMap = new Map(estudiantes?.map(e => [e.id, `${e.nombre} ${e.apellido}`]))

  if (studentIds.length === 0) return { data: [], error: null }

  const { data: documentos, error } = await supabase
    .from('documentos')
    .select(`
      id, nombre_archivo, url_storage, estado, observaciones, created_at, subido_por, postulacion_id,
      postulaciones (
        id, origen, nombre_empresa_propia, cargo_aspirado,
        ofertas (
          titulo,
          empresas ( nombre )
        )
      )
    `)
    .in('subido_por', studentIds)
    .eq('tipo', 'carta_funciones')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al listar documentos:', error)
    return { data: [], error: error.message }
  }

  // Agrupar estudiante a cada documento
  const dataConEstudiante = documentos.map((doc: any) => ({
    ...doc,
    estudiante_nombre: studentMap.get(doc.subido_por) || 'Estudiante Desconocido'
  }))

  return { data: dataConEstudiante, error: null }
}

// Acción para Aprobar o Rechazar una carta de funciones
export async function revisarDocumento(
  documentoId: string, 
  estado: 'aprobado' | 'rechazado', 
  observaciones?: string
) {
  const perfilRes = await obtenerPerfilCoordinador()
  if (perfilRes.error || !perfilRes.data) return { error: perfilRes.error }

  const coordinadorId = perfilRes.data.id
  const supabase = await createClient()

  // 1. Obtener detalles del documento y su postulación asociada
  const { data: documento, error: docError } = await supabase
    .from('documentos')
    .select(`
      id, subido_por, postulacion_id,
      postulaciones (
        id, estudiante_id, origen, nombre_empresa_propia, cargo_aspirado, oferta_id,
        ofertas (
          titulo, empresa_id, modalidad_contrato
        )
      )
    `)
    .eq('id', documentoId)
    .single()

  if (docError || !documento) {
    return { error: 'Documento no encontrado o sin postulación asociada' }
  }

  // 2. Actualizar estado del documento
  const { error: updateDocError } = await supabase
    .from('documentos')
    .update({ 
      estado, 
      observaciones: observaciones || null 
    })
    .eq('id', documentoId)

  if (updateDocError) {
    console.error('Error al actualizar documento:', updateDocError)
    return { error: updateDocError.message }
  }

  // 3. Si se aprueba, cambiar estado del estudiante a "Carta Aprobada"
  if (estado === 'aprobado') {
    const postulacion = documento.postulaciones as any

    const { error: updateStudentError } = await supabase
      .from('profiles')
      .update({
        estado_busqueda: 'carta_aprobada'
      })
      .eq('id', postulacion.estudiante_id)

    if (updateStudentError) {
      console.error('Error al actualizar estados del estudiante:', updateStudentError)
      return { error: 'Documento aprobado pero falló al actualizar el estado del estudiante.' }
    }
  }

  revalidatePath('/coordinador/revisiones')
  revalidatePath('/coordinador/dashboard')
  return { success: true }
}

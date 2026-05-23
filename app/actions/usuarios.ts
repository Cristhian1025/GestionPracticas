'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'


// Cliente con service_role para crear usuarios desde el admin
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )
}

function calcularPeriodoAcademico(modalidad: string, fechaRegistro: Date = new Date()) {
  const mes = fechaRegistro.getMonth() + 1 // 1-12
  const ano = fechaRegistro.getFullYear()

  if (modalidad === 'semestral') {
    if (mes >= 5 && mes <= 7) return `${ano}-60` // Mayo, Junio, Julio
    if (mes === 12) return `${ano + 1}-10`       // Diciembre
    if (mes <= 2) return `${ano}-10`             // Enero, Febrero
    if (mes >= 8 && mes <= 11) return `${ano + 1}-10`
    return `${ano}-10`
  } else if (modalidad === 'cuatrimestral') {
    if (mes === 12) return `${ano + 1}-40`
    if (mes <= 1) return `${ano}-40`             // Enero
    if (mes >= 4 && mes <= 5) return `${ano}-45` // Abril, Mayo
    if (mes >= 8 && mes <= 9) return `${ano}-50` // Agosto, Septiembre
    
    if (mes >= 2 && mes <= 3) return `${ano}-45`
    if (mes >= 6 && mes <= 7) return `${ano}-50`
    if (mes >= 10 && mes <= 11) return `${ano + 1}-40`
    return `${ano}-40`
  }
  return null
}

export async function crearUsuario(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('user:', user?.id)
  console.log('authError:', authError)

  if (!user) return { error: 'No autenticado' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  console.log('profile:', profile)
  console.log('profileError:', profileError)

  if (profile?.rol !== 'admin') return { error: 'No autorizado' }

  const admin = getAdminClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre   = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const rol      = formData.get('rol') as string
  
  const telefono          = formData.get('telefono') as string
  const programa_id       = formData.get('programa_id') as string
  const meses_practica    = formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : null
  const estado_academico  = formData.get('estado_academico') as string
  const estado_busqueda   = formData.get('estado_busqueda') as string

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { 
      nombre, 
      apellido, 
      rol,
      telefono: telefono || null,
      programa_id: programa_id || null,
      meses_practica: meses_practica || null,
      estado_academico: estado_academico || null,
      estado_busqueda: estado_busqueda || null
    }
  })

  console.log('createUser error:', error)
  console.log('createUser data:', data?.user?.id)

  if (error) return { error: error.message }

  // Calcular periodo académico si es estudiante y tiene programa
  let periodoAcademico = null
  if (rol === 'estudiante' && programa_id) {
    const { data: programaInfo } = await admin.from('programas').select('modalidad').eq('id', programa_id).single()
    if (programaInfo?.modalidad) {
      periodoAcademico = calcularPeriodoAcademico(programaInfo.modalidad)
    }
  }

  // Actualizar la tabla profiles con los campos extra
  // (por si el trigger de la base de datos no está configurado para copiarlos automáticamente)
  const { error: updateError } = await admin.from('profiles').update({
    telefono: telefono || null,
    programa_id: programa_id || null,
    meses_practica: meses_practica || null,
    estado_academico: estado_academico || null,
    estado_busqueda: estado_busqueda || null,
    periodo_academico: periodoAcademico
  }).eq('id', data.user.id)

  if (updateError) {
    console.error('Error actualizando perfil extra:', updateError)
  }

  revalidatePath('/admin/usuarios')
  return { success: true, id: data.user.id }
}


export async function listarUsuarios(page: number = 1, query: string = '', rol: string = '') {
  const supabase = await createClient()
  
  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let supabaseQuery = supabase
    .from('profiles')
    .select(`
      id, nombre, apellido, email, rol, created_at, is_active,
      telefono, meses_practica, estado_academico, estado_busqueda,
      programas ( id, nombre )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (query) {
    supabaseQuery = supabaseQuery.or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,email.ilike.%${query}%`)
  }

  if (rol) {
    supabaseQuery = supabaseQuery.eq('rol', rol)
  }

  const { data, count, error } = await supabaseQuery

  if (error) return { error: error.message }
  return { data, count: count || 0 }
}

export async function listarProgramas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programas')
    .select('id, nombre')
    .order('nombre')

  if (error) return { error: error.message }
  return { data }
}

export async function desactivarUsuario(id: string) {
  const admin = getAdminClient()

  // 1. Limpiar dependencias del estudiante (simular ON DELETE CASCADE)
  // Prácticas
  await admin.from('practicas').delete().eq('estudiante_id', id)
  
  // Postulaciones y sus documentos
  const { data: posts } = await admin.from('postulaciones').select('id').eq('estudiante_id', id)
  if (posts && posts.length > 0) {
    const postIds = posts.map(p => p.id)
    await admin.from('documentos').delete().in('postulacion_id', postIds)
    await admin.from('postulaciones').delete().in('id', postIds)
  }

  // 2. Eliminar de Auth (esto también eliminará el profile por cascade)
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function cambiarEstadoUsuario(id: string, bloquear: boolean) {
  const admin = getAdminClient()
  
  // Si bloqueamos, ponemos un ban de 100 años (876000 horas). Si no, quitamos el ban.
  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: bloquear ? '876000h' : 'none'
  })

  if (banError) return { error: banError.message }

  // Actualizar el perfil visualmente
  const { error: profileError } = await admin.from('profiles').update({
    is_active: !bloquear
  }).eq('id', id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function obtenerUsuario(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function actualizarUsuario(id: string, formData: FormData) {
  const admin = getAdminClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre   = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const rol      = formData.get('rol') as string
  
  const telefono          = formData.get('telefono') as string
  const programa_id       = formData.get('programa_id') as string
  const meses_practica    = formData.get('meses_practica') ? parseInt(formData.get('meses_practica') as string) : null
  const estado_academico  = formData.get('estado_academico') as string
  const estado_busqueda   = formData.get('estado_busqueda') as string

  // Preparar los datos a actualizar en Auth
  const updateData: any = {
    email,
    user_metadata: { 
      nombre, 
      apellido, 
      rol,
      telefono: telefono || null,
      programa_id: programa_id || null,
      meses_practica: meses_practica || null,
      estado_academico: estado_academico || null,
      estado_busqueda: estado_busqueda || null
    }
  }

  // Solo actualizar contraseña si se proporcionó una nueva
  if (password && password.trim() !== '') {
    updateData.password = password
  }

  const { error } = await admin.auth.admin.updateUserById(id, updateData)

  if (error) return { error: error.message }

  // Si es estudiante y tiene programa, calculamos el periodo académico
  let periodo_academico: string | null = null
  if (rol === 'estudiante' && programa_id) {
    // Necesitamos la fecha de creación del perfil para el cálculo
    const { data: currentProfile } = await admin.from('profiles').select('created_at, periodo_academico').eq('id', id).single()
    
    // Si ya tenía periodo, lo mantenemos, si no, lo calculamos
    if (currentProfile?.periodo_academico) {
      periodo_academico = currentProfile.periodo_academico
    } else {
      const createdAt = currentProfile?.created_at ? new Date(currentProfile.created_at) : new Date()
      periodo_academico = await calcularPeriodoAcademico(programa_id, createdAt)
    }
  }

  // Actualizar la tabla profiles explícitamente
  const { error: updateError } = await admin.from('profiles').update({
    nombre,
    apellido,
    email,
    rol,
    telefono: telefono || null,
    programa_id: programa_id || null,
    meses_practica: meses_practica || null,
    estado_academico: estado_academico || null,
    estado_busqueda: estado_busqueda || null,
    periodo_academico
  }).eq('id', id)

  if (updateError) {
    console.error('Error actualizando perfil:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
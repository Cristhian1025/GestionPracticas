'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user!.id)
    .single()

  switch (profile?.rol) {
    case 'admin':        redirect('/admin/usuarios')
    case 'coordinador':  redirect('/coordinador/dashboard')
    case 'centro_progresa': redirect('/centro-progresa/dashboard')
    case 'estudiante':   redirect('/estudiante/ofertas')
    default:             redirect('/login')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
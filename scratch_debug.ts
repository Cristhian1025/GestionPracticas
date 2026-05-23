import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321' // fallback or load from .env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// We'll write a simple node script to use loadEnvConfig
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data: ofertas } = await adminSupabase.from('ofertas').select('id, titulo')
  console.log('Ofertas:', ofertas?.length)

  for (const oferta of ofertas || []) {
    const { data: posts } = await adminSupabase
      .from('postulaciones')
      .select('id, estudiante_id')
      .eq('oferta_id', oferta.id)

    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id)
      const { data: practicasData } = await adminSupabase
        .from('practicas')
        .select('id, estado')
        .in('postulacion_id', postIds)
      
      console.log(`Oferta ${oferta.titulo} (ID: ${oferta.id}) -> Posts: ${posts.length}, Practicas: ${practicasData?.length}`)
      if (practicasData && practicasData.length > 0) {
        console.log('  Practicas detail:', practicasData)
      }
    }
  }

  // Also let's check all practicas to see what their postulacion_id looks like
  const { data: allPracticas } = await adminSupabase.from('practicas').select('id, estado, postulacion_id, empresa_id, cargo')
  console.log('\nAll Practicas:', allPracticas)

  // check if the postulaciones for these practicas have an oferta_id
  for (const p of allPracticas || []) {
    if (p.postulacion_id) {
      const { data: post } = await adminSupabase.from('postulaciones').select('id, oferta_id, origen').eq('id', p.postulacion_id).single()
      console.log(`Practica ${p.id} -> Postulacion: ${post?.id}, Oferta: ${post?.oferta_id}, Origen: ${post?.origen}`)
    }
  }
}

run()

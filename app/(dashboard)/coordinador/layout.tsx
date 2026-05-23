import { obtenerPerfilCoordinador } from '@/app/actions/coordinador'
import CoordinatorHeader from '@/app/ui/coordinador/coordinador-header'
import { redirect } from 'next/navigation'

export default async function CoordinatorLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: perfil, error } = await obtenerPerfilCoordinador()

  if (error || !perfil) {
    redirect('/login')
  }

  const nombrePrograma = (perfil.programas as any)?.nombre || 'Sin Asignar'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CoordinatorHeader nombrePrograma={nombrePrograma} />
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}

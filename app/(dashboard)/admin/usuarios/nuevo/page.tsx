import Link from 'next/link'
import { listarProgramas } from '@/app/actions/usuarios'
import NuevoUsuarioForm from '@/app/ui/usuarios/nuevo-usuario-form'

export default async function NuevoUsuarioPage() {
  const { data: programas } = await listarProgramas()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-base font-semibold text-gray-900">Centro Progresa</h1>
          <p className="text-xs text-gray-500">Panel de administración</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/usuarios" className="text-sm text-gray-500 hover:text-gray-700">
            ← Usuarios
          </Link>
          <span className="text-gray-300">/</span>
          <h2 className="text-lg font-semibold text-gray-900">Nuevo usuario</h2>
        </div>

        <NuevoUsuarioForm programas={programas || []} />
      </div>
    </div>
  )
}
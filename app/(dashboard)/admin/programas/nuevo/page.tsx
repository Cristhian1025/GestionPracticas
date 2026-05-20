import ProgramaForm from '@/app/ui/admin/programas/programa-form'
import Link from 'next/link'

export default function NuevoProgramaPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/programas"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Programa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Añade una nueva carrera o programa académico a la plataforma.
        </p>
      </div>

      <ProgramaForm />
    </main>
  )
}

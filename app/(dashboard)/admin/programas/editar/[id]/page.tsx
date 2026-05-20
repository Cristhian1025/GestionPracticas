import ProgramaForm from '@/app/ui/admin/programas/programa-form'
import Link from 'next/link'
import { obtenerPrograma } from '@/app/actions/programas'
import { notFound } from 'next/navigation'

export default async function EditarProgramaPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { data: programa, error } = await obtenerPrograma(params.id)

  if (error || !programa) {
    notFound()
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/programas"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Programa Académico</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modifica los detalles de la carrera o sede.
        </p>
      </div>

      <ProgramaForm programa={programa} />
    </main>
  )
}

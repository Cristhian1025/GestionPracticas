import EmpresaForm from '@/app/ui/centro-progresa/empresas/empresa-form'
import Link from 'next/link'
import { obtenerEmpresa } from '@/app/actions/empresas'
import { notFound } from 'next/navigation'

export default async function EditarEmpresaPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { data: empresa, error } = await obtenerEmpresa(params.id)

  if (error || !empresa) {
    notFound()
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link 
          href="/centro-progresa/empresas"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Empresa Aliada</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modifica los datos de la empresa o de su contacto principal.
        </p>
      </div>

      <EmpresaForm empresa={empresa} />
    </main>
  )
}

import OfertaForm from '@/app/ui/centro-progresa/ofertas/oferta-form'
import Link from 'next/link'
import { obtenerOferta, obtenerOpcionesFormulario } from '@/app/actions/ofertas'
import { notFound } from 'next/navigation'

export default async function EditarOfertaPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const [{ data: oferta, error }, opciones] = await Promise.all([
    obtenerOferta(params.id),
    obtenerOpcionesFormulario()
  ])

  if (error || !oferta) {
    notFound()
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link 
          href="/centro-progresa/ofertas"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Oferta Laboral</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modifica los detalles de la vacante.
        </p>
      </div>

      <OfertaForm oferta={oferta} opciones={opciones} />
    </main>
  )
}

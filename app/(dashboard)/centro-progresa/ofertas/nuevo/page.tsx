import OfertaForm from '@/app/ui/centro-progresa/ofertas/oferta-form'
import Link from 'next/link'
import { obtenerOpcionesFormulario } from '@/app/actions/ofertas'

export default async function NuevaOfertaPage() {
  const opciones = await obtenerOpcionesFormulario()

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link 
          href="/centro-progresa/ofertas"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Publicar Nueva Oferta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Completa los datos de la vacante, asegurándote de vincularla a una empresa y a un coordinador.
        </p>
      </div>

      <OfertaForm opciones={opciones} />
    </main>
  )
}

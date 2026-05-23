const guideImages = [
  {
    title: 'Fases del Proceso',
    dotColor: 'bg-blue-500',
    src: '/guia/fases-proceso.jpeg',
    alt: 'Fases del proceso de practicas profesionales',
  },
  {
    title: 'Documentos que Debes Tener Listos',
    dotColor: 'bg-green-500',
    src: '/guia/documentos-listos.jpeg',
    alt: 'Documentos necesarios para iniciar practicas profesionales',
  },
]

export default function EstudianteInformacionPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guia de Practicas Profesionales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todo lo que necesitas saber para iniciar y completar tu proceso de practicas.
        </p>
      </div>

      {guideImages.map((image) => (
        <section key={image.title} className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${image.dotColor} inline-block`} />
            {image.title}
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full rounded-lg border border-gray-100 object-contain"
            />
          </div>
        </section>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h2 className="text-base font-bold text-blue-900 mb-1">Tienes dudas?</h2>
        <p className="text-sm text-blue-700">
          Comunicate con Centro Progresa EPE o con el coordinador de tu programa academico.
        </p>
      </div>
    </main>
  )
}

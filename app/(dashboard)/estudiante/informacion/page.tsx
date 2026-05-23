export default function EstudianteInformacionPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guía de Prácticas Profesionales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todo lo que necesitas saber para iniciar y completar tu proceso de prácticas.
        </p>
      </div>

      {/* Fases del proceso */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Fases del Proceso
        </h2>

        <ol className="relative border-l border-blue-200 ml-3 space-y-8">
          {[
            {
              num: '1',
              color: 'bg-gray-500',
              title: 'Búsqueda de Empleo',
              desc: 'Explora las Ofertas Laborales publicadas en el portal o registra una empresa propia donde ya tengas una oportunidad.',
            },
            {
              num: '2',
              color: 'bg-blue-500',
              title: 'Postulación',
              desc: 'Aplica a la oferta que más se ajuste a tu perfil. Una vez postulado, tu estado cambiará a "Postulado".',
            },
            {
              num: '3',
              color: 'bg-yellow-500',
              title: 'Carta de Funciones',
              desc: 'La empresa debe emitirte una carta de funciones describiendo tu rol. Súbela desde la sección "Mis Trámites". Tu estado pasará a "Carta Enviada".',
            },
            {
              num: '4',
              color: 'bg-purple-500',
              title: 'Revisión del Coordinador',
              desc: 'El coordinador de tu programa revisará la carta. Si la aprueba, tu estado será "Carta Aprobada" y podrás continuar.',
            },
            {
              num: '5',
              color: 'bg-green-500',
              title: 'Formalización',
              desc: 'Una vez aprobada la carta, ve a "Mis Trámites" y haz clic en "Marcar como Contratado". Esto formaliza el inicio oficial de tu práctica en el sistema.',
            },
          ].map((step, i) => (
            <li key={i} className="ml-6">
              <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${step.color} text-white text-xs font-bold ring-4 ring-white`}>
                {step.num}
              </span>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Documentos requeridos */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Documentos que Debes Tener Listos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: '📄',
              title: 'Carta de Funciones',
              desc: 'Emitida por la empresa. Debe incluir el cargo, funciones específicas a desempeñar y duración de la práctica.',
              badge: 'Obligatorio',
              badgeColor: 'bg-red-100 text-red-700',
            },
            {
              icon: '🏢',
              title: 'Datos de la Empresa',
              desc: 'RUT o cámara de comercio de la empresa donde realizarás la práctica (NIT, razón social, representante).',
              badge: 'Obligatorio',
              badgeColor: 'bg-red-100 text-red-700',
            },
            {
              icon: '📋',
              title: 'Acuerdo de Aprendizaje',
              desc: 'Formulario firmado por el estudiante, el asesor empresarial y el docente asesor de la institución.',
              badge: 'Según Programa',
              badgeColor: 'bg-yellow-100 text-yellow-700',
            },
            {
              icon: '🆔',
              title: 'Documento de Identidad',
              desc: 'Cédula de ciudadanía o pasaporte vigente del estudiante.',
              badge: 'Obligatorio',
              badgeColor: 'bg-red-100 text-red-700',
            },
            {
              icon: '📊',
              title: 'Paz y Salvo Académico',
              desc: 'Certificado que acredita que no tienes deudas académicas ni financieras con la institución.',
              badge: 'Previo al inicio',
              badgeColor: 'bg-blue-100 text-blue-700',
            },
            {
              icon: '🔒',
              title: 'Afiliación ARL',
              desc: 'La empresa debe afiliarte a una ARL (Administradora de Riesgos Laborales) antes de iniciar la práctica.',
              badge: 'Responsabilidad empresa',
              badgeColor: 'bg-gray-100 text-gray-700',
            },
          ].map((doc, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:border-blue-300 transition-colors">
              <div className="text-3xl shrink-0">{doc.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{doc.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.badgeColor}`}>{doc.badge}</span>
                </div>
                <p className="text-xs text-gray-500">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h2 className="text-base font-bold text-blue-900 mb-1">¿Tienes dudas?</h2>
        <p className="text-sm text-blue-700">
          Comunícate con Centro Progresa EPE o con el coordinador de tu programa académico.
        </p>
      </div>
    </main>
  )
}

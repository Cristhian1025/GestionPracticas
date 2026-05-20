export default function CartaPresentacionInfo() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Carta de Presentación</h2>
          <p className="text-sm text-gray-600 mb-4">
            Para iniciar tu proceso formal con una empresa, debes solicitar tu Carta de Presentación. 
            Asegúrate de tener a la mano los datos exactos de la empresa y del contacto directo.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">¿Qué necesitas para diligenciar el formulario?</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Nombre o Razón Social exacta de la empresa.</li>
              <li>NIT de la empresa.</li>
              <li>Nombre y cargo de la persona a quien va dirigida la carta.</li>
              <li>Correo electrónico del destinatario.</li>
            </ul>
          </div>

          {/* Placeholder para la URL oficial de Forms */}
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Ir al Formulario Oficial de Solicitud
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </div>
  )
}

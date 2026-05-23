'use client'

import { useState } from 'react'

function LogoImage({ src, alt, fallbackText, fallbackClass }: { src: string; alt: string; fallbackText: string; fallbackClass: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <span className={`text-sm font-bold tracking-wide uppercase ${fallbackClass}`}>{fallbackText}</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-10 w-auto object-contain"
    />
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo Izquierdo: UNIMINUTO */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            {/* Intentamos cargar la imagen, si no existe muestra el texto estilizado */}
            <img
              src="/logos/uniminuto.png"
              alt="UNIMINUTO"
              onError={(e) => {
                // Si falla la carga, ocultamos el img y mostramos el texto alternativo
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const fallback = parent.querySelector('.fallback-text') as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }
              }}
              className="h-10 w-auto object-contain"
            />
            <span className="fallback-text hidden text-sm font-bold text-blue-900 tracking-wide uppercase">
              🏫 UNIMINUTO
            </span>
          </div>
        </div>

        {/* Mensaje Central: Derechos Reservados */}
        <div className="text-center text-xs text-gray-500 font-medium">
          © {currentYear} Corporación Universitaria Minuto de Dios - UNIMINUTO. 
          <span className="block sm:inline sm:ml-1">Todos los derechos reservados.</span>
        </div>

        {/* Logo Derecho: Centro Progresa */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <img
              src="/logos/centro-progresa.png"
              alt="Centro Progresa EPE"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const fallback = parent.querySelector('.fallback-text') as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }
              }}
              className="h-10 w-auto object-contain"
            />
            <span className="fallback-text hidden text-sm font-bold text-green-700 tracking-wide uppercase">
              ⚡ Centro Progresa EPE
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}

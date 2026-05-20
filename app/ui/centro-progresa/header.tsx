'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserDropdown from '@/app/ui/auth/user-dropdown'

const links = [
  { name: 'Dashboard', href: '/centro-progresa/dashboard' },
  { name: 'Empresas Aliadas', href: '/centro-progresa/empresas' },
  { name: 'Ofertas Laborales', href: '/centro-progresa/ofertas' },
]

export default function CentroProgresaHeader() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Lado Izquierdo: Título y Navegación */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Centro Progresa</h1>
            <p className="text-xs text-gray-500">Panel de Gestión</p>
          </div>

          <nav className="hidden md:flex space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Lado Derecho: Usuario */}
        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}

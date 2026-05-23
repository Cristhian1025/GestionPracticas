'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserDropdown from '@/app/ui/auth/user-dropdown'

export default function CoordinatorHeader({ 
  nombrePrograma 
}: { 
  nombrePrograma: string 
}) {
  const pathname = usePathname()

  const links = [
    { href: '/coordinador/dashboard', label: 'Inicio / Métricas' },
    { href: '/coordinador/revisiones', label: 'Bandeja de Revisiones' }
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo e Info de Programa */}
        <div className="flex items-center gap-3">
          <Link href="/coordinador/dashboard" className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <span className="text-blue-600">⚡</span>
            <span>Gestor Prácticas</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium hidden sm:block">
            Prog: {nombrePrograma || 'Sin Asignar'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600 py-5' 
                    : 'text-gray-600 hover:text-gray-900 py-5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>

      </div>
    </header>
  )
}

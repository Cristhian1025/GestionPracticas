'use client'

import { useState } from 'react'
import { desactivarUsuario, cambiarEstadoUsuario } from '@/app/actions/usuarios'
import Link from 'next/link'

export default function UserTableActions({ userId, isActive }: { userId: string, isActive: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  async function handleDelete() {
    if (window.confirm('¿Estás seguro de que deseas eliminar DEFINITIVAMENTE a este usuario? Esta acción destruirá su historial y no se puede deshacer.')) {
      setIsDeleting(true)
      const result = await desactivarUsuario(userId)
      if (result.error) {
        alert('Error al eliminar: ' + result.error)
        setIsDeleting(false)
      }
    }
  }

  async function handleToggleStatus() {
    const accion = isActive ? 'bloquear' : 'desbloquear'
    if (window.confirm(`¿Estás seguro de que deseas ${accion} a este usuario?`)) {
      setIsUpdatingStatus(true)
      const result = await cambiarEstadoUsuario(userId, isActive) // Si está activo, pasamos true (para bloquearlo)
      if (result.error) {
        alert(`Error al ${accion}: ` + result.error)
        setIsUpdatingStatus(false)
      }
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/admin/usuarios/editar/${userId}`}
        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
      >
        Editar
      </Link>
      
      <button
        onClick={handleToggleStatus}
        disabled={isUpdatingStatus}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 ${
          isActive 
            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {isUpdatingStatus ? '...' : (isActive ? 'Bloquear' : 'Desbloquear')}
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
      >
        {isDeleting ? '...' : 'Eliminar'}
      </button>
    </div>
  )
}

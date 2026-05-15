'use client'

import { useEffect } from 'react'
import { logout } from '@/app/actions/auth'

const TIMEOUT_MS = 10 * 60 * 1000 // 10 minutos

export default function InactivityTimer() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        // Ejecutar cierre de sesión cuando el tiempo se agote
        logout()
      }, TIMEOUT_MS)
    }

    // Inicializar el timer por primera vez
    resetTimer()

    // Escuchar eventos que indican actividad del usuario
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Limpieza al desmontar el componente
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [])

  return null // Este componente no renderiza nada visual, solo funciona en segundo plano
}

'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useRef } from 'react'

export default function SearchProgramas() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (term: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      params.set('page', '1')
      
      if (term) {
        params.set('query', term)
      } else {
        params.delete('query')
      }
      
      replace(`${pathname}?${params.toString()}`)
    }, 300)
  }

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar por nombre o código SNIES..."
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

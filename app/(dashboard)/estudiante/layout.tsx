import EstudianteHeader from '@/app/ui/estudiante/estudiante-header'

export default function EstudianteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EstudianteHeader />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

import CentroProgresaHeader from '@/app/ui/centro-progresa/header'

export default function CentroProgresaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CentroProgresaHeader />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

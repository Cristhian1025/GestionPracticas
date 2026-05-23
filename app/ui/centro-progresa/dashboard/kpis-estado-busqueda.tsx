'use client'

type KPIsProps = {
  sinPostulaciones: number
  postulados: number
  cartaEnviada: number
  cartaAprobada: number
  contratados: number
}

export default function KPIsEstadoBusqueda({ stats }: { stats: KPIsProps }) {
  const cards = [
    { label: 'Sin Postulaciones', value: stats.sinPostulaciones, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
    { label: 'Postulados', value: stats.postulados, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
    { label: 'Carta Enviada', value: stats.cartaEnviada, color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    { label: 'Carta Aprobada', value: stats.cartaAprobada, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' },
    { label: 'Contratados', value: stats.contratados, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-4 rounded-xl border ${card.border} ${card.bg} flex flex-col justify-center items-center text-center shadow-sm`}>
          <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
          <span className={`text-xs font-semibold mt-1 uppercase tracking-wide ${card.color}`}>{card.label}</span>
        </div>
      ))}
    </div>
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = {
  programa: string
  sin_postulaciones: number
  postulado: number
  carta_enviada: number
  carta_aprobada: number
  contratado: number
}

export default function EstudiantesChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    )
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="programa" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="sin_postulaciones" name="Sin Postulaciones" stackId="a" fill="#9CA3AF" radius={[0, 0, 0, 0]} />
          <Bar dataKey="postulado" name="Postulados" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="carta_enviada" name="Carta Enviada" stackId="a" fill="#EAB308" radius={[0, 0, 0, 0]} />
          <Bar dataKey="carta_aprobada" name="Carta Aprobada" stackId="a" fill="#A855F7" radius={[0, 0, 0, 0]} />
          <Bar dataKey="contratado" name="Contratados" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

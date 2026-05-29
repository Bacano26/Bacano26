// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Ticket, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

export default async function AdminPage() {
  const supabase = await createClient()

  // Trae estadísticas en paralelo (más rápido)
  const [
    { count: totalEventos },
    { count: totalCompras },
    { data: ventas },
    { data: eventosRecientes },
  ] = await Promise.all([
    supabase.from('eventos').select('*', { count: 'exact', head: true }),
    supabase.from('compras').select('*', { count: 'exact', head: true }).eq('estado', 'completado'),
    supabase.from('compras').select('total').eq('estado', 'completado'),
    supabase.from('eventos').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const totalIngresos = ventas?.reduce((sum, v) => sum + v.total, 0) ?? 0

  const stats = [
    {
      label: 'Total eventos',
      valor: totalEventos ?? 0,
      icono: <Ticket className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Compras realizadas',
      valor: totalCompras ?? 0,
      icono: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Ingresos totales',
      valor: formatPrecio(totalIngresos),
      icono: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icono}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
          </div>
        ))}
      </div>

      {/* Eventos recientes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Eventos recientes</h2>
        <div className="space-y-3">
          {eventosRecientes?.map(evento => (
            <div key={evento.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{evento.titulo}</p>
                <p className="text-xs text-gray-400">{evento.lugar}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatPrecio(evento.precio)}</p>
                <p className="text-xs text-gray-400">
                  {evento.boletas_vendidas}/{evento.capacidad} vendidas
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
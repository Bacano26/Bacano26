// components/admin/DashboardStats.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, ShoppingBag, TrendingUp, RefreshCw } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

interface Stats {
  totalEventos: number
  totalCompras: number
  totalIngresos: number
  eventosRecientes: any[]
}

interface Props {
  statsIniciales: Stats
}

export default function DashboardStats({ statsIniciales }: Props) {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>(statsIniciales)
  const [actualizando, setActualizando] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())

  async function cargarStats() {
    setActualizando(true)

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

    setStats({
      totalEventos: totalEventos ?? 0,
      totalCompras: totalCompras ?? 0,
      totalIngresos: ventas?.reduce((sum, v) => sum + v.total, 0) ?? 0,
      eventosRecientes: eventosRecientes ?? [],
    })

    setUltimaActualizacion(new Date())
    setActualizando(false)
  }

  useEffect(() => {
    // Escucha cambios en compras en tiempo real
    const canalCompras = supabase
      .channel('compras-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'compras' },
        () => cargarStats()
      )
      .subscribe()

    // Escucha cambios en eventos en tiempo real
    const canalEventos = supabase
      .channel('eventos-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        () => cargarStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalCompras)
      supabase.removeChannel(canalEventos)
    }
  }, [])

  const statsCards = [
    {
      label: 'Total eventos',
      valor: stats.totalEventos,
      icono: <Ticket className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Compras realizadas',
      valor: stats.totalCompras,
      icono: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Ingresos totales',
      valor: formatPrecio(stats.totalIngresos),
      icono: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div>

      {/* Indicador de última actualización */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${actualizando ? 'bg-amber-400 animate-pulse' : 'bg-green-400 animate-pulse'}`} />
          <span className="text-xs text-gray-400">
            {actualizando ? 'Actualizando...' : `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-CO')}`}
          </span>
        </div>
        <button
          onClick={cargarStats}
          disabled={actualizando}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat, i) => (
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
          {stats.eventosRecientes.map(evento => (
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
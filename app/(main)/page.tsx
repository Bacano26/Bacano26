// app/(main)/page.tsx
import Link from 'next/link'
import { ArrowRight, Ticket, Shield, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BannerEventos from '@/components/eventos/BannerEventos'
import EventosGrid from '@/components/eventos/EventosGrid'  // ← NUEVO
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boletas App — Compra tus entradas',
  description: 'Encuentra y compra boletas para los mejores eventos',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .gte('fecha', new Date().toISOString())
    .order('fecha', { ascending: true })
    .limit(6)

  const eventosBanner = eventos?.slice(0, 3) ?? []
  const eventosGrid = eventos ?? []

  return (
    <div>

      {/* ── HERO ── */}
  
      {/* ── BANNER ── */}
      {eventosBanner.length > 0 && (
        <section>
          <BannerEventos eventos={eventosBanner} />
        </section>
      )}

      {/* ── BENEFICIOS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { icono: <Zap className="w-5 h-5" />,    titulo: 'Compra en segundos', desc: 'Proceso simple y rápido' },
              { icono: <Shield className="w-5 h-5" />, titulo: 'Pago seguro',         desc: 'Tus datos siempre protegidos' },
              { icono: <Ticket className="w-5 h-5" />, titulo: 'Boleta digital',      desc: 'Recíbela al instante' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  {item.icono}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.titulo}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRID EN TIEMPO REAL ── */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Próximos eventos</h2>
            <p className="text-gray-500 text-sm mt-1">No te pierdas lo que viene</p>
          </div>
          <Link href="/eventos"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ← REEMPLAZA el grid estático por este componente */}
        <EventosGrid eventosIniciales={eventosGrid} />
      </section>

    </div>
  )
}
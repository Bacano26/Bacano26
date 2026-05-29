// app/(main)/page.tsx
import Link from 'next/link'
import { ArrowRight, Ticket, Shield, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import EventoCard from '@/components/eventos/EventoCard'
import BannerEventos from '@/components/eventos/BannerEventos'  // ← AGREGA ESTE IMPORT
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

  // Los primeros 3 van al banner destacado
  const eventosBanner = eventos?.slice(0, 3) ?? []
  // Todos van al grid de abajo
  const eventosGrid = eventos ?? []

  return (
    <div>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Compra segura y rápida</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Los mejores eventos,<br />
            <span className="text-indigo-200">en un solo lugar</span>
          </h1>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Encuentra conciertos, obras de teatro, deportes y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/eventos"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Ver todos los eventos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── BANNER DE CONCIERTOS DESTACADOS ── */}
      {eventosBanner.length > 0 && (
        <section>
          <BannerEventos eventos={eventosBanner} />
        </section>
      )}

      {/* ── BENEFICIOS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icono: <Zap className="w-5 h-5" />,    titulo: 'Compra en segundos',  desc: 'Proceso simple y rápido' },
              { icono: <Shield className="w-5 h-5" />, titulo: 'Pago seguro',          desc: 'Tus datos siempre protegidos' },
              { icono: <Ticket className="w-5 h-5" />, titulo: 'Boleta digital',       desc: 'Recíbela al instante' },
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

      {/* ── GRID DE TODOS LOS EVENTOS ── */}
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

        {eventosGrid.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay eventos próximos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosGrid.map(evento => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
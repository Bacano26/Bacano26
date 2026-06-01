// app/(main)/eventos/page.tsx
// Revalida la página cada 30 segundos automáticamente
export const revalidate = 30
import { createClient } from '@/lib/supabase/server'
import EventoCard from '@/components/eventos/EventoCard'
import { Ticket, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos | Boletas App',
}

export default async function EventosPage() {
  const supabase = await createClient()

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .gte('fecha', new Date().toISOString())
    .order('fecha', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Todos los eventos</h1>
        <p className="text-gray-500 mt-2">
          {eventos?.length ?? 0} eventos disponibles
        </p>
      </div>

      {/* Sin eventos */}
      {(!eventos || eventos.length === 0) && (
        <div className="text-center py-20">
          <Ticket className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No hay eventos disponibles</p>
          <p className="text-gray-400 text-sm mt-1">Vuelve pronto</p>
        </div>
      )}

      {/* Grid */}
      {eventos && eventos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(evento => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  )
}
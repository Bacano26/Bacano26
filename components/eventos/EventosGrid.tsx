// components/eventos/EventosGrid.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EventoCard from './EventoCard'
import { Ticket } from 'lucide-react'
import type { Evento } from '@/types'

interface Props {
  eventosIniciales: Evento[]
}

export default function EventosGrid({ eventosIniciales }: Props) {
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales)

  useEffect(() => {
    // ✅ cliente dentro del effect — evita memory leak
    const supabase = createClient()

    async function cargarEventos() {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .eq('activo', true)
        .gte('fecha', new Date().toISOString())
        .order('fecha', { ascending: true })
        .limit(6)

      if (data) setEventos(data)
    }

    const canal = supabase
      .channel('eventos-publicos')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        () => cargarEventos()
      )
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  if (eventos.length === 0) {
    return (
      <div className="text-center py-16">
        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No hay eventos próximos</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventos.map(evento => (
        <EventoCard key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
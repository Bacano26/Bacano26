import Link from 'next/link'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import type { Evento } from '@/types'

interface Props {
  evento: Evento
}

export default function EventoCard({ evento }: Props) {
  const boletasRestantes = evento.capacidad - evento.boletas_vendidas
  const pocasUnidades = boletasRestantes <= evento.capacidad * 0.2
  const agotado = boletasRestantes === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
        {evento.imagen_url ? (
          <img
            src={evento.imagen_url}
            alt={evento.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket className="w-12 h-12 text-white/50" />
          </div>
        )}

        {agotado ? (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Agotado
          </span>
        ) : pocasUnidades ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ¡Últimas {boletasRestantes}!
          </span>
        ) : null}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2">
          {evento.titulo}
        </h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{formatFecha(evento.fecha)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{evento.lugar}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Desde</p>
            <p className="font-bold text-gray-900 text-lg">
              {formatPrecio(evento.precio)}
            </p>
          </div>

          <Link
            href={agotado ? '#' : `/eventos/${evento.id}`}
            className={
              agotado
                ? 'px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed'
                : 'px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors'
            }
          >
            {agotado ? 'Agotado' : 'Ver detalles'}
          </Link>
        </div>
      </div>
    </div>
  )
}
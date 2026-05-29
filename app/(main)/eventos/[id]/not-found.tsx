// app/(main)/eventos/[id]/not-found.tsx
import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function EventoNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Evento no encontrado
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Este evento no existe o fue eliminado
        </p>
        <Link
          href="/eventos"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Ver todos los eventos
        </Link>
      </div>
    </div>
  )
}
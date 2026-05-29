// app/admin/eventos/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import BotonEliminar from '@/components/admin/BotonEliminar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Eventos | Admin' }

export default async function AdminEventosPage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">{eventos?.length ?? 0} en total</p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo evento
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Evento</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600 hidden md:table-cell">Fecha</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600 hidden md:table-cell">Precio</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Ventas</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Estado</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {eventos?.map(evento => (
              <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900 truncate max-w-48">{evento.titulo}</p>
                  <p className="text-xs text-gray-400">{evento.lugar}</p>
                </td>
                <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                  {formatFecha(evento.fecha)}
                </td>
                <td className="px-5 py-4 font-medium text-gray-900 hidden md:table-cell">
                  {formatPrecio(evento.precio)}
                </td>
                <td className="px-5 py-4">
                  <span className="text-gray-900 font-medium">{evento.boletas_vendidas}</span>
                  <span className="text-gray-400">/{evento.capacidad}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    evento.activo
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {evento.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/eventos/${evento.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Editar
                    </Link>
                    <BotonEliminar id={evento.id} titulo={evento.titulo} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
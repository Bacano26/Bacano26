import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link' // 👈 Importamos Link para la redirección interna
import { Ticket, Calendar, MapPin, ShoppingBag } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import BoletasDetalle from '@/components/compras/BoletasDetalle'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis boletas | Boletas App',
}

export default async function HistorialPage() {
  const supabase = await createClient()

  // Verifica sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Trae las compras del usuario con la info del evento
  // y las boletas individuales de cada compra
  const { data: compras, error } = await supabase
    .from('compras')
    .select(`
      *,
      evento:eventos(*),
      boletas(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis boletas</h1>
        <p className="text-gray-500 text-sm mt-1">
          {compras?.length ?? 0} compra{compras?.length !== 1 ? 's' : ''} realizadas
        </p>
      </div>

      {/* Sin compras */}
      {(!compras || compras.length === 0) && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">
            No tienes compras aún
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Cuando compres boletas aparecerán aquí
          </p>
          
          {/* ✅ Corregido: Agregada la etiqueta Link de apertura correcta */}
          <Link 
            href="/eventos"
            className="inline-flex px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Ver eventos
          </Link>
        </div>
      )}

      {/* Lista de compras */}
      {compras && compras.length > 0 && (
        <div className="space-y-4">
          {compras.map((compra) => (
            <div
              key={compra.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Cabecera de la compra */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Imagen del evento */}
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0">
                  {compra.evento?.imagen_url ? (
                    <img
                      src={compra.evento.imagen_url}
                      alt={compra.evento.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {compra.evento?.titulo ?? 'Evento eliminado'}
                    </h3>

                    {/* Badge de estado */}
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      compra.estado === 'completado'
                        ? 'bg-green-100 text-green-700'
                        : compra.estado === 'cancelado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {compra.estado === 'completado' ? '✅ Completado'
                        : compra.estado === 'cancelado' ? '❌ Cancelado'
                        : '⏳ Pendiente'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {compra.evento?.fecha && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {formatFecha(compra.evento.fecha)}
                      </span>
                    )}
                    {compra.evento?.lugar && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {compra.evento.lugar}
                      </span>
                    )}
                  </div>

                  {/* Resumen de la compra */}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-400">
                      {compra.cantidad} boleta{compra.cantidad > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrecio(compra.total)}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(compra.created_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boletas individuales — componente cliente para expandir */}
              {compra.boletas && compra.boletas.length > 0 && (
                <BoletasDetalle boletas={compra.boletas} />
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
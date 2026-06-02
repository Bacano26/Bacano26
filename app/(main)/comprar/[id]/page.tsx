// app/(main)/comprar/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import FormCompra from '@/components/compras/FormCompra'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comprar boletas | Boletas App',
}

export default async function ComprarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // ✅ Usa getUser() en vez de getSession() — más confiable
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect(`/login?next=/comprar/${id}`)
  }

  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (!evento || error) notFound()

  const boletasRestantes = evento.capacidad - evento.boletas_vendidas
  if (boletasRestantes === 0) redirect(`/eventos/${id}`)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <Link
          href={`/eventos/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al evento
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Comprar boletas
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500">
              {evento.imagen_url ? (
                <img
                  src={evento.imagen_url}
                  alt={evento.titulo}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                {evento.titulo}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>{formatFecha(evento.fecha)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>{evento.lugar}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400">Precio por boleta</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {formatPrecio(evento.precio)}
                </p>
              </div>
              <div className="mt-3 bg-green-50 rounded-lg px-3 py-2">
                <p className="text-xs text-green-700 font-medium">
                  ✅ {boletasRestantes} boletas disponibles
                </p>
              </div>
            </div>
          </div>

          <div>
            <FormCompra evento={evento} userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
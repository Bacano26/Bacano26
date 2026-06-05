import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, MapPin, Ticket, Users,
  ArrowLeft, Share2
} from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

// ✅ SECCIÓN CORREGIDA: Agregamos Open Graph para que WhatsApp lea la foto y los textos
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: evento } = await supabase
    .from('eventos')
    .select('titulo, descripcion, imagen_url')
    .eq('id', id)
    .single()

  if (!evento) {
    return { title: 'Evento | Boletas App' }
  }

  const tituloCompleto = `${evento.titulo} | Boletas App`
  const descripcionCorta = evento.descripcion || 'Compra tus boletas digitales al instante de forma 100% segura.'

  return {
    title: tituloCompleto,
    description: descripcionCorta,
    // Aquí es donde sucede la magia para las redes sociales
    openGraph: {
      title: tituloCompleto,
      description: descripcionCorta,
      type: 'article',
      images: evento.imagen_url ? [{ url: evento.imagen_url }] : [],
    },
    // Reglas específicas para Twitter/X
    twitter: {
      card: 'summary_large_image',
      title: tituloCompleto,
      description: descripcionCorta,
      images: evento.imagen_url ? [evento.imagen_url] : [],
    }
  }
}

export default async function EventoDetallePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single()

  if (!evento || error) notFound()

  const boletasRestantes = evento.capacidad - evento.boletas_vendidas
  const porcentajeVendido = Math.round((evento.boletas_vendidas / evento.capacidad) * 100)
  const agotado = boletasRestantes === 0
  const pocasUnidades = boletasRestantes <= evento.capacidad * 0.2 && !agotado

  // ✅ SOLUCIÓN EN EL SERVIDOR: Construimos el texto de WhatsApp sin depender del objeto 'window'
  const urlCompartir = `https://bacano26-olmeruiz2003-9559s-projects.vercel.app/eventos/${id}` // Reemplaza por tu dominio real cuando lo lances
  const textoWhatsApp = encodeURIComponent(`¡Mira este evento! *${evento.titulo}* 🎫\nAdquiere tus boletas aquí: ${urlCompartir}`)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO con imagen ── */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {evento.imagen_url ? (
          <>
            <img
              src={evento.imagen_url}
              alt={evento.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket className="w-20 h-20 text-white/20" />
          </div>
        )}

        {/* Botón volver */}
        <div className="absolute top-4 left-4">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        {/* Badge estado */}
        <div className="absolute top-4 right-4">
          {agotado && (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Agotado
            </span>
          )}
          {pocasUnidades && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              ¡Últimas {boletasRestantes} boletas!
            </span>
          )}
        </div>

        {/* Título */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
            {evento.titulo}
          </h1>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">
                Información del evento
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fecha y hora</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatFecha(evento.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Lugar</p>
                    <p className="text-sm font-medium text-gray-900">{evento.lugar}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Disponibilidad</p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {agotado
                        ? 'Sin boletas disponibles'
                        : `${boletasRestantes} de ${evento.capacidad} boletas disponibles`
                      }
                    </p>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          porcentajeVendido >= 90
                            ? 'bg-red-500'
                            : porcentajeVendido >= 70
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${porcentajeVendido}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {porcentajeVendido}% vendido
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {evento.descripcion && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-3">
                  Descripción
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {evento.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">

              <p className="text-xs text-gray-400 mb-1">Precio por boleta</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {formatPrecio(evento.precio)}
              </p>
              <p className="text-xs text-gray-400 mb-6">Impuestos incluidos</p>

              {agotado ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed text-sm"
                >
                  Agotado
                </button>
              ) : (
                <Link
                  href={`/comprar/${id}`}
                  className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm text-center shadow-md shadow-indigo-200"
                >
                  Comprar boletas
                </Link>
              )}

              <div className="mt-4 space-y-2.5-gray-500 border-b border-gray-50 pb-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  Boleta digital al instante
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  Compra 100% segura
                </div>
              </div>

              {/* ✅ ENLACE OPTIMIZADO: Usa la API web universal de WhatsApp con textos enriquecidos */}
              <a
                href={`https://api.whatsapp.com/send?text=${textoWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Share2 className="w-4 h-4" />
                Compartir en WhatsApp
              </a>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
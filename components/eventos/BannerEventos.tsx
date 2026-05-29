// components/eventos/BannerEventos.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'
import type { Evento } from '@/types'

interface Props {
  eventos: Evento[]
}

export default function BannerEventos({ eventos }: Props) {
  const [actual, setActual] = useState(0)
  const [animando, setAnimando] = useState(false)

  // Colores de fondo cuando no hay imagen
  const gradientes = [
    'from-indigo-800 via-indigo-700 to-purple-800',
    'from-rose-800 via-rose-700 to-pink-800',
    'from-emerald-800 via-emerald-700 to-teal-800',
    'from-amber-800 via-orange-700 to-red-800',
    'from-sky-800 via-blue-700 to-indigo-800',
  ]

  // Avanza al siguiente slide
  const siguiente = useCallback(() => {
    if (animando) return
    setAnimando(true)
    setActual(prev => (prev + 1) % eventos.length)
    setTimeout(() => setAnimando(false), 500)
  }, [animando, eventos.length])

  const anterior = useCallback(() => {
    if (animando) return
    setAnimando(true)
    setActual(prev => (prev - 1 + eventos.length) % eventos.length)
    setTimeout(() => setAnimando(false), 500)
  }, [animando, eventos.length])

  // Auto-avanza cada 5 segundos
  useEffect(() => {
    if (eventos.length <= 1) return
    const intervalo = setInterval(siguiente, 5000)
    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalo)
  }, [siguiente, eventos.length])

  if (!eventos || eventos.length === 0) return null

  const evento = eventos[actual]
  const boletasRestantes = evento.capacidad - evento.boletas_vendidas
  const agotado = boletasRestantes === 0

  return (
    <div className="relative w-full h-[500px] md:h-[580px] overflow-hidden rounded-none">

      {/* ── FONDO: imagen o gradiente ── */}
      <div className="absolute inset-0 transition-all duration-700">
        {evento.imagen_url ? (
          <>
            <img
              src={evento.imagen_url}
              alt={evento.titulo}
              className="w-full h-full object-cover"
            />
            {/* Capa oscura encima de la imagen para leer el texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          // CORREGIDO: Interpolación de clases con backticks reales
          <div className={`w-full h-full bg-gradient-to-br ${gradientes[actual % gradientes.length]}`}>
            {/* Decoración de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENIDO encima del fondo ── */}
      <div className="relative h-full flex flex-col justify-end pb-12 px-6 md:px-14 max-w-6xl mx-auto">

        {/* Badge de evento en vivo o destacado */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Evento destacado
          </span>
          {agotado && (
            <span className="bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Agotado
            </span>
          )}
          {!agotado && boletasRestantes <= evento.capacidad * 0.2 && (
            <span className="bg-amber-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              ¡Últimas {boletasRestantes} boletas!
            </span>
          )}
        </div>

        {/* Título del evento */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-2xl drop-shadow-md">
          {evento.titulo}
        </h2>

        {/* Fecha y lugar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>{formatFecha(evento.fecha)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <MapPin className="w-4 h-4 text-indigo-300" />
            <span>{evento.lugar}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <Ticket className="w-4 h-4 text-indigo-300" />
            <span>Desde {formatPrecio(evento.precio)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3">
          {agotado ? (
            <button
              disabled
              className="px-6 py-3 bg-gray-500/70 text-white/60 font-semibold rounded-xl cursor-not-allowed text-sm"
            >
              Agotado
            </button>
          ) : (
            // CORREGIDO: href envuelto en llaves y con backticks para insertar el ID dinámico
            <Link
              href={`/comprar/${evento.id}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95"
            >
              Comprar ahora
            </Link>
          )}

          {/* CORREGIDO: href envuelto en llaves y con backticks */}
          <Link
            href={`/eventos/${evento.id}`}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Ver detalles
          </Link>
        </div>
      </div>

      {/* ── CONTROLES: flechas izquierda/derecha ── */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all border border-white/10 hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={siguiente}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all border border-white/10 hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── INDICADORES: puntos de navegación abajo ── */}
      {eventos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {eventos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!animando) {
                  setAnimando(true)
                  setActual(i)
                  setTimeout(() => setAnimando(false), 500)
                }
              }}
              className={`transition-all duration-300 rounded-full ${
                i === actual
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              // CORREGIDO: aria-label envuelto en llaves y con backticks
              aria-label={`Ir al evento ${i + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrecio } from '@/lib/utils'
import type { Evento } from '@/types'

// ── Tipos ──────────────────────────────────────────────
interface Seccion {
  id: string
  nombre: string
  precio: number
  capacidad: number
  vendidas: number
  orden: number
}

interface LineaSeleccion {
  seccion: Seccion
  cantidad: number
}

interface Props {
  evento: Evento
  userId: string
  secciones?: Seccion[]
}

// ── Helper: referencia única ────────────────────────────
function generarReferencia(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `BLT-${ts}-${rand}`
}

// ── Componente ─────────────────────────────────────────
export default function FormCompra({ evento, userId, secciones = [] }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const tieneSecciones = secciones.length > 0

  // Modo simple
  const [cantidad, setCantidad] = useState(1)
  const [boletasDisponibles] = useState(evento.capacidad - evento.boletas_vendidas)

  // Modo secciones
  const [seleccion, setSeleccion] = useState<Record<string, number>>(
    Object.fromEntries(secciones.map(s => [s.id, 0]))
  )
  const [dispPorSeccion] = useState<Record<string, number>>(
    Object.fromEntries(secciones.map(s => [s.id, s.capacidad - s.vendidas]))
  )

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // ── Cálculo del total ──
  const totalSimple = evento.precio * cantidad
  const lineas: LineaSeleccion[] = secciones
    .filter(s => (seleccion[s.id] ?? 0) > 0)
    .map(s => ({ seccion: s, cantidad: seleccion[s.id] }))
  const totalSecciones = lineas.reduce((acc, l) => acc + l.seccion.precio * l.cantidad, 0)
  const totalFinal = tieneSecciones ? totalSecciones : totalSimple
  const cantidadTotal = tieneSecciones
    ? lineas.reduce((acc, l) => acc + l.cantidad, 0)
    : cantidad

  // ── Handler cantidad por sección ──
  function cambiarCantidadSeccion(seccionId: string, delta: number) {
    setSeleccion(prev => {
      const actual = prev[seccionId] ?? 0
      const disp = dispPorSeccion[seccionId] ?? 0
      const nueva = Math.max(0, Math.min(10, actual + delta, disp))
      return { ...prev, [seccionId]: nueva }
    })
  }

  // ── Submit → redirige a Wompi ──
  async function handleComprar() {
    if (tieneSecciones && cantidadTotal === 0) {
      setError('Selecciona al menos una boleta')
      return
    }

    setCargando(true)
    setError('')

    try {
      const referencia = generarReferencia()
      const amountInCents = totalFinal * 100 // Wompi trabaja en centavos

      // 1. Pide la firma de integridad a tu backend
      const sigRes = await fetch('/api/wompi/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: referencia,
          amount_in_cents: amountInCents,
          currency: 'COP',
        }),
      })

      if (!sigRes.ok) throw new Error('No se pudo generar la firma')
      const { signature } = await sigRes.json()

      // 2. Guarda intención de compra en Supabase para recuperarla al volver
      const { error: errPendiente } = await supabase
        .from('compras_pendientes')
        .insert({
          referencia,
          user_id: userId,
          evento_id: evento.id,
          cantidad: cantidadTotal,
          total: totalFinal,
          // Guarda la selección por sección como JSON para generarla después
          seleccion_json: tieneSecciones
            ? lineas.map(l => ({ seccion_id: l.seccion.id, cantidad: l.cantidad }))
            : null,
        })

      if (errPendiente) throw new Error('Error guardando la compra')

      // 3. Redirige al checkout de Wompi
      const params = new URLSearchParams({
        'public-key': process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
        currency: 'COP',
        'amount-in-cents': String(amountInCents),
        reference: referencia,
        'signature:integrity': signature,
        'redirect-url': `${window.location.origin}/compra/resultado`,
      })

      window.location.href = `https://checkout.wompi.co/p/?${params}`
    } catch (e: any) {
      setError(e.message ?? 'Error iniciando el pago. Intenta de nuevo.')
      setCargando(false)
    }
  }

  // ── FORMULARIO ────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 text-lg mb-6">
        Selecciona tus boletas
      </h2>

      {tieneSecciones ? (
        /* ── Selector por secciones ── */
        <div className="space-y-3 mb-6">
          {secciones.map(s => {
            const disp = dispPorSeccion[s.id] ?? 0
            const cant = seleccion[s.id] ?? 0
            const agotada = disp === 0
            return (
              <div
                key={s.id}
                className={`rounded-xl border p-4 transition-colors ${
                  agotada ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {agotada ? 'Agotado' : `${disp} disponibles`} · {formatPrecio(s.precio)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidadSeccion(s.id, -1)}
                      disabled={cant <= 0 || agotada}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{cant}</span>
                    <button
                      onClick={() => cambiarCantidadSeccion(s.id, +1)}
                      disabled={cant >= Math.min(10, disp) || agotada}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Selector simple ── */
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Cantidad</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {boletasDisponibles} disponibles · Máximo {Math.min(10, boletasDisponibles)} por compra
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold w-8 text-center">{cantidad}</span>
            <button
              onClick={() => setCantidad(c => Math.min(Math.min(10, boletasDisponibles), c + 1))}
              disabled={cantidad >= Math.min(10, boletasDisponibles)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resumen del total */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        {tieneSecciones ? (
          lineas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-1">
              Selecciona boletas para ver el total
            </p>
          ) : (
            <>
              {lineas.map(l => (
                <div key={l.seccion.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {l.seccion.nombre} × {l.cantidad}
                  </span>
                  <span className="text-gray-700">
                    {formatPrecio(l.seccion.precio * l.cantidad)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cargo por servicio</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">
                  {formatPrecio(totalSecciones)}
                </span>
              </div>
            </>
          )
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {formatPrecio(evento.precio)} × {cantidad}
              </span>
              <span className="text-gray-700">{formatPrecio(totalSimple)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cargo por servicio</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">
                {formatPrecio(totalSimple)}
              </span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleComprar}
        disabled={
          cargando ||
          (tieneSecciones ? cantidadTotal === 0 : boletasDisponibles === 0)
        }
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {cargando ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirigiendo a pago…
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            {cantidadTotal > 0
              ? `Pagar · ${formatPrecio(totalFinal)}`
              : 'Selecciona boletas'}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Pago seguro procesado por Wompi
      </p>
    </div>
  )
}

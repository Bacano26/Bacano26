// components/compras/FormCompra.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrecio } from '@/lib/utils'
import type { Evento } from '@/types'

interface Props {
  evento: Evento
  userId: string
}

export default function FormCompra({ evento, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exitoso, setExitoso] = useState(false)
  const [codigosGenerados, setCodigosGenerados] = useState<string[]>([])

  const boletasRestantes = evento.capacidad - evento.boletas_vendidas
  const maximo = Math.min(10, boletasRestantes)
  const total = evento.precio * cantidad

  function generarCodigo(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codigo = 'BLT-'
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return codigo
  }

  async function handleComprar() {
    setCargando(true)
    setError('')

    try {
      // ← NUEVO: verifica disponibilidad en tiempo real
      const { data: eventoActual } = await supabase
        .from('eventos')
        .select('boletas_vendidas, capacidad')
        .eq('id', evento.id)
        .single()

      if (!eventoActual) {
        setError('Error verificando disponibilidad')
        return
      }

      const disponibles = eventoActual.capacidad - eventoActual.boletas_vendidas

      if (disponibles <= 0) {
        setError('Lo sentimos, este evento se agotó')
        return
      }

      if (cantidad > disponibles) {
        setError(`Solo quedan ${disponibles} boletas disponibles`)
        return
      }
      // ← FIN VERIFICACIÓN

      // PASO 1: Crear la compra
      const { data: compra, error: errorCompra } = await supabase
        .from('compras')
        .insert({
          user_id: userId,
          evento_id: evento.id,
          cantidad,
          total,
          estado: 'completado',
        })
        .select()
        .single()

      if (errorCompra || !compra) {
        setError('Error al procesar la compra. Intenta de nuevo.')
        return
      }

      // PASO 2: Crear boletas individuales
      const codigos: string[] = []
      const boletas = Array.from({ length: cantidad }, () => {
        const codigo = generarCodigo()
        codigos.push(codigo)
        return {
          compra_id: compra.id,
          codigo,
          usado: false,
        }
      })

      const { error: errorBoletas } = await supabase
        .from('boletas')
        .insert(boletas)

      if (errorBoletas) {
        setError('Error generando boletas. Contacta soporte.')
        return
      }

      // PASO 3: Actualizar boletas vendidas
      await supabase
        .from('eventos')
        .update({ boletas_vendidas: eventoActual.boletas_vendidas + cantidad })
        .eq('id', evento.id)

      setCodigosGenerados(codigos)
      setExitoso(true)

    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // ── PANTALLA DE ÉXITO ──
  if (exitoso) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Compra exitosa!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Compraste <strong>{cantidad} boleta{cantidad > 1 ? 's' : ''}</strong> para{' '}
          <strong>{evento.titulo}</strong>
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Tus códigos de boleta
          </p>
          <div className="space-y-2">
            {codigosGenerados.map((codigo, i) => (
              <div key={codigo} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                <span className="text-xs text-gray-400">Boleta {i + 1}</span>
                <span className="font-mono font-bold text-indigo-600 tracking-widest text-sm">
                  {codigo}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-6">
          <span className="text-sm text-gray-500">Total pagado</span>
          <span className="font-bold text-gray-900">{formatPrecio(total)}</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/historial')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Ver mis boletas
          </button>
          <button
            onClick={() => router.push('/eventos')}
            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Ver más eventos
          </button>
        </div>
      </div>
    )
  }

  // ── FORMULARIO ──
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 text-lg mb-6">
        Selecciona tus boletas
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-gray-700">Cantidad</p>
          <p className="text-xs text-gray-400 mt-0.5">Máximo {maximo} por compra</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCantidad(c => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold w-8 text-center">{cantidad}</span>
          <button
            onClick={() => setCantidad(c => Math.min(maximo, c + 1))}
            disabled={cantidad >= maximo}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{formatPrecio(evento.precio)} × {cantidad}</span>
          <span className="text-gray-700">{formatPrecio(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cargo por servicio</span>
          <span className="text-green-600 font-medium">Gratis</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-xl text-gray-900">{formatPrecio(total)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleComprar}
        disabled={cargando || boletasRestantes === 0}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {cargando ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Confirmar compra · {formatPrecio(total)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        🔒 Compra segura · Boleta digital inmediata
      </p>
    </div>
  )
}
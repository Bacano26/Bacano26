'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'
import BoletaPDF from '@/components/compras/BoletaPDF'

// ── Tipos ──────────────────────────────────────────────
interface DatosResultado {
  estado: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
  referencia: string
  totalPagado: number
  cantidadBoletas: number
  codigos: string[]
  evento: {
    titulo: string
    fecha: string
    lugar: string
    precio: number
  }
  usuario: {
    nombre: string
    email: string
  }
}

// ── Componente ─────────────────────────────────────────
export default function ResultadoCompraPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error' | 'pendiente'>('cargando')
  const [datos, setDatos] = useState<DatosResultado | null>(null)
  const [mensajeError, setMensajeError] = useState('')

  useEffect(() => {
    // Wompi devuelve el id de la transacción como ?id=xxx
    const transactionId = searchParams.get('id')

    if (!transactionId) {
      setMensajeError('No se encontró información de la transacción.')
      setEstado('error')
      return
    }

    verificarPago(transactionId)
  }, [searchParams])

  async function verificarPago(transactionId: string) {
    try {
      const res = await fetch(`/api/wompi/verificar?id=${transactionId}`)

      if (!res.ok) throw new Error('No se pudo verificar el pago')

      const data: DatosResultado = await res.json()
      setDatos(data)

      if (data.estado === 'APPROVED') {
        setEstado('ok')
      } else if (data.estado === 'PENDING') {
        setEstado('pendiente')
      } else {
        setMensajeError(
          data.estado === 'DECLINED'
            ? 'Tu banco rechazó el pago. Verifica tus datos o intenta con otra tarjeta.'
            : 'El pago fue cancelado o encontró un error.'
        )
        setEstado('error')
      }
    } catch {
      setMensajeError('Error verificando el pago. Si ya fue cobrado, revisa tu historial.')
      setEstado('error')
    }
  }

  // ── CARGANDO ──
  if (estado === 'cargando') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full mx-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="animate-spin w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Verificando tu pago…</p>
          <p className="text-sm text-gray-400">Esto solo toma un momento</p>
        </div>
      </div>
    )
  }

  // ── PENDIENTE ──
  if (estado === 'pendiente') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full mx-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-yellow-50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pago en proceso</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tu pago está siendo procesado. Recibirás tus boletas en cuanto se confirme.
            Esto puede tardar unos minutos.
          </p>
          <button
            onClick={() => router.push('/historial')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Ver mi historial
          </button>
        </div>
      </div>
    )
  }

  // ── ERROR ──
  if (estado === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full mx-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pago no completado</h2>
          <p className="text-sm text-gray-500 mb-6">{mensajeError}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.back()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => router.push('/eventos')}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Ver eventos
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── APROBADO ──
  if (!datos) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">

          {/* Encabezado éxito */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">¡Compra exitosa!</h2>
            <p className="text-gray-500 text-sm">
              Compraste{' '}
              <strong>
                {datos.cantidadBoletas} boleta{datos.cantidadBoletas > 1 ? 's' : ''}
              </strong>{' '}
              para <strong>{datos.evento.titulo}</strong>
            </p>
          </div>

          {/* Boletas en PDF */}
          <div className="space-y-4 mb-6">
            {datos.codigos.map((codigo, i) => (
              <BoletaPDF
                key={codigo}
                boleta={{ codigo, usado: false }}
                compra={{
                  cantidad: datos.cantidadBoletas,
                  total: datos.totalPagado,
                  created_at: new Date().toISOString(),
                }}
                evento={datos.evento}
                usuario={datos.usuario}
                numeroBoleta={i + 1}
                totalBoletas={datos.cantidadBoletas}
              />
            ))}
          </div>

          {/* Total pagado */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-6">
            <span className="text-sm text-gray-500">Total pagado</span>
            <span className="font-bold text-gray-900">{formatPrecio(datos.totalPagado)}</span>
          </div>

          {/* Referencia */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-gray-400">Referencia de pago</p>
            <p className="text-sm font-mono font-medium text-gray-700 mt-0.5">{datos.referencia}</p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/historial')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Ver mis boletas
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/eventos')}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Ver más eventos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

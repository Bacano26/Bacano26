// components/admin/QRScanner.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle, XCircle, Camera, CameraOff,
  Ticket, AlertCircle, RefreshCw
} from 'lucide-react'

type EstadoScan = 'idle' | 'escaneando' | 'valida' | 'usada' | 'invalida' | 'error'

interface ResultadoBoleta {
  codigo: string
  evento: string
  titular: string
  fecha: string
  lugar: string
}

export default function QRScanner() {
  const supabase = createClient()
  const scannerRef = useRef<any>(null)
  const contenedorId = 'qr-reader'

  const [estado, setEstado] = useState<EstadoScan>('idle')
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [resultado, setResultado] = useState<ResultadoBoleta | null>(null)
  const [codigoManual, setCodigoManual] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    return () => {
      // Limpia el escáner cuando el componente se desmonta
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function iniciarCamara() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(contenedorId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },  // usa cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (codigoTexto) => {
          // Cuando detecta un QR
          await scanner.stop()
          setCamaraActiva(false)
          await validarCodigo(codigoTexto)
        },
        () => {}  // error silencioso mientras busca
      )

      setCamaraActiva(true)
      setEstado('escaneando')

    } catch (err) {
      console.error('Error iniciando cámara:', err)
      setEstado('error')
    }
  }

  async function detenerCamara() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setCamaraActiva(false)
    setEstado('idle')
  }

  async function validarCodigo(codigo: string) {
    setCargando(true)
    setResultado(null)

    try {
      // Busca la boleta con la info del evento y la compra
      const { data: boleta, error } = await supabase
        .from('boletas')
        .select(`
          *,
          compra:compras(
            *,
            evento:eventos(*),
            perfil:profiles(nombre, email)
          )
        `)
        .eq('codigo', codigo.trim().toUpperCase())
        .single()

      if (error || !boleta) {
        setEstado('invalida')
        return
      }

      // Guarda info para mostrar
      setResultado({
        codigo: boleta.codigo,
        evento: boleta.compra?.evento?.titulo ?? 'N/A',
        titular: boleta.compra?.perfil?.nombre ?? 'N/A',
        fecha: boleta.compra?.evento?.fecha ?? '',
        lugar: boleta.compra?.evento?.lugar ?? '',
      })

      if (boleta.usado) {
        // Ya fue usada anteriormente
        setEstado('usada')
        return
      }

      // Marca la boleta como usada
      const { error: errorUpdate } = await supabase
        .from('boletas')
        .update({ usado: true })
        .eq('id', boleta.id)

      if (errorUpdate) {
        setEstado('error')
        return
      }

      setEstado('valida')

    } catch (err) {
      setEstado('error')
    } finally {
      setCargando(false)
    }
  }

  async function validarManual() {
    if (!codigoManual.trim()) return
    await validarCodigo(codigoManual)
    setCodigoManual('')
  }

  function reiniciar() {
    setEstado('idle')
    setResultado(null)
    setCodigoManual('')
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Panel de resultado */}
      {estado === 'valida' && resultado && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-1">¡Boleta válida!</h2>
          <p className="text-green-600 text-sm mb-4">Acceso permitido ✅</p>

          <div className="bg-white rounded-xl p-4 text-left space-y-2">
            <div>
              <p className="text-xs text-gray-400">Evento</p>
              <p className="text-sm font-semibold text-gray-900">{resultado.evento}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Titular</p>
              <p className="text-sm font-semibold text-gray-900">{resultado.titular}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Código</p>
              <p className="text-sm font-mono font-bold text-indigo-600">{resultado.codigo}</p>
            </div>
          </div>

          <button
            onClick={reiniciar}
            className="mt-4 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Escanear siguiente
          </button>
        </div>
      )}

      {estado === 'usada' && resultado && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-9 h-9 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-800 mb-1">Boleta ya usada</h2>
          <p className="text-amber-600 text-sm mb-4">Esta boleta ya fue utilizada ⚠️</p>

          <div className="bg-white rounded-xl p-4 text-left space-y-2">
            <div>
              <p className="text-xs text-gray-400">Evento</p>
              <p className="text-sm font-semibold text-gray-900">{resultado.evento}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Titular</p>
              <p className="text-sm font-semibold text-gray-900">{resultado.titular}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Código</p>
              <p className="text-sm font-mono font-bold text-amber-600">{resultado.codigo}</p>
            </div>
          </div>

          <button
            onClick={reiniciar}
            className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Escanear siguiente
          </button>
        </div>
      )}

      {estado === 'invalida' && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-9 h-9 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-1">Boleta inválida</h2>
          <p className="text-red-600 text-sm mb-4">Este código no existe en el sistema ❌</p>

          <button
            onClick={reiniciar}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Escáner de cámara */}
      {(estado === 'idle' || estado === 'escaneando') && (
        <>
          {/* Contenedor del escáner */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                Escanear con cámara
              </h2>
            </div>

            {/* Área del escáner */}
            <div className="p-4">
              <div
                id={contenedorId}
                className="w-full rounded-xl overflow-hidden bg-gray-100"
                style={{ minHeight: camaraActiva ? '300px' : '0' }}
              />

              {!camaraActiva && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    Activa la cámara para escanear el QR de la boleta
                  </p>
                </div>
              )}

              <button
                onClick={camaraActiva ? detenerCamara : iniciarCamara}
                className={`w-full mt-3 py-3 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  camaraActiva
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {camaraActiva ? (
                  <><CameraOff className="w-4 h-4" /> Detener cámara</>
                ) : (
                  <><Camera className="w-4 h-4" /> Activar cámara</>
                )}
              </button>
            </div>
          </div>

          {/* Validación manual */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Ticket className="w-4 h-4 text-indigo-600" />
              Ingresar código manualmente
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && validarManual()}
                placeholder="BLT-XXXXXXXX"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <button
                onClick={validarManual}
                disabled={cargando || !codigoManual.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {cargando ? '...' : 'Validar'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              También puedes escribir el código y presionar Enter
            </p>
          </div>
        </>
      )}
    </div>
  )
}
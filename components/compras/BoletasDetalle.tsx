// components/compras/BoletasDetalle.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface Boleta {
  id: string
  codigo: string
  usado: boolean
}

interface Props {
  boletas: Boleta[]
}

export default function BoletasDetalle({ boletas }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  function copiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    // Después de 2 segundos vuelve al ícono de copiar
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="border-t border-gray-50">

      {/* Botón expandir/colapsar */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">
          Ver {boletas.length} código{boletas.length > 1 ? 's' : ''} de boleta
        </span>
        {expandido
          ? <ChevronUp className="w-4 h-4" />
          : <ChevronDown className="w-4 h-4" />
        }
      </button>

      {/* Lista de códigos */}
      {expandido && (
        <div className="px-5 pb-5 space-y-2">
          {boletas.map((boleta, i) => (
            <div
              key={boleta.id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                boleta.usado
                  ? 'bg-gray-50 border-gray-100 opacity-60'
                  : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  Boleta {i + 1} {boleta.usado && '· Usada'}
                </p>
                <p className="font-mono font-bold text-indigo-600 tracking-widest text-sm">
                  {boleta.codigo}
                </p>
              </div>

              {/* Botón copiar código */}
              {!boleta.usado && (
                <button
                  onClick={() => copiarCodigo(boleta.codigo)}
                  className="w-8 h-8 rounded-lg bg-white border border-indigo-200 flex items-center justify-center hover:bg-indigo-50 transition-colors"
                  title="Copiar código"
                >
                  {copiado === boleta.codigo
                    ? <Check className="w-3.5 h-3.5 text-green-600" />
                    : <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
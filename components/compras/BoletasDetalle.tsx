// components/compras/BoletasDetalle.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import BoletaPDF from './BoletaPDF'

interface Boleta {
  id: string
  codigo: string
  usado: boolean
}

interface Props {
  boletas: Boleta[]
  compra: {
    cantidad: number
    total: number
    created_at: string
  }
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

export default function BoletasDetalle({ boletas, compra, evento, usuario }: Props) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="border-t border-gray-50">

      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">
          Ver {boletas.length} boleta{boletas.length > 1 ? 's' : ''} y descargar
        </span>
        {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expandido && (
        <div className="px-5 pb-5 space-y-4">
          {boletas.map((boleta, i) => (
            <BoletaPDF
              key={boleta.id}
              boleta={boleta}
              compra={compra}
              evento={evento}
              usuario={usuario}
              numeroBoleta={i + 1}
              totalBoletas={boletas.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}
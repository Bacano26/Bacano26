// components/compras/BoletaPDF.tsx
'use client'

import { useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'

interface Props {
  boleta: {
    codigo: string
    usado: boolean
  }
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
  numeroBoleta: number
  totalBoletas: number
}

export default function BoletaPDF({ boleta, compra, evento, usuario, numeroBoleta, totalBoletas }: Props) {
  const [generando, setGenerando] = useState(false)
  const boletaRef = useRef<HTMLDivElement>(null)

  async function descargarPDF() {
    if (!boletaRef.current) return
    setGenerando(true)

    try {
      const QRCode = (await import('qrcode')).default
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      // Genera el QR
      const qrDataUrl = await QRCode.toDataURL(boleta.codigo, {
        width: 200,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })

      // Muestra el QR en el elemento
      const qrImg = document.getElementById(`qr-${boleta.codigo}`) as HTMLImageElement
      if (qrImg) qrImg.src = qrDataUrl

      // Espera que el QR se renderice
      await new Promise(r => setTimeout(r, 300))

      // Captura el elemento como imagen
      const canvas = await html2canvas(boletaRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [148, 210],  // A5
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`boleta-${boleta.codigo}.pdf`)

    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="space-y-3">

      {/* Boleta visual — lo que se convierte en PDF */}
      <div
        ref={boletaRef}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header morado */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          padding: '20px 24px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Boletas App
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.2 }}>
                {evento.titulo}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>Boleta</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {numeroBoleta}/{totalBoletas}
              </div>
            </div>
          </div>
        </div>

        {/* Línea punteada divisoria */}
        <div style={{
          borderTop: '2px dashed #e5e7eb',
          margin: '0 16px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: '-24px', top: '-10px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#f9fafb', border: '1px solid #e5e7eb',
          }} />
          <div style={{
            position: 'absolute', right: '-24px', top: '-10px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#f9fafb', border: '1px solid #e5e7eb',
          }} />
        </div>

        {/* Contenido principal */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

            {/* Info del evento */}
            <div style={{ flex: 1 }}>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Fecha y hora
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  {formatFecha(evento.fecha)}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Lugar
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  {evento.lugar}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Titular
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  {usuario.nombre}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {usuario.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Valor
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {formatPrecio(evento.precio)}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '8px',
                display: 'inline-block',
              }}>
                <img
                  id={`qr-${boleta.codigo}`}
                  width={90}
                  height={90}
                  alt="QR"
                  style={{ display: 'block' }}
                />
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#4f46e5',
                fontWeight: 'bold',
                marginTop: '6px',
                letterSpacing: '1px',
              }}>
                {boleta.codigo}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb',
          borderTop: '1px solid #f3f4f6',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
            Comprado el {new Date(compra.created_at).toLocaleDateString('es-CO')}
          </div>
          <div style={{
            fontSize: '10px',
            color: boleta.usado ? '#ef4444' : '#10b981',
            fontWeight: '600',
            background: boleta.usado ? '#fef2f2' : '#f0fdf4',
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            {boleta.usado ? '● Usada' : '● Válida'}
          </div>
        </div>
      </div>

      {/* Botón descargar */}
      <button
        onClick={descargarPDF}
        disabled={generando || boleta.usado}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {generando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {boleta.usado ? 'Boleta usada' : 'Descargar boleta PDF'}
          </>
        )}
      </button>
    </div>
  )
}
// components/compras/BoletaPDF.tsx
'use client'

import { useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { formatFecha, formatPrecio } from '@/lib/utils'

interface Props {
  boleta: { codigo: string; usado: boolean }
  compra: { cantidad: number; total: number; created_at: string }
  evento: { titulo: string; fecha: string; lugar: string; precio: number }
  usuario: { nombre: string; email: string }
  numeroBoleta: number
  totalBoletas: number
}

export default function BoletaPDF({ boleta, compra, evento, usuario, numeroBoleta, totalBoletas }: Props) {
  const [generando, setGenerando] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  async function descargarPDF() {
    setGenerando(true)

    try {
      // Genera el QR
      const QRCode = (await import('qrcode')).default
      const qrDataUrl = await QRCode.toDataURL(boleta.codigo, {
        width: 200,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      setQrUrl(qrDataUrl)

      // Espera que el QR se renderice
      await new Promise(r => setTimeout(r, 400))

      // Abre ventana de impresión solo con la boleta
      const ventana = window.open('', '_blank')
      if (!ventana) return

      ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <title>Boleta - ${boleta.codigo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; }
            
            .boleta {
              width: 148mm;
              margin: 10mm auto;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #4f46e5, #7c3aed);
              padding: 20px 24px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .header-left .app-name {
              font-size: 10px;
              opacity: 0.7;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }

            .header-left .titulo {
              font-size: 20px;
              font-weight: bold;
            }

            .header-right {
              text-align: right;
            }

            .header-right .label {
              font-size: 10px;
              opacity: 0.7;
            }

            .header-right .numero {
              font-size: 22px;
              font-weight: bold;
            }

            .divider {
              border-top: 2px dashed #e5e7eb;
              margin: 0 16px;
              position: relative;
            }

            .body {
              padding: 16px 24px;
              display: flex;
              gap: 16px;
              align-items: flex-start;
            }

            .info { flex: 1; }

            .info-item {
              margin-bottom: 12px;
            }

            .info-label {
              font-size: 9px;
              color: #9ca3af;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }

            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
            }

            .info-sub {
              font-size: 11px;
              color: #6b7280;
            }

            .precio {
              font-size: 20px;
              font-weight: bold;
              color: #4f46e5;
            }

            .qr-section {
              text-align: center;
              flex-shrink: 0;
            }

            .qr-box {
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              padding: 8px;
              display: inline-block;
            }

            .qr-box img {
              width: 100px;
              height: 100px;
              display: block;
            }

            .codigo {
              font-family: monospace;
              font-size: 11px;
              color: #4f46e5;
              font-weight: bold;
              margin-top: 6px;
              letter-spacing: 1px;
            }

            .footer {
              background: #f9fafb;
              border-top: 1px solid #f3f4f6;
              padding: 10px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .footer-fecha {
              font-size: 10px;
              color: #9ca3af;
            }

            .estado-valida {
              font-size: 10px;
              color: #10b981;
              font-weight: 600;
              background: #f0fdf4;
              padding: 2px 8px;
              border-radius: 20px;
            }

            .estado-usada {
              font-size: 10px;
              color: #ef4444;
              font-weight: 600;
              background: #fef2f2;
              padding: 2px 8px;
              border-radius: 20px;
            }

            @media print {
              body { margin: 0; }
              .boleta { margin: 0; border-radius: 0; border: none; }
            }
          </style>
        </head>
        <body>
          <div class="boleta">
            <div class="header">
              <div class="header-left">
                <div class="app-name">Boletas App</div>
                <div class="titulo">${evento.titulo}</div>
              </div>
              <div class="header-right">
                <div class="label">Boleta</div>
                <div class="numero">${numeroBoleta}/${totalBoletas}</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="body">
              <div class="info">
                <div class="info-item">
                  <div class="info-label">Fecha y hora</div>
                  <div class="info-value">${new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(evento.fecha))}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Lugar</div>
                  <div class="info-value">${evento.lugar}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Titular</div>
                  <div class="info-value">${usuario.nombre}</div>
                  <div class="info-sub">${usuario.email}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Valor</div>
                  <div class="precio">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(evento.precio)}</div>
                </div>
              </div>

              <div class="qr-section">
                <div class="qr-box">
                  <img src="${qrDataUrl}" alt="QR" />
                </div>
                <div class="codigo">${boleta.codigo}</div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-fecha">
                Comprado el ${new Date(compra.created_at).toLocaleDateString('es-CO')}
              </div>
              <div class="${boleta.usado ? 'estado-usada' : 'estado-valida'}">
                ${boleta.usado ? '● Usada' : '● Válida'}
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print()
              window.onafterprint = function() { window.close() }
            }
          </script>
        </body>
        </html>
      `)

      ventana.document.close()

    } catch (err) {
      console.error('Error:', err)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="space-y-3">

      {/* Vista previa de la boleta */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          padding: '20px 24px', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              Boletas App
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{evento.titulo}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Boleta</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{numeroBoleta}/{totalBoletas}</div>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed #e5e7eb', margin: '0 16px' }} />

        {/* Body */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {[
              { label: 'Fecha y hora', value: new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(evento.fecha)) },
              { label: 'Lugar', value: evento.lugar },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{item.value}</div>
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Titular</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{usuario.nombre}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{usuario.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Valor</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4f46e5' }}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(evento.precio)}
              </div>
            </div>
          </div>

          {/* QR */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '10px', padding: '8px', display: 'inline-block' }}>
              {qrUrl ? (
                <img src={qrUrl} width={100} height={100} alt="QR" style={{ display: 'block' }} />
              ) : (
                <div style={{ width: 100, height: 100, background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>QR</span>
                </div>
              )}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4f46e5', fontWeight: 'bold', marginTop: '6px', letterSpacing: '1px' }}>
              {boleta.codigo}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb', borderTop: '1px solid #f3f4f6',
          padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
            Comprado el {new Date(compra.created_at).toLocaleDateString('es-CO')}
          </div>
          <div style={{
            fontSize: '10px',
            color: boleta.usado ? '#ef4444' : '#10b981',
            fontWeight: '600',
            background: boleta.usado ? '#fef2f2' : '#f0fdf4',
            padding: '2px 8px', borderRadius: '20px',
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
            Generando...
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
// app/admin/scanner/page.tsx
import type { Metadata } from 'next'
import QRScanner from '@/components/admin/QRScanner'

export const metadata: Metadata = {
  title: 'Escáner QR | Admin',
}

export default function ScannerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Escáner de boletas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Escanea el QR de la boleta para validarla en la entrada
        </p>
      </div>
      <QRScanner />
    </div>
  )
}
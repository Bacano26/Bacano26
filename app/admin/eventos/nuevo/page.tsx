// app/admin/eventos/nuevo/page.tsx
import FormEvento from '@/components/admin/FormEvento'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo evento | Admin' }

export default function NuevoEventoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Crear evento</h1>
      <FormEvento />
    </div>
  )
}
// app/admin/eventos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormEvento from '@/components/admin/FormEvento'
import SeccionesEditor from '@/components/admin/SeccionesEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar evento | Admin' }

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: evento, error }, { data: secciones }] = await Promise.all([
    supabase.from('eventos').select('*').eq('id', id).single(),
    supabase.from('secciones').select('*').eq('evento_id', id).order('orden'),
  ])

  if (!evento || error) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar evento</h1>
      <p className="text-gray-500 text-sm mb-8">{evento.titulo}</p>

      <FormEvento evento={evento} />

      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Secciones</h2>
        <p className="text-gray-500 text-sm mb-4">
          Define zonas con precio y capacidad independientes (VIP, General, etc.).
          Si no agregas secciones, se usará el precio y capacidad del evento.
        </p>
        <SeccionesEditor eventoId={id} seccionesIniciales={secciones ?? []} />
      </div>
    </div>
  )
}
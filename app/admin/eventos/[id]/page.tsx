// app/admin/eventos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormEvento from '@/components/admin/FormEvento'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar evento | Admin' }

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single()

  if (!evento || error) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar evento</h1>
      <p className="text-gray-500 text-sm mb-8">{evento.titulo}</p>
      <FormEvento evento={evento} />
    </div>
  )
}
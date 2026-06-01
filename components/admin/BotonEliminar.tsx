'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  id: string
  titulo: string
}

export default function BotonEliminar({ id, titulo }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [cargando, setCargando] = useState(false)

  async function eliminar() {
    const confirmado = confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    setCargando(true)
    await supabase.from('eventos').delete().eq('id', id)
    await fetch('/api/revalidar', { method: 'POST' })  // ← nuevo
    router.refresh()
    router.push('/admin/eventos')                       // ← nuevo
    setCargando(false)
  }

  return (
    <button
      onClick={eliminar}
      disabled={cargando}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar evento"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
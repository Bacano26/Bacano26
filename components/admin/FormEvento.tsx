// components/admin/FormEvento.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Evento } from '@/types'

interface Props {
  evento?: Evento
}

export default function FormEvento({ evento }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const modoEdicion = !!evento

  const [form, setForm] = useState({
    titulo:      evento?.titulo      ?? '',
    descripcion: evento?.descripcion ?? '',
    fecha:       evento?.fecha       ? evento.fecha.slice(0, 16) : '',
    lugar:       evento?.lugar       ?? '',
    imagen_url:  evento?.imagen_url  ?? '',
    precio:      evento?.precio      ?? '',
    capacidad:   evento?.capacidad   ?? '',
    activo:      evento?.activo      ?? true,
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (!form.titulo || !form.fecha || !form.lugar || !form.precio || !form.capacidad) {
      setError('Todos los campos obligatorios deben estar completos')
      setCargando(false)
      return
    }

    const datos = {
      titulo:      form.titulo,
      descripcion: form.descripcion || null,
      fecha:       new Date(form.fecha).toISOString(),
      lugar:       form.lugar,
      imagen_url:  form.imagen_url || null,
      precio:      Number(form.precio),
      capacidad:   Number(form.capacidad),
      activo:      form.activo,
    }

    try {
      if (modoEdicion) {
        const { error } = await supabase
          .from('eventos')
          .update(datos)
          .eq('id', evento!.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('eventos')
          .insert({ ...datos, boletas_vendidas: 0 })
        if (error) throw error
      }

      // ← ÚNICO CAMBIO: agrega revalidar antes de redirigir
      await fetch('/api/revalidar', { method: 'POST' })
      router.refresh()
      router.push('/admin/eventos')

    } catch (err: any) {
      setError(err.message ?? 'Error al guardar el evento')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          placeholder="Ej: Concierto de Rock"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          placeholder="Describe el evento..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input
            name="fecha"
            type="datetime-local"
            value={form.fecha}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Lugar <span className="text-red-500">*</span>
          </label>
          <input
            name="lugar"
            value={form.lugar}
            onChange={handleChange}
            placeholder="Ej: Movistar Arena, Bogotá"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Precio (COP) <span className="text-red-500">*</span>
          </label>
          <input
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            placeholder="150000"
            min="0"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Capacidad <span className="text-red-500">*</span>
          </label>
          <input
            name="capacidad"
            type="number"
            value={form.capacidad}
            onChange={handleChange}
            placeholder="1000"
            min="1"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          URL de imagen
        </label>
        <input
          name="imagen_url"
          value={form.imagen_url}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {form.imagen_url && (
          <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={form.imagen_url}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="activo"
          id="activo"
          checked={form.activo}
          onChange={handleChange}
          className="w-4 h-4 rounded text-indigo-600"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-700">
          Evento activo (visible al público)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {cargando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear evento'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/eventos')}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
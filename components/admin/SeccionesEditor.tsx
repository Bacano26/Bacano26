// components/admin/SeccionesEditor.tsx
'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrecio } from '@/lib/utils'

interface Seccion {
  id?: string
  nombre: string
  precio: number
  capacidad: number
  vendidas: number
  orden: number
}

interface Props {
  eventoId: string
  seccionesIniciales: Seccion[]
}

export default function SeccionesEditor({ eventoId, seccionesIniciales }: Props) {
  const supabase = createClient()
  const [secciones, setSecciones] = useState<Seccion[]>(seccionesIniciales)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  function agregar() {
    setSecciones(prev => [...prev, {
      nombre: '',
      precio: 0,
      capacidad: 100,
      vendidas: 0,
      orden: prev.length,
    }])
  }

  function actualizar(index: number, campo: keyof Seccion, valor: string | number) {
    setSecciones(prev => prev.map((s, i) =>
      i === index ? { ...s, [campo]: valor } : s
    ))
  }

  function eliminar(index: number) {
    setSecciones(prev => prev.filter((_, i) => i !== index))
  }

  async function guardar() {
    setGuardando(true)
    setMensaje('')

    // Validar
    for (const s of secciones) {
      if (!s.nombre.trim()) {
        setMensaje('Todas las secciones deben tener nombre')
        setGuardando(false)
        return
      }
      if (s.precio < 0) {
        setMensaje('El precio no puede ser negativo')
        setGuardando(false)
        return
      }
      if (s.capacidad < 1) {
        setMensaje('La capacidad mínima es 1')
        setGuardando(false)
        return
      }
    }

    try {
      // Borrar todas las secciones existentes y reinsertar
      // (más simple que hacer upsert con orden cambiante)
      const { error: errorDelete } = await supabase
        .from('secciones')
        .delete()
        .eq('evento_id', eventoId)
        .is('vendidas', 0) // ⚠️ solo borra las que no tienen ventas

      // Las que tienen ventas solo se actualizan
      const conVentas = secciones.filter(s => s.id && s.vendidas > 0)
      const sinVentas = secciones.filter(s => !s.id || s.vendidas === 0)

      // Upsert las que tienen ventas (solo nombre, precio, capacidad, orden)
      if (conVentas.length > 0) {
        await supabase.from('secciones').upsert(
          conVentas.map((s, i) => ({
            id: s.id,
            evento_id: eventoId,
            nombre: s.nombre.trim(),
            precio: s.precio,
            capacidad: s.capacidad,
            vendidas: s.vendidas,
            orden: i,
          }))
        )
      }

      // Insertar las nuevas / sin ventas
      if (sinVentas.length > 0) {
        await supabase.from('secciones').insert(
          sinVentas.map((s, i) => ({
            evento_id: eventoId,
            nombre: s.nombre.trim(),
            precio: s.precio,
            capacidad: s.capacidad,
            vendidas: 0,
            orden: conVentas.length + i,
          }))
        )
      }

      setMensaje('✓ Secciones guardadas')
    } catch {
      setMensaje('Error guardando. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">
          {secciones.length === 0
            ? 'Sin secciones — se usará el selector de cantidad simple'
            : `${secciones.length} sección${secciones.length > 1 ? 'es' : ''}`}
        </p>
        <button
          onClick={agregar}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Agregar sección
        </button>
      </div>

      {secciones.map((s, i) => (
        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
          <GripVertical className="w-4 h-4 text-gray-300 mt-2.5 shrink-0" />

          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="col-span-3 sm:col-span-1">
              <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
              <input
                type="text"
                value={s.nombre}
                onChange={e => actualizar(i, 'nombre', e.target.value)}
                placeholder="Ej: VIP, General, Palco"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Precio</label>
              <input
                type="number"
                min="0"
                value={s.precio}
                onChange={e => actualizar(i, 'precio', Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Capacidad
                {s.vendidas > 0 && (
                  <span className="ml-1 text-amber-600">({s.vendidas} vendidas)</span>
                )}
              </label>
              <input
                type="number"
                min={s.vendidas || 1}
                value={s.capacidad}
                onChange={e => actualizar(i, 'capacidad', Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={() => eliminar(i)}
            disabled={s.vendidas > 0}
            title={s.vendidas > 0 ? 'No se puede eliminar: tiene ventas' : 'Eliminar'}
            className="mt-2 text-gray-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {secciones.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          {mensaje && (
            <p className={`text-sm ${mensaje.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {mensaje}
            </p>
          )}
          <button
            onClick={guardar}
            disabled={guardando}
            className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar secciones'}
          </button>
        </div>
      )}
    </div>
  )
}
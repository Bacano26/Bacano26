// app/admin/ventas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatFecha, formatPrecio } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ventas | Admin' }

export default async function AdminVentasPage() {
  const supabase = await createClient()

  const { data: compras } = await supabase
    .from('compras')
    .select(`*, evento:eventos(titulo), perfil:profiles(nombre, email)`)
    .order('created_at', { ascending: false })

  const totalIngresos = compras
    ?.filter(c => c.estado === 'completado')
    .reduce((sum, c) => sum + c.total, 0) ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {compras?.length ?? 0} compras · {formatPrecio(totalIngresos)} en ingresos
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Usuario</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Evento</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Cantidad</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Total</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Estado</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-600">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {compras?.map(compra => (
              <tr key={compra.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{compra.perfil?.nombre ?? 'N/A'}</p>
                  <p className="text-xs text-gray-400">{compra.perfil?.email}</p>
                </td>
                <td className="px-5 py-4 text-gray-700 max-w-40 truncate">
                  {compra.evento?.titulo ?? 'N/A'}
                </td>
                <td className="px-5 py-4 text-gray-700">{compra.cantidad}</td>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {formatPrecio(compra.total)}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    compra.estado === 'completado'
                      ? 'bg-green-100 text-green-700'
                      : compra.estado === 'cancelado'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {compra.estado}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {new Date(compra.created_at).toLocaleDateString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
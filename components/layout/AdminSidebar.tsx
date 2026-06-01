// components/layout/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Ticket, ShoppingBag,
  Plus, ArrowLeft,  QrCode 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin',          label: 'Dashboard',  icono: <LayoutDashboard className="w-4 h-4" />, exact: true },
  { href: '/admin/eventos',  label: 'Eventos',    icono: <Ticket className="w-4 h-4" />,          exact: false },
  { href: '/admin/ventas',   label: 'Ventas',     icono: <ShoppingBag className="w-4 h-4" />,     exact: false },
  { href: '/admin/scanner',  label: 'Escáner QR', icono: <QrCode className="w-4 h-4" />,          exact: false },  // ← nuevo
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function estaActivo(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Boletas App</span>
        </div>
        <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* Links */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              estaActivo(link.href, link.exact)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {link.icono}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Botón crear evento */}
      <div className="p-3 border-t border-gray-100">
        <Link
          href="/admin/eventos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo evento
        </Link>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm mt-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir al sitio
        </Link>
      </div>
    </aside>
  )
}
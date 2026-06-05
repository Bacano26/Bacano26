'use client'

import Image from 'next/image'; 
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Ticket, ShoppingBag,
  Plus, ArrowLeft, QrCode 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin',         label: 'Dashboard',  icono: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />, exact: true },
  { href: '/admin/eventos',  label: 'Eventos',    icono: <Ticket className="w-4 h-4 flex-shrink-0" />,          exact: false },
  { href: '/admin/ventas',   label: 'Ventas',     icono: <ShoppingBag className="w-4 h-4 flex-shrink-0" />,     exact: false },
  { href: '/admin/scanner',  label: 'Escáner QR', icono: <QrCode className="w-4 h-4 flex-shrink-0" />,          exact: false },
]

// Definimos la interfaz para recibir la propiedad desde el layout
interface AdminSidebarProps {
  colapsado: boolean
}

export default function AdminSidebar({ colapsado }: AdminSidebarProps) {
  const pathname = usePathname()

  function estaActivo(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className={cn(
      "flex-shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col transition-all duration-300",
      colapsado ? "w-16" : "w-56" // Se encoge a w-16 si está colapsado, si no mantiene sus w-56 originales
    )}>

      {/* Logo */}
      <div className={cn("p-5 border-b border-gray-100 flex flex-col", colapsado ? "items-center" : "items-start")}>
        <div className="flex items-center gap-2 mb-1"> 
          <Image src="/logo.svg" alt="Logo Bacano" width={28} height={28} className="h-7 w-7 flex-shrink-0"/>
          {/* Escondemos la palabra "Bacano" si está colapsado */}
          {!colapsado && <span className="font-bold text-gray-900 text-sm transition-opacity">Bacano</span>}
        </div>
        {/* Escondemos la etiqueta "Admin" si está colapsado */}
        {!colapsado && (
          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
            Admin
          </span>
        )}
      </div>

      {/* Links de Navegación */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            title={colapsado ? link.label : undefined} // Muestra un tooltip nativo al pasar el mouse si está colapsado
            className={cn(
              'flex items-center rounded-xl text-sm font-medium transition-colors',
              colapsado ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5', // Centra el icono si está cerrado
              estaActivo(link.href, link.exact)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {link.icono}
            {/* Escondemos el texto de la sección si está colapsado */}
            {!colapsado && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Botones de Acción Inferiores */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <Link
          href="/admin/eventos/nuevo"
          title={colapsado ? "Nuevo evento" : undefined}
          className={cn(
            "flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors",
            colapsado ? "justify-center p-2.5" : "justify-center gap-2 w-full py-2.5"
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {/* Escondemos el texto del botón si está colapsado */}
          {!colapsado && <span>Nuevo evento</span>}
        </Link>

        <Link
          href="/"
          title={colapsado ? "Ir al sitio" : undefined}
          className={cn(
            "flex items-center text-gray-500 hover:text-gray-700 text-sm transition-colors",
            colapsado ? "justify-center p-2.5" : "justify-center gap-2 w-full py-2.5 mt-2"
          )}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {/* Escondemos el texto de salida si está colapsado */}
          {!colapsado && <span>Ir al sitio</span>}
        </Link>
      </div>
    </aside>
  )
}
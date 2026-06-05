'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Estado para controlar si el sidebar está expandido o colapsado
  const [sidebarAbierto, setSidebarAbierto] = useState(true)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Le pasamos el estado al Sidebar para que sepa si hacerse pequeño */}
      <AdminSidebar colapsado={!sidebarAbierto} />
      
      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra superior del admin con el botón para abrir/cerrar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title={sidebarAbierto ? "Colapsar menú" : "Expandir menú"}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-medium text-gray-400 ml-2 hidden sm:inline">
            Panel de Administración
          </span>
        </header>

        {/* El contenido de tus páginas (scanner, eventos, etc.) */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'; 
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Ticket, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user, profile } = useAuth()

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [dropdownAbierto, setDropdownAbierto] = useState(false)

  const links = [
    { href: '/',        label: 'Inicio' },
    { href: '/eventos', label: 'Eventos' },
  ]

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo Bacano" width={28} height={28} className="h-7 w-7"/>
            <span className="font-bold text-gray-900">Bacano</span>
          </Link>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Extremo Derecho */}
          <div className="flex items-center gap-2">
            
            {/* CASO 1: USUARIO LOGUEADO (Se ve en Móvil y Escritorio) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-600">
                      {profile?.nombre?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  {/* El nombre escrito solo aparece en computadora */}
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {profile?.nombre?.split(' ')[0] ?? 'Usuario'}
                  </span>
                </button>

                {/* Menú desplegable para el usuario (sirve tanto para clic en móvil como en PC) */}
                {dropdownAbierto && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownAbierto(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                      {/* En móvil, como no se ve el nombre afuera, se lo mostramos aquí arriba */}
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 md:bg-transparent">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {profile?.nombre ?? 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>

                      {/* Links exclusivos de móvil dentro del menú del usuario */}
                      <div className="block md:hidden border-b border-gray-50 py-1">
                        {links.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setDropdownAbierto(false)}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href="/historial"
                        onClick={() => setDropdownAbierto(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Ticket className="w-4 h-4 text-gray-400" />
                        Mis boletas
                      </Link>

                      {profile?.rol === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownAbierto(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Panel admin
                        </Link>
                      )}

                      <div className="border-t border-gray-50 mt-1">
                        <button
                          onClick={cerrarSesion}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* CASO 2: USUARIO NO LOGUEADO */
              <>
                {/* Botones normales en Escritorio */}
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>

                {/* Hambuerguesa en celular SOLO si NO está logueado */}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMenuAbierto(!menuAbierto)}
                >
                  {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Menú móvil de la hamburguesa (SOLO abre si NO está logueado) */}
      {menuAbierto && !user && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className={cn(
                'block px-4 py-2.5 rounded-lg text-sm font-medium',
                pathname === link.href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <Link href="/login" onClick={() => setMenuAbierto(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Iniciar sesión
            </Link>
            <Link href="/register" onClick={() => setMenuAbierto(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50">
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
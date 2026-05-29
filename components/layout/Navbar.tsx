// components/layout/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
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

          {/* Derecha */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">
                      {profile?.nombre?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.nombre?.split(' ')[0] ?? 'Usuario'}
                  </span>
                </button>

                {dropdownAbierto && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownAbierto(false)}
                    />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {profile?.nombre}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
              <>
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
              </>
            )}
          </div>

          {/* Hamburguesa móvil */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
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
            {user ? (
              <>
                <Link href="/historial" onClick={() => setMenuAbierto(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Mis boletas
                </Link>
                <button onClick={cerrarSesion}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuAbierto(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={() => setMenuAbierto(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
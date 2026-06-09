'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Errores {
  email?: string
  password?: string
  general?: string
}

export default function FormLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState<Errores>({})

  function validar(): boolean {
    const nuevosErrores: Errores = {}

    if (!email) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'El email no es válido'
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es requerida'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setCargando(true)
    setErrores({})

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrores({ general: 'Email o contraseña incorrectos' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrores({ general: 'Debes verificar tu email antes de iniciar sesión' })
        } else {
          setErrores({ general: 'Error al iniciar sesión. Intenta de nuevo.' })
        }
        return
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', data.user.id)
          .single()

        if (profile?.rol === 'admin') {
          router.push('/admin')
        } else {
          router.push(next ?? '/')
        }

        router.refresh()
      }

    } catch (err) {
      setErrores({ general: 'Error inesperado. Intenta de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
        <p className="text-gray-500 text-sm mt-1">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errores.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errores.general}</p>
          </div>
        )}

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errores.email}
          icono={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="password"
            label="Contraseña"
            type={mostrarPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errores.password}
            icono={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="/recuperar-password" className="text-xs text-indigo-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          cargando={cargando}
          className="w-full"
          tamaño="lg"
        >
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  )
}
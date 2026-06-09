// components/auth/FormRegister.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Phone, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Errores {
  nombre?: string
  cedula?: string
  telefono?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function FormRegister() {
  const router = useRouter()
  const supabase = createClient()

  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [exitoso, setExitoso] = useState(false)

  function validar(): boolean {
    const nuevosErrores: Errores = {}

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido'
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!cedula.trim()) {
      nuevosErrores.cedula = 'La cédula es requerida'
    } else if (!/^\d{6,12}$/.test(cedula.trim())) {
      nuevosErrores.cedula = 'La cédula debe tener entre 6 y 12 dígitos'
    }

    if (!telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido'
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(telefono.trim())) {
      nuevosErrores.telefono = 'El teléfono no es válido'
    }

    if (!email) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'El email no es válido'
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!confirmPassword) {
      nuevosErrores.confirmPassword = 'Confirma tu contraseña'
    } else if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden'
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrores({ email: 'Este email ya está registrado' })
        } else {
          setErrores({ general: 'Error al registrarse. Intenta de nuevo.' })
        }
        return
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nombre: nombre.trim(),
            cedula: cedula.trim(),
            telefono: telefono.trim(),
            email: email.toLowerCase(),
            rol: 'usuario',
          })

        if (profileError) {
          console.error('Error creando perfil:', profileError)
        }
      }

      setExitoso(true)

    } catch (err) {
      setErrores({ general: 'Error inesperado. Intenta de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  if (exitoso) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Revisa tu email!
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Te enviamos un link de verificación a <strong>{email}</strong>.
          Haz clic en el link para activar tu cuenta.
        </p>
        <Link href="/login">
          <Button variante="secondary" className="w-full">
            Ir al login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Inicia sesión
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
          id="nombre"
          label="Nombre completo"
          type="text"
          placeholder="Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={errores.nombre}
          icono={<User className="w-4 h-4" />}
          autoComplete="name"
        />

        <Input
          id="cedula"
          label="Número de cédula"
          type="text"
          placeholder="Ej: 1234567890"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          error={errores.cedula}
          icono={<CreditCard className="w-4 h-4" />}
          autoComplete="off"
        />

        <Input
          id="telefono"
          label="Número de teléfono"
          type="tel"
          placeholder="Ej: +57 300 000 0000"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          error={errores.telefono}
          icono={<Phone className="w-4 h-4" />}
          autoComplete="tel"
        />

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errores.password}
            icono={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          id="confirmPassword"
          label="Confirmar contraseña"
          type={mostrarPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errores.confirmPassword}
          icono={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          cargando={cargando}
          className="w-full mt-2"
          tamaño="lg"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </div>
  )
}
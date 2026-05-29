// components/auth/FormRegister.tsx
'use client'  // ← Este componente usa estado del browser (useState, eventos)

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// Forma de los errores del formulario
interface Errores {
  nombre?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function FormRegister() {
  const router = useRouter()
  const supabase = createClient()

  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [exitoso, setExitoso] = useState(false)

  // Valida los campos ANTES de enviar al servidor
  function validar(): boolean {
    const nuevosErrores: Errores = {}

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido'
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres'
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
    // Retorna true si NO hay errores
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()  // Evita que el form recargue la página
    
    if (!validar()) return  // Para si hay errores de validación

    setCargando(true)
    setErrores({})

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Datos extras que se guardan en auth.users metadata
          data: { nombre },
          // URL a la que Supabase redirige después de verificar el email
          emailRedirectTo: '${window.location.origin}/api/auth/callback',
        },
      })

      if (error) {
        // Traduce errores comunes de Supabase al español
        if (error.message.includes('already registered')) {
          setErrores({ email: 'Este email ya está registrado' })
        } else {
          setErrores({ general: 'Error al registrarse. Intenta de nuevo.' })
        }
        return
      }

      // 2. Si el usuario se creó, crear su perfil en la tabla profiles
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nombre: nombre.trim(),
            email: email.toLowerCase(),
            rol: 'usuario',
          })

        if (profileError) {
          console.error('Error creando perfil:', profileError)
          // No bloquea al usuario, el perfil se puede crear después
        }
      }

      // 3. Mostrar mensaje de éxito (verificar email)
      setExitoso(true)

    } catch (err) {
      setErrores({ general: 'Error inesperado. Intenta de nuevo.' })
    } finally {
      // Siempre quita el estado de carga al terminar
      setCargando(false)
    }
  }

  // Pantalla de éxito después de registrarse
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
      {/* Encabezado */}
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
        {/* Error general */}
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

        {/* Password con botón para mostrar/ocultar */}
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
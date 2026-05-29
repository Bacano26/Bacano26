// hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null        // usuario de Supabase Auth
  profile: Profile | null  // perfil de tu tabla profiles
  cargando: boolean
}

export function useAuth(): AuthState {
  const supabase = createClient()
  const [estado, setEstado] = useState<AuthState>({
    user: null,
    profile: null,
    cargando: true,
  })

  useEffect(() => {
    // 1. Obtiene la sesión actual al montar el componente
    async function obtenerSesion() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Si hay usuario, busca su perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setEstado({ user, profile, cargando: false })
      } else {
        setEstado({ user: null, profile: null, cargando: false })
      }
    }

    obtenerSesion()

    // 2. Escucha cambios de sesión (login, logout)
    // onAuthStateChange se dispara automáticamente cuando el usuario
    // inicia o cierra sesión en cualquier pestaña
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setEstado({ user: session.user, profile, cargando: false })
        } else {
          setEstado({ user: null, profile: null, cargando: false })
        }
      }
    )

    // 3. Limpia la suscripción cuando el componente se desmonta
    // Sin esto habría memory leaks
    return () => subscription.unsubscribe()
  }, [])

  return estado
}
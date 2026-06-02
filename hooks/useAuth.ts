// hooks/useAuth.ts
'use client'

import { useEffect, useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  cargando: boolean
}

export function useAuth(): AuthState {
  // ✅ useMemo evita recrear el cliente en cada render
  const supabase = useMemo(() => createClient(), [])

  const [estado, setEstado] = useState<AuthState>({
    user: null,
    profile: null,
    cargando: true,
  })

  useEffect(() => {
    async function obtenerSesion() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
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

    return () => subscription.unsubscribe()
  }, [supabase])

  return estado
}
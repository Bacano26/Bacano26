// app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Supabase redirige aquí después de verificar el email
// URL ejemplo: /api/auth/callback?code=xxxx
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'  // a dónde ir después

  if (code) {
    const supabase = await createClient()
    
    // Intercambia el código temporal por una sesión real
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sesión creada exitosamente → redirige al destino
      return NextResponse.redirect('${origin}${next}')
    }
  }

  // Si algo falla → redirige al login con error
  return NextResponse.redirect('${origin}/login?error=auth_callback_failed')
}
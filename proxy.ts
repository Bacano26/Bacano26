import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const rutasProtegidas = ['/historial', '/comprar']
  const rutasAdmin = ['/admin']
  const path = request.nextUrl.pathname

  if (rutasProtegidas.some(r => path.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (rutasAdmin.some(r => path.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

// ← SOLO UN config, con nueva-password incluido
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|nueva-password).*)'],
}
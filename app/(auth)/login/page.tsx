// app/(auth)/login/page.tsx
import FormLogin from '@/components/auth/FormLogin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión | Boletas App',
}

// Esta página es un Server Component (no necesita 'use client')
// Solo importa y muestra el formulario
export default function LoginPage() {
  return <FormLogin />
}
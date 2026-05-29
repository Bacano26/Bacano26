// app/(auth)/register/page.tsx
import FormRegister from '@/components/auth/FormRegister'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear cuenta | Boletas App',
}

export default function RegisterPage() {
  return <FormRegister />
}
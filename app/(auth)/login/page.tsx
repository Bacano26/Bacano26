import { Suspense } from 'react'
import FormLogin from '@/components/auth/FormLogin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión | Boletas App',
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded mt-6" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    }>
      <FormLogin />
    </Suspense>
  )
}
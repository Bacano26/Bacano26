// app/(auth)/layout.tsx
import Link from 'next/link'
import Image from 'next/image';

// Este layout solo aplica a /login y /register
// Los paréntesis en (auth) son un "Route Group" → NO afectan la URL
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      
      {/* Header simple con logo */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">         
          <Image src="/logo.svg" alt="Logo Bacano" width={28} height={28} className="h-7 w-7"/>
          <span className="font-semibold text-gray-900">Bacano</span>
        </Link>
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer simple */}
      <footer className="p-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Bacano.com
      </footer>
    </div>
  )
}
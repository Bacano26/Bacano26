// app/(main)/layout.tsx
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Boletas App</span>
            </div>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Boletas App</p>
            <div className="flex gap-4">
              <Link href="/eventos" className="text-xs text-gray-400 hover:text-gray-600">Eventos</Link>
              <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">Mi cuenta</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
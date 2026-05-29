// components/ui/Button.tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

// Define las variantes visuales del botón
type Variante = 'primary' | 'secondary' | 'ghost' | 'danger'
type Tamaño = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamaño?: Tamaño
  cargando?: boolean   // muestra spinner y desactiva el botón
}

// forwardRef permite que el botón reciba refs desde afuera (útil para forms)
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variante = 'primary', tamaño = 'md', cargando = false, 
     className, children, disabled, ...props }, ref) => {

    const estilosBase = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const estilosVariante: Record<Variante, string> = {
      primary:   'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
      ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
      danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }

    const estilosTamaño: Record<Tamaño, string> = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || cargando}
        className={cn(estilosBase, estilosVariante[variante], estilosTamaño[tamaño], className)}
        {...props}
      >
        {/* Spinner cuando está cargando */}
        {cargando && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
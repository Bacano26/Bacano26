// components/ui/Input.tsx
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string      // texto arriba del input
  error?: string      // mensaje de error abajo del input
  icono?: React.ReactNode  // ícono opcional a la izquierda
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icono, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Label arriba */}
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        {/* Contenedor del input + ícono */}
        <div className="relative">
          {icono && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icono}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-500',
              // Si hay error → borde rojo
              error && 'border-red-500 focus:ring-red-500',
              // Si hay ícono → padding izquierdo extra
              icono && 'pl-10',
              className
            )}
            {...props}
          />
        </div>

        {/* Mensaje de error abajo */}
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
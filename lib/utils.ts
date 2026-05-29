// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clases de Tailwind sin conflictos
// Ejemplo: cn('px-2 py-1', condition && 'bg-red-500')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea precio en pesos colombianos
export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio)
}

// Formatea fecha legible
export function formatFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(fecha))
}
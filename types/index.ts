export type Rol = 'usuario' | 'admin'
export type EstadoCompra = 'pendiente' | 'completado' | 'cancelado'

export interface Profile {
  id: string
  nombre: string
  email: string
  rol: Rol
  created_at: string
}

export interface Evento {
  id: string
  titulo: string
  descripcion: string | null
  fecha: string
  lugar: string
  imagen_url: string | null
  precio: number
  capacidad: number
  boletas_vendidas: number
  activo: boolean
  created_at: string
}

export interface Compra {
  id: string
  user_id: string
  evento_id: string
  cantidad: number
  total: number
  estado: EstadoCompra
  created_at: string
  evento?: Evento  // join opcional
}

export interface Boleta {
  id: string
  compra_id: string
  codigo: string
  usado: boolean
  created_at: string
}
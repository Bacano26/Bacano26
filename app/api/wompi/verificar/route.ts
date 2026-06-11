// app/api/wompi/verificar/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
 
const WOMPI_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'
 
function generarCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = 'BLT-'
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}
 
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('id')
 
  if (!transactionId) {
    return NextResponse.json({ error: 'ID de transacción requerido' }, { status: 400 })
  }
 
  try {
    // 1. Consulta la transacción a Wompi con tu llave privada
    const wompiRes = await fetch(`${WOMPI_BASE}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
    })
 
    if (!wompiRes.ok) throw new Error('No se pudo consultar Wompi')
 
    const { data: tx } = await wompiRes.json()
    const referencia: string = tx.reference
    const estadoTx: string = tx.status // APPROVED | DECLINED | VOIDED | ERROR | PENDING
 
    const supabase = await createClient()
 
    // 2. Si el pago fue aprobado, genera las boletas (solo una vez)
    if (estadoTx === 'APPROVED') {
      // Verifica si ya se procesó antes (idempotencia)
      const { data: compraExistente } = await supabase
        .from('compras')
        .select('id, cantidad, total, boletas(codigo)')
        .eq('referencia_wompi', referencia)
        .single()
 
      if (compraExistente) {
        // Ya se procesó, devuelve los datos guardados
        return buildRespuestaAprobada(supabase, compraExistente, referencia, tx)
      }
 
      // Busca la compra pendiente
      const { data: pendiente } = await supabase
        .from('compras_pendientes')
        .select('*')
        .eq('referencia', referencia)
        .single()
 
      if (!pendiente) {
        return NextResponse.json({ error: 'Compra pendiente no encontrada' }, { status: 404 })
      }
 
      // Crea la compra definitiva
      const { data: compra, error: errCompra } = await supabase
        .from('compras')
        .insert({
          user_id: pendiente.user_id,
          evento_id: pendiente.evento_id,
          cantidad: pendiente.cantidad,
          total: pendiente.total,
          estado: 'completado',
          referencia_wompi: referencia,
        })
        .select()
        .single()
 
      if (errCompra || !compra) throw new Error('Error creando la compra')
 
      // Genera las boletas según si hay secciones o no
      const seleccionJson: Array<{ seccion_id: string; cantidad: number }> | null =
        pendiente.seleccion_json
 
      const codigos: string[] = []
 
      if (seleccionJson && seleccionJson.length > 0) {
        // Con secciones
        const boletas = seleccionJson.flatMap(({ seccion_id, cantidad }) =>
          Array.from({ length: cantidad }, () => {
            const codigo = generarCodigo()
            codigos.push(codigo)
            return { compra_id: compra.id, codigo, usado: false, seccion_id }
          })
        )
 
        await Promise.all([
          supabase.from('boletas').insert(boletas),
          ...seleccionJson.map(({ seccion_id, cantidad }) =>
            supabase.rpc('incrementar_vendidas_seccion', {
              p_seccion_id: seccion_id,
              p_cantidad: cantidad,
            })
          ),
        ])
      } else {
        // Sin secciones
        const boletas = Array.from({ length: pendiente.cantidad }, () => {
          const codigo = generarCodigo()
          codigos.push(codigo)
          return { compra_id: compra.id, codigo, usado: false }
        })
 
        await Promise.all([
          supabase.from('boletas').insert(boletas),
          supabase.rpc('incrementar_boletas_vendidas', {
            p_evento_id: pendiente.evento_id,
            p_cantidad: pendiente.cantidad,
          }),
        ])
      }
 
      // Elimina la compra pendiente
      await supabase.from('compras_pendientes').delete().eq('referencia', referencia)
 
      // Obtén datos del evento y usuario para la respuesta
      const [{ data: evento }, { data: perfil }] = await Promise.all([
        supabase
          .from('eventos')
          .select('titulo, fecha, lugar, precio')
          .eq('id', pendiente.evento_id)
          .single(),
        supabase
          .from('profiles')
          .select('nombre, email')
          .eq('id', pendiente.user_id)
          .single(),
      ])
 
      return NextResponse.json({
        estado: 'APPROVED',
        referencia,
        totalPagado: pendiente.total,
        cantidadBoletas: pendiente.cantidad,
        codigos,
        evento: evento ?? {},
        usuario: perfil ?? {},
      })
    }
 
    // 3. Para otros estados, devuelve solo el estado
    return NextResponse.json({ estado: estadoTx, referencia })
  } catch (e: any) {
    console.error('[wompi/verificar]', e)
    return NextResponse.json({ error: e.message ?? 'Error interno' }, { status: 500 })
  }
}
 
// Utilidad para cuando ya fue procesada (idempotencia)
async function buildRespuestaAprobada(supabase: any, compra: any, referencia: string, tx: any) {
  const codigos = (compra.boletas ?? []).map((b: any) => b.codigo)
 
  const [{ data: evento }, { data: perfil }] = await Promise.all([
    supabase.from('eventos').select('titulo, fecha, lugar, precio').eq('id', tx.reference).single(),
    supabase.from('profiles').select('nombre, email').eq('id', compra.user_id).single(),
  ])
 
  return NextResponse.json({
    estado: 'APPROVED',
    referencia,
    totalPagado: compra.total,
    cantidadBoletas: compra.cantidad,
    codigos,
    evento: evento ?? {},
    usuario: perfil ?? {},
  })
}
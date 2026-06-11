// app/api/wompi/signature/route.ts
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
  try {
    const { reference, amount_in_cents, currency } = await req.json()
 
    if (!reference || !amount_in_cents || !currency) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }
 
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY
    if (!integrityKey) {
      return NextResponse.json({ error: 'Llave de integridad no configurada' }, { status: 500 })
    }
 
    // Wompi firma: reference + amount_in_cents + currency + integrity_key
    const cadena = `${reference}${amount_in_cents}${currency}${integrityKey}`
    const signature = createHash('sha256').update(cadena).digest('hex')
 
    return NextResponse.json({ signature })
  } catch {
    return NextResponse.json({ error: 'Error generando firma' }, { status: 500 })
  }
}
 
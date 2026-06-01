import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidatePath('/')
  revalidatePath('/eventos')
  revalidatePath('/admin/eventos')
  revalidatePath('/admin')
  return NextResponse.json({ revalidado: true })
}
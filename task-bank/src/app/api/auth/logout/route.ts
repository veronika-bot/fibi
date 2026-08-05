import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearSessionCookie(res)
  return applyCors(req, res)
}

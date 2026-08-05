import { NextRequest, NextResponse } from 'next/server'

function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

export function applyCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin')
  if (origin && allowedOrigins().includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Vary', 'Origin')
  }
  return res
}

/** Handles a CORS preflight request. Call from an `OPTIONS` export in routes callable cross-origin. */
export function corsPreflight(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  applyCors(req, res)
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

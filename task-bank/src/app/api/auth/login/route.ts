import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signSession, setSessionCookie } from '@/lib/session'
import { rateLimit } from '@/lib/redis'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

const INVALID = { error: { form: ['Неверный email или пароль'] } }

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const body   = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) {
    return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
  }
  const { email, password } = parsed.data

  const allowed = await rateLimit(`login:${ip}:${email}`, 10, 60 * 10)
  if (!allowed) {
    return applyCors(req, NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 }))
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return applyCors(req, NextResponse.json(INVALID, { status: 401 }))
  }

  const token = await signSession({ userId: user.id, role: user.role })
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  })
  setSessionCookie(res, token)
  return applyCors(req, res)
}

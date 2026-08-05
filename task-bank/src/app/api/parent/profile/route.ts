import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  fullName: z.string().min(2).optional(),
  phone:    z.string().optional(),
  avatar:   z.string().optional(),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])
    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    const user = await db.user.update({
      where: { id: session.userId },
      data: parsed.data,
      select: { fullName: true, phone: true, avatar: true, email: true },
    })

    return applyCors(req, NextResponse.json({ user }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT'])
    const profile = await db.studentProfile.findUnique({ where: { userId: session.userId } })
    if (!profile) return applyCors(req, NextResponse.json({ error: 'Профиль ученика не найден' }, { status: 404 }))
    return applyCors(req, NextResponse.json({ code: profile.linkCode, updatedAt: profile.linkCodeUpdatedAt }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

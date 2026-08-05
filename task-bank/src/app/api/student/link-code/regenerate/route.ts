import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { generateLinkCode } from '@/lib/linkCode'
import { rateLimit } from '@/lib/redis'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT'])

    const allowed = await rateLimit(`link-code-regen:${session.userId}`, 5, 60 * 60)
    if (!allowed) {
      return applyCors(req, NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 }))
    }

    let code = generateLinkCode()
    for (let i = 0; i < 10; i++) {
      const exists = await db.studentProfile.findUnique({ where: { linkCode: code } })
      if (!exists) break
      code = generateLinkCode()
    }

    const profile = await db.studentProfile.update({
      where: { userId: session.userId },
      data: { linkCode: code, linkCodeUpdatedAt: new Date() },
    })
    return applyCors(req, NextResponse.json({ code: profile.linkCode }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

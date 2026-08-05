import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req)
    const userId  = session.userId

    const payments = await db.payment.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    50,
      select: {
        id:          true,
        amount:      true,
        status:      true,
        type:        true,
        description: true,
        createdAt:   true,
      },
    })

    const subscription = await db.subscription.findFirst({
      where:   { userId, status: 'ACTIVE' },
      orderBy: { expiresAt: 'desc' },
    })

    return applyCors(req, NextResponse.json({ payments, subscription }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

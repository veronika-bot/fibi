import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createPayment } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])

    const [parent, payments] = await Promise.all([
      db.parentProfile.findUnique({
        where:  { userId: session.userId },
        select: { balanceKopecks: true },
      }),
      db.payment.findMany({
        where:   { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take:    50,
        select:  { id: true, amount: true, type: true, description: true, status: true, createdAt: true },
      }),
    ])

    if (!parent) return applyCors(req, NextResponse.json({ error: 'Не найдено' }, { status: 404 }))

    return applyCors(req, NextResponse.json({
      balanceKopecks: parent.balanceKopecks,
      balanceRub:     (parent.balanceKopecks / 100).toFixed(0),
      payments,
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

// POST — top up parent balance via YooKassa
const Body = z.object({
  amountRub: z.number().int().min(100).max(50000),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])

    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    const { amountRub } = parsed.data
    const amountKopecks = amountRub * 100
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const payment = await db.payment.create({
      data: {
        userId:      session.userId,
        amount:      amountKopecks,
        type:        'SUBSCRIPTION',
        status:      'PENDING',
        description: 'Пополнение баланса ФИБИ',
        metadata:    JSON.stringify({ topUp: true, parentId: session.userId }),
      },
    })

    const yk = await createPayment({
      amountKopecks,
      description: 'Пополнение баланса ФИБИ',
      returnUrl:   `${appUrl}/parent/payment/result?paymentId=${payment.id}`,
      metadata:    { paymentId: payment.id, parentId: session.userId, topUp: 'true' },
    })

    await db.payment.update({
      where: { id: payment.id },
      data:  { yookassaId: yk.id, confirmUrl: yk.confirmation?.confirmation_url },
    })

    return applyCors(req, NextResponse.json({ paymentId: payment.id, confirmUrl: yk.confirmation?.confirmation_url }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

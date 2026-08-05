import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createPayment } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const PLANS = {
  SELF_STUDY: { priceKopecks: 67900, label: 'Самостоятельная подготовка' },
} as const

const Body = z.object({
  plan: z.enum(['SELF_STUDY']),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT'])
    const userId  = session.userId

    const body = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))
    }

    const { plan } = parsed.data
    const planInfo = PLANS[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const payment = await db.payment.create({
      data: {
        userId,
        amount: planInfo.priceKopecks,
        type: 'SUBSCRIPTION',
        status: 'PENDING',
        description: planInfo.label,
        metadata: JSON.stringify({ plan }),
      },
    })

    const yk = await createPayment({
      amountKopecks: planInfo.priceKopecks,
      description: `ФИБИ — ${planInfo.label}`,
      returnUrl: `${appUrl}/payment/result?paymentId=${payment.id}`,
      metadata: { paymentId: payment.id, userId, plan },
      capture: true,
    })

    await db.payment.update({
      where: { id: payment.id },
      data: { yookassaId: yk.id, confirmUrl: yk.confirmation?.confirmation_url },
    })

    return applyCors(req, NextResponse.json({
      paymentId: payment.id,
      confirmUrl: yk.confirmation?.confirmation_url,
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

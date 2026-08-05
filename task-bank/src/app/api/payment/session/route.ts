/**
 * Creates a lesson payment session.
 * Student pays the full amount → ФИБИ holds it → after lesson confirmation,
 * ФИБИ credits tutor's balance minus commission.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createPayment, COMMISSION } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  tutorId:     z.string().min(1),
  amountRub:   z.number().int().min(100).max(50000), // ₽
  lessonId:    z.string().min(1),
  description: z.string().optional(),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session   = await requireUser(req, ['STUDENT'])
    const studentId = session.userId

    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))
    }

    const { tutorId, amountRub, lessonId, description } = parsed.data

    const tutor = await db.user.findUnique({ where: { id: tutorId }, select: { role: true } })
    if (!tutor || tutor.role !== 'TUTOR') {
      return applyCors(req, NextResponse.json({ error: 'Репетитор не найден' }, { status: 404 }))
    }

    const amountKopecks = amountRub * 100
    const fee           = Math.round(amountKopecks * COMMISSION)
    const tutorShare    = amountKopecks - fee
    const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const payment = await db.payment.create({
      data: {
        userId:      studentId,
        tutorId,
        amount:      amountKopecks,
        type:        'LESSON',
        status:      'PENDING',
        description: description ?? 'Занятие с репетитором',
        metadata:    JSON.stringify({ lessonId, fee, tutorShare }),
      },
    })

    const yk = await createPayment({
      amountKopecks,
      description: `ФИБИ — занятие с репетитором`,
      returnUrl:   `${appUrl}/payment/result?paymentId=${payment.id}`,
      metadata:    { paymentId: payment.id, studentId, tutorId, lessonId },
      capture:     false, // two-step: hold money, release after lesson confirmation
    })

    await db.payment.update({
      where: { id: payment.id },
      data:  { yookassaId: yk.id, confirmUrl: yk.confirmation?.confirmation_url },
    })

    return applyCors(req, NextResponse.json({
      paymentId:  payment.id,
      confirmUrl: yk.confirmation?.confirmation_url,
      breakdown: {
        total:      amountKopecks,
        fee,
        tutorShare,
        commission: `${(COMMISSION * 100).toFixed(0)}%`,
      },
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

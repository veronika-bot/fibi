/**
 * Confirms that a lesson took place.
 *
 * Flow:
 *   1. Lesson ends
 *   2. Either student or tutor calls this endpoint
 *   3. We find the PENDING LESSON payment for this lesson
 *   4. Move funds from tutor's pendingBalance → available
 *   5. Record PAYOUT transaction
 *   6. (Production) Optionally capture the YooKassa payment if two-step was used
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { capturePayment, splitPayment } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  lessonId: z.string().min(1),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT', 'TUTOR', 'ADMIN'])

    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))
    }

    const { lessonId } = parsed.data

    const payment = await db.payment.findFirst({
      where: {
        type:   'LESSON',
        status: 'SUCCEEDED',
        metadata: { contains: lessonId },
      },
    })

    if (!payment) {
      return applyCors(req, NextResponse.json({ error: 'Платёж для этого занятия не найден' }, { status: 404 }))
    }
    if (!payment.tutorId) {
      return applyCors(req, NextResponse.json({ error: 'У платежа нет привязанного репетитора' }, { status: 400 }))
    }
    if (session.role !== 'ADMIN' && session.userId !== payment.userId && session.userId !== payment.tutorId) {
      return applyCors(req, NextResponse.json({ error: 'Нет доступа к этому занятию' }, { status: 403 }))
    }

    const { tutorShare } = splitPayment(payment.amount)

    await db.$transaction(async tx => {
      await tx.tutorBalance.upsert({
        where:  { tutorId: payment.tutorId! },
        create: {
          tutorId:     payment.tutorId!,
          available:   tutorShare,
          pending:     0,
          totalEarned: tutorShare,
        },
        update: {
          available:   { increment: tutorShare },
          pending:     { decrement: tutorShare },
          totalEarned: { increment: tutorShare },
          updatedAt:   new Date(),
        },
      })

      await tx.transaction.updateMany({
        where: { paymentId: payment.id, type: 'TUTOR_CREDIT', status: 'PENDING' },
        data:  { status: 'COMPLETED', note: 'Занятие подтверждено' },
      })
    })

    if (payment.yookassaId) {
      await capturePayment(payment.yookassaId, payment.amount).catch(e =>
        console.error('YooKassa capture error:', e)
      )
    }

    return applyCors(req, NextResponse.json({
      ok:      true,
      tutorShare,
      message: 'Занятие подтверждено. Средства зачислены на баланс репетитора.',
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

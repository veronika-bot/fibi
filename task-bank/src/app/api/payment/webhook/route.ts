/**
 * YooKassa webhook handler.
 *
 * Register this URL in YooKassa dashboard:
 *   https://yookassa.ru/my/shop-settings/http-notifications
 *
 * YooKassa sends a POST with JSON body (no HMAC signature by default —
 * we verify by re-fetching the payment directly from YooKassa API).
 *
 * Events handled:
 *   payment.succeeded  → activate subscription / hold lesson funds
 *   payment.canceled   → mark payment cancelled
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPayment, splitPayment } from '@/lib/yookassa'

export async function POST(req: NextRequest) {
  let event: { event: string; object: { id: string } }
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const ykId = event?.object?.id
  if (!ykId) return NextResponse.json({ ok: true })

  // Re-fetch from YooKassa to prevent spoofing
  const yk = await getPayment(ykId).catch(() => null)
  if (!yk) return NextResponse.json({ ok: true })

  const payment = await db.payment.findFirst({ where: { yookassaId: ykId } })
  if (!payment) return NextResponse.json({ ok: true })

  if (yk.status === 'succeeded' && payment.status !== 'SUCCEEDED') {
    await handleSucceeded(payment)
  } else if (yk.status === 'canceled' && payment.status === 'PENDING') {
    await db.payment.update({
      where: { id: payment.id },
      data:  { status: 'CANCELLED', updatedAt: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}

async function handleSucceeded(payment: {
  id: string; type: string; userId: string; tutorId: string | null;
  amount: number; metadata: string
}) {
  const meta = JSON.parse(payment.metadata || '{}')

  await db.$transaction(async tx => {
    // 1. Mark payment succeeded
    await tx.payment.update({
      where: { id: payment.id },
      data:  { status: 'SUCCEEDED', updatedAt: new Date() },
    })

    if (payment.type === 'SUBSCRIPTION') {
      // 2a. Activate / extend subscription
      const plan = meta.plan ?? 'SELF_STUDY'
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days

      await tx.subscription.upsert({
        where:  { id: `sub_${payment.userId}` },
        create: { id: `sub_${payment.userId}`, userId: payment.userId, plan, status: 'ACTIVE', expiresAt },
        update: { plan, status: 'ACTIVE', expiresAt, updatedAt: new Date() },
      })

      // Record charge transaction
      await tx.transaction.create({
        data: { paymentId: payment.id, type: 'CHARGE', amount: payment.amount },
      })
    }

    if (payment.type === 'LESSON' && payment.tutorId) {
      // 2b. Hold funds — add to tutor's pendingBalance (not available yet)
      const { fee, tutorShare } = splitPayment(payment.amount)

      await tx.tutorBalance.upsert({
        where:  { tutorId: payment.tutorId },
        create: { tutorId: payment.tutorId, pending: tutorShare, totalEarned: 0 },
        update: { pending: { increment: tutorShare }, updatedAt: new Date() },
      })

      await tx.transaction.createMany({
        data: [
          { paymentId: payment.id, type: 'CHARGE',         amount: payment.amount },
          { paymentId: payment.id, type: 'PLATFORM_FEE',   amount: fee },
          { paymentId: payment.id, type: 'TUTOR_CREDIT',   amount: tutorShare, status: 'PENDING', note: 'Ожидает подтверждения занятия' },
        ],
      })
    }
  })
}

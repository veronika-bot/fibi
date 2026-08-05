/**
 * Tutor withdrawal request.
 *
 * In production: triggers a real YooKassa payout to the tutor's saved card.
 * For MVP: creates a Payout record in PENDING status — the admin confirms and
 * manually initiates the YooKassa payout (or you can connect auto-payouts later).
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { formatRub } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { rateLimit } from '@/lib/redis'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  amountRub: z.number().int().min(100),   // minimum 100₽
  bankCard:  z.string().optional(),        // masked card hint for display
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const tutorId = session.userId

    const allowed = await rateLimit(`withdraw:${tutorId}`, 5, 60 * 10)
    if (!allowed) {
      return applyCors(req, NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 }))
    }

    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))
    }

    const { amountRub, bankCard } = parsed.data
    const amountKopecks = amountRub * 100

    const balance = await db.tutorBalance.findUnique({ where: { tutorId } })
    if (!balance || balance.available < amountKopecks) {
      return applyCors(req, NextResponse.json(
        { error: `Недостаточно средств. Доступно: ${formatRub(balance?.available ?? 0)}` },
        { status: 422 }
      ))
    }

    const payout = await db.$transaction(async tx => {
      await tx.tutorBalance.update({
        where: { tutorId },
        data:  { available: { decrement: amountKopecks }, updatedAt: new Date() },
      })
      return tx.payout.create({
        data: { tutorId, amount: amountKopecks, bankCard, status: 'PENDING' },
      })
    })

    return applyCors(req, NextResponse.json({
      payoutId:  payout.id,
      amount:    payout.amount,
      amountRub: formatRub(payout.amount),
      status:    payout.status,
      message:   'Заявка на выплату создана. Средства поступят в течение 24 часов.',
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const tutorId = session.userId

    const payouts = await db.payout.findMany({
      where:   { tutorId },
      orderBy: { createdAt: 'desc' },
      take:    30,
    })

    return applyCors(req, NextResponse.json({
      payouts: payouts.map(p => ({
        id:         p.id,
        amount:     p.amount,
        amountRub:  formatRub(p.amount),
        status:     p.status,
        bankCard:   p.bankCard,
        failReason: p.failReason,
        date:       p.createdAt,
      })),
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

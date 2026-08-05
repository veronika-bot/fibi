import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatRub } from '@/lib/yookassa'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const tutorId = session.userId

    const balance = await db.tutorBalance.findUnique({ where: { tutorId } })

    const recent = await db.transaction.findMany({
      where: {
        payment: { tutorId },
        type:    { in: ['TUTOR_CREDIT', 'PAYOUT'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { payment: { select: { createdAt: true, description: true } } },
    })

    return applyCors(req, NextResponse.json({
      available:    balance?.available    ?? 0,
      pending:      balance?.pending      ?? 0,
      totalEarned:  balance?.totalEarned  ?? 0,
      availableRub: formatRub(balance?.available   ?? 0),
      pendingRub:   formatRub(balance?.pending      ?? 0),
      totalRub:     formatRub(balance?.totalEarned  ?? 0),
      recentTransactions: recent.map(t => ({
        id:     t.id,
        type:   t.type,
        amount: t.amount,
        amountRub: formatRub(t.amount),
        status: t.status,
        note:   t.note,
        date:   t.createdAt,
      })),
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

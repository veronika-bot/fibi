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
    const page    = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'))
    const limit   = 20

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where:   { payment: { tutorId } },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
        include: { payment: { select: { description: true, createdAt: true, userId: true } } },
      }),
      db.transaction.count({ where: { payment: { tutorId } } }),
    ])

    return applyCors(req, NextResponse.json({
      transactions: transactions.map(t => ({
        id:        t.id,
        type:      t.type,
        amount:    t.amount,
        amountRub: formatRub(t.amount),
        status:    t.status,
        note:      t.note,
        date:      t.createdAt,
        label:     t.payment?.description ?? '—',
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

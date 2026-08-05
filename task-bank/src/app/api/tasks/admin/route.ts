import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req, ['ADMIN'])
    const status = req.nextUrl.searchParams.get('status') ?? 'PENDING'

    const [tasks, counts] = await Promise.all([
      db.task.findMany({
        where: { verificationStatus: status },
        include: { topics: { include: { topic: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.task.groupBy({
        by: ['verificationStatus'],
        _count: { id: true },
      }),
    ])

    const countMap: Record<string, number> = {}
    counts.forEach(c => { countMap[c.verificationStatus] = c._count.id })

    return NextResponse.json({ tasks, counts: countMap })
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

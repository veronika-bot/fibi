import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const errors = await db.userProgress.findMany({
    where: { userId, status: 'SOLVED_WRONG' },
    include: {
      task: {
        include: { topics: { include: { topic: { select: { name: true } } } } },
      },
    },
    orderBy: { lastAttemptAt: 'desc' },
  })

  return NextResponse.json(errors)
}

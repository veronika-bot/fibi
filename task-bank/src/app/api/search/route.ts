import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q          = req.nextUrl.searchParams.get('q') ?? ''
  const examType   = req.nextUrl.searchParams.get('examType') ?? undefined
  const difficulty = req.nextUrl.searchParams.get('difficulty') ? Number(req.nextUrl.searchParams.get('difficulty')) : undefined
  const topicId    = req.nextUrl.searchParams.get('topicId') ?? undefined

  if (!q.trim()) {
    return NextResponse.json({ hits: [], estimatedTotalHits: 0, query: '' })
  }

  // Try MeiliSearch first if configured
  if (process.env.MEILISEARCH_HOST) {
    try {
      const { searchTasks } = await import('@/lib/search')
      const result = await searchTasks(q, { examType, difficulty, topicId })
      return NextResponse.json(result)
    } catch {}
  }

  // SQLite fallback
  const tasks = await db.task.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      description: { contains: q },
      ...(examType   && { examType }),
      ...(difficulty && { difficulty }),
      ...(topicId    && { topics: { some: { topicId } } }),
    },
    take: 30,
    include: { topics: { include: { topic: { select: { name: true } } } } },
    orderBy: { taskNumber: 'asc' },
  })

  return NextResponse.json({ hits: tasks, estimatedTotalHits: tasks.length, query: q, fallback: true })
}

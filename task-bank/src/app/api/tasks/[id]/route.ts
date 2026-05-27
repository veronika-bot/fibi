import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const task = await db.task.findUnique({
    where: { id: params.id },
    include: {
      topics: { include: { topic: { select: { id: true, name: true, slug: true } } } },
    },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ...task, relationsFrom: [] })
}

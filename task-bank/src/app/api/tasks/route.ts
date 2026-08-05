import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cached } from '@/lib/redis'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { z } from 'zod'

const FilterSchema = z.object({
  examType:   z.enum(['OGE', 'EGE_BASE', 'EGE_PROFILE']).optional(),
  part:       z.coerce.number().int().min(1).max(2).optional(),
  difficulty: z.coerce.number().int().min(1).max(3).optional(),
  topicId:    z.string().optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(50).default(24),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = FilterSchema.safeParse(params)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { examType, part, difficulty, topicId, page, limit } = parsed.data
  const cacheKey = `tasks:list:${JSON.stringify(parsed.data)}`

  const result = await cached(cacheKey, 120, async () => {
    const where = {
      verificationStatus: 'VERIFIED',
      ...(examType   && { examType }),
      ...(part       && { part }),
      ...(difficulty && { difficulty }),
      ...(topicId    && { topics: { some: { topicId } } }),
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          topics: {
            include: { topic: { select: { id: true, name: true, slug: true } } },
          },
        },
        orderBy: [{ taskNumber: 'asc' }, { difficulty: 'asc' }],
      }),
      db.task.count({ where }),
    ])

    return { tasks, total, pages: Math.ceil(total / limit), page }
  })

  return NextResponse.json(result)
}

const CreateSchema = z.object({
  examType:        z.enum(['OGE', 'EGE_BASE', 'EGE_PROFILE']),
  part:            z.number().int().min(1).max(2),
  taskNumber:      z.number().int().min(1),
  description:     z.string().min(1),
  answer:          z.string().optional(),
  hint1:           z.string().optional(),
  hint2:           z.string().optional(),
  partialSolution: z.string().optional(),
  fullSolution:    z.array(z.object({ step: z.string(), detail: z.string() })).default([]),
  difficulty:      z.number().int().min(1).max(3),
  topicIds:        z.array(z.string()),
  tags:            z.array(z.string()).default([]),
  source:          z.enum(['FIPI', 'PLATFORM', 'TUTOR']).default('PLATFORM'),
})

export async function POST(req: NextRequest) {
  try {
    await requireUser(req, ['TUTOR', 'ADMIN'])
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { topicIds, fullSolution, tags, ...data } = parsed.data
    const task = await db.task.create({
      data: {
        ...data,
        fullSolution: JSON.stringify(fullSolution),
        tags:         JSON.stringify(tags),
        verificationStatus: 'PENDING',
        topics: { create: topicIds.map(topicId => ({ topicId })) },
      },
      include: { topics: { include: { topic: true } } },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

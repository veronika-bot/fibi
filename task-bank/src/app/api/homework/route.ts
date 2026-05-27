import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const CreateSchema = z.object({
  tutorId:   z.string().min(1),
  studentId: z.string().min(1),
  title:     z.string().min(1),
  description: z.string().optional(),
  dueDate:   z.string().datetime().optional(),
  tasks:     z.array(z.object({ taskId: z.string(), comment: z.string().optional(), order: z.number().int().optional() })).min(1),
})

export async function GET(req: NextRequest) {
  const tutorId   = req.nextUrl.searchParams.get('tutorId')
  const studentId = req.nextUrl.searchParams.get('studentId')
  const status    = req.nextUrl.searchParams.get('status')

  const homework = await db.homework.findMany({
    where: { ...(tutorId && { tutorId }), ...(studentId && { studentId }), ...(status && { status: status as any }) },
    include: { tasks: { include: { task: { select: { id: true, taskNumber: true, description: true, difficulty: true, topics: { include: { topic: true } } } } }, orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(homework)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { tasks, dueDate, ...data } = parsed.data
  const homework = await db.homework.create({
    data: {
      ...data,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      tasks: { create: tasks.map((t, i) => ({ taskId: t.taskId, comment: t.comment, order: t.order ?? i })) },
    },
    include: { tasks: { include: { task: true } } },
  })

  return NextResponse.json(homework, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const updated = await db.homework.update({ where: { id }, data: { status } })
  return NextResponse.json(updated)
}

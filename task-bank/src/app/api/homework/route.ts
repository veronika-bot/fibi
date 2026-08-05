import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const CreateSchema = z.object({
  studentId:   z.string().min(1),
  title:       z.string().min(1),
  description: z.string().optional(),
  dueDate:     z.string().datetime().optional(),
  tasks:       z.array(z.object({ taskId: z.string(), comment: z.string().optional(), order: z.number().int().optional() })).min(1),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR', 'STUDENT'])
    const status  = req.nextUrl.searchParams.get('status')

    const where =
      session.role === 'TUTOR'
        ? { tutorId: session.userId }
        : { studentId: session.userId }

    const homework = await db.homework.findMany({
      where: { ...where, ...(status && { status }) },
      include: {
        student: { select: { fullName: true } },
        tasks: { include: { task: { select: { id: true, taskNumber: true, description: true, difficulty: true, topics: { include: { topic: true } } } } }, orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return applyCors(req, NextResponse.json(homework))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))

    const { tasks, dueDate, studentId, ...data } = parsed.data

    const roster = await db.tutorStudentLink.findUnique({
      where: { tutorId_studentId: { tutorId: session.userId, studentId } },
    })
    if (!roster) {
      return applyCors(req, NextResponse.json({ error: 'Этот ученик не в вашем списке' }, { status: 403 }))
    }

    const homework = await db.homework.create({
      data: {
        ...data,
        tutorId: session.userId,
        studentId,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        tasks: { create: tasks.map((t, i) => ({ taskId: t.taskId, comment: t.comment, order: t.order ?? i })) },
      },
      include: { tasks: { include: { task: true } } },
    })

    return applyCors(req, NextResponse.json(homework, { status: 201 }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR', 'STUDENT'])
    const { id, status } = await req.json()
    if (!id || !status) return applyCors(req, NextResponse.json({ error: 'id and status required' }, { status: 400 }))

    const homework = await db.homework.findUnique({ where: { id } })
    if (!homework) return applyCors(req, NextResponse.json({ error: 'Не найдено' }, { status: 404 }))
    if (homework.tutorId !== session.userId && homework.studentId !== session.userId) {
      return applyCors(req, NextResponse.json({ error: 'Нет доступа' }, { status: 403 }))
    }

    const updated = await db.homework.update({ where: { id }, data: { status } })
    return applyCors(req, NextResponse.json(updated))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session   = await requireUser(req, ['PARENT'])
    const studentId = req.nextUrl.searchParams.get('studentId')
    if (!studentId) {
      return applyCors(req, NextResponse.json({ error: 'studentId required' }, { status: 400 }))
    }

    const link = await db.parentStudentLink.findUnique({
      where: { parentId_studentId: { parentId: session.userId, studentId } },
    })
    if (!link) return applyCors(req, NextResponse.json({ error: 'Нет доступа' }, { status: 403 }))

    const homework = await db.homework.findMany({
      where:   { studentId },
      orderBy: { dueDate: 'asc' },
      include: { tasks: { include: { task: { select: { taskNumber: true, description: true } } } } },
    })

    const now = new Date()
    const result = homework.map(hw => {
      const isOverdue  = hw.dueDate ? hw.dueDate < now && hw.status !== 'COMPLETED' : false
      const totalTasks = hw.tasks.length
      return {
        id:          hw.id,
        title:       hw.title,
        description: hw.description,
        tutorId:     hw.tutorId,
        status:      isOverdue ? 'OVERDUE' : hw.status,
        dueDate:     hw.dueDate,
        createdAt:   hw.createdAt,
        totalTasks,
      }
    })

    const stats = {
      total:     result.length,
      completed: result.filter(h => h.status === 'COMPLETED').length,
      overdue:   result.filter(h => h.status === 'OVERDUE').length,
      active:    result.filter(h => h.status === 'ACTIVE').length,
    }

    return applyCors(req, NextResponse.json({ homework: result, stats }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

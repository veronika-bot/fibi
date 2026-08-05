import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT', 'TUTOR'])
    let userId = session.userId

    if (session.role === 'TUTOR') {
      const studentId = req.nextUrl.searchParams.get('studentId')
      if (!studentId) return applyCors(req, NextResponse.json({ error: 'studentId required' }, { status: 400 }))
      const roster = await db.tutorStudentLink.findUnique({
        where: { tutorId_studentId: { tutorId: session.userId, studentId } },
      })
      if (!roster) return applyCors(req, NextResponse.json({ error: 'Нет доступа' }, { status: 403 }))
      userId = studentId
    }

    const errors = await db.userProgress.findMany({
      where: { userId, status: 'SOLVED_WRONG' },
      include: {
        task: {
          include: { topics: { include: { topic: { select: { name: true } } } } },
        },
      },
      orderBy: { lastAttemptAt: 'desc' },
    })

    return applyCors(req, NextResponse.json(errors))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

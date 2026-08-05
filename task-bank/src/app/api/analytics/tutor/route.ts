import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTutorAnalytics } from '@/lib/analytics'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session   = await requireUser(req, ['TUTOR'])
    const studentId = req.nextUrl.searchParams.get('studentId')
    if (!studentId) {
      return applyCors(req, NextResponse.json({ error: 'studentId required' }, { status: 400 }))
    }

    const roster = await db.tutorStudentLink.findUnique({
      where: { tutorId_studentId: { tutorId: session.userId, studentId } },
    })
    if (!roster) return applyCors(req, NextResponse.json({ error: 'Нет доступа' }, { status: 403 }))

    const data = await getTutorAnalytics(session.userId, studentId)
    return applyCors(req, NextResponse.json(data))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

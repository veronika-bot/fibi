import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'
import { getUserAnalytics } from '@/lib/analytics'

const EXAM_LABEL: Record<string, string> = {
  OGE: 'ОГЭ',
  EGE_BASE: 'ЕГЭ база',
  EGE_PROFILE: 'ЕГЭ профиль',
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const tutorId = session.userId

    const roster = await db.tutorStudentLink.findMany({
      where:   { tutorId, status: 'ACTIVE' },
      include: { student: { include: { studentProfile: true, streak: true } } },
    })

    const students = await Promise.all(roster.map(async (link) => {
      const student = link.student
      const [analytics, hwPending, hwDone] = await Promise.all([
        getUserAnalytics(student.id),
        db.homework.count({ where: { tutorId, studentId: student.id, status: 'ACTIVE' } }),
        db.homework.count({ where: { tutorId, studentId: student.id, status: 'COMPLETED' } }),
      ])

      return {
        id:         student.id,
        name:       student.fullName,
        avatar:     student.avatar ?? '',
        exam:       EXAM_LABEL[student.studentProfile?.examType ?? ''] ?? '—',
        score:      analytics.overallAccuracy,
        streak:     analytics.currentStreak,
        weakTopics: analytics.weakTopics.map(t => t.topicName),
        hwPending,
        hwDone,
        lastActive: student.streak?.lastActiveAt ?? null,
        notes:      link.notes ?? '',
      }
    }))

    return applyCors(req, NextResponse.json({ students }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

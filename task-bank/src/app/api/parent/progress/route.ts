import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

async function assertAccess(parentId: string, studentId: string) {
  const link = await db.parentStudentLink.findUnique({
    where: { parentId_studentId: { parentId, studentId } },
  })
  return !!link
}

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

    if (!(await assertAccess(session.userId, studentId))) {
      return applyCors(req, NextResponse.json({ error: 'Нет доступа к данному ученику' }, { status: 403 }))
    }

    const [progress, streak, attempts] = await Promise.all([
      db.userProgress.findMany({
        where:   { userId: studentId },
        include: { task: { select: { taskNumber: true, examType: true, part: true } } },
        orderBy: { lastAttemptAt: 'desc' },
      }),
      db.userStreak.findUnique({ where: { userId: studentId } }),
      db.attempt.findMany({
        where:   { userId: studentId },
        orderBy: { createdAt: 'desc' },
        take:    200,
      }),
    ])

    const byNumber: Record<number, { solved: number; total: number; pct: number }> = {}
    for (const p of progress) {
      const n = p.task.taskNumber
      if (!byNumber[n]) byNumber[n] = { solved: 0, total: 0, pct: 0 }
      byNumber[n].total++
      if (p.status === 'SOLVED') byNumber[n].solved++
    }
    for (const n of Object.keys(byNumber)) {
      const b = byNumber[+n]
      b.pct = b.total > 0 ? Math.round((b.solved / b.total) * 100) : 0
    }

    const totalSolved = progress.filter(p => p.status === 'SOLVED').length
    const correctRate = attempts.length
      ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100)
      : 0

    return applyCors(req, NextResponse.json({
      studentId,
      totalSolved,
      totalTasks: progress.length,
      readinessPercent: progress.length > 0 ? Math.round((totalSolved / progress.length) * 100) : 0,
      correctRate,
      streak: { current: streak?.current ?? 0, best: streak?.best ?? 0 },
      byTaskNumber: byNumber,
      recentAttempts: attempts.slice(0, 30).map(a => ({
        taskId:    a.taskId,
        isCorrect: a.isCorrect,
        date:      a.createdAt,
      })),
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

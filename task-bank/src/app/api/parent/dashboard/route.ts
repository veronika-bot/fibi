/**
 * Parent main dashboard: aggregates child progress, subscription, balance,
 * active tutors, and recent payments in one request.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])
    const parentId = session.userId

    const parent = await db.user.findUnique({
      where:   { id: parentId },
      include: { parentProfile: true, parentLinks: true },
    })
    if (!parent || !parent.parentProfile) {
      return applyCors(req, NextResponse.json({ error: 'Родитель не найден' }, { status: 404 }))
    }

    const studentIds = parent.parentLinks.map(l => l.studentId)

    const students = await Promise.all(studentIds.map(async studentId => {
      const [studentUser, subscription, streak, progress, homework] = await Promise.all([
        db.user.findUnique({ where: { id: studentId }, select: { fullName: true } }),
        db.subscription.findFirst({
          where:   { userId: studentId, status: 'ACTIVE' },
          orderBy: { expiresAt: 'desc' },
        }),
        db.userStreak.findUnique({ where: { userId: studentId } }),
        db.userProgress.findMany({
          where:   { userId: studentId },
          include: { task: { select: { taskNumber: true, examType: true } } },
          take:    200,
        }),
        db.homework.findMany({
          where:   { studentId, status: 'ACTIVE' },
          orderBy: { dueDate: 'asc' },
          take:    5,
        }),
      ])

      const solved   = progress.filter(p => p.status === 'SOLVED').length
      const total    = progress.length
      const pct      = total > 0 ? Math.round((solved / total) * 100) : 0
      const daysLeft = subscription?.expiresAt
        ? Math.max(0, Math.round((subscription.expiresAt.getTime() - Date.now()) / 86_400_000))
        : null

      return {
        studentId,
        fullName:       studentUser?.fullName ?? null,
        subscription:   subscription ? { plan: subscription.plan, expiresAt: subscription.expiresAt, daysLeft } : null,
        readinessPercent: pct,
        totalSolved:    solved,
        streak:         streak?.current ?? 0,
        homeworkPending: homework.length,
      }
    }))

    const recentPayments = await db.payment.findMany({
      where:   { userId: { in: [parentId, ...studentIds] }, status: 'SUCCEEDED' },
      orderBy: { createdAt: 'desc' },
      take:    5,
      select:  { id: true, amount: true, type: true, description: true, createdAt: true },
    })

    return applyCors(req, NextResponse.json({
      parent: {
        id:       parent.id,
        fullName: parent.fullName,
        email:    parent.email,
        balance:  parent.parentProfile.balanceKopecks,
      },
      students,
      recentPayments,
    }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

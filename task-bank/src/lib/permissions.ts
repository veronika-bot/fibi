import { db } from './db'

export async function hasActiveHomework(userId: string): Promise<boolean> {
  const hw = await db.homework.findFirst({ where: { studentId: userId, status: 'ACTIVE' } })
  return !!hw
}

export async function canViewSolution(userId: string, taskId: string): Promise<boolean> {
  const [activeHw, progress] = await Promise.all([
    hasActiveHomework(userId),
    db.userProgress.findUnique({ where: { userId_taskId: { userId, taskId } } }),
  ])

  if (activeHw) return false
  if (!progress) return false
  return progress.attempts >= 3 || progress.status === 'SOLVED_CORRECT'
}

export async function getAttemptCount(userId: string, taskId: string): Promise<number> {
  const p = await db.userProgress.findUnique({ where: { userId_taskId: { userId, taskId } } })
  return p?.attempts ?? 0
}

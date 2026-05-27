import { db } from './db'
import { getUserAnalytics } from './analytics'

const XP_TABLE = { 1: 10, 2: 20, 3: 40 } as const

export function calcXP(difficulty: number, attemptNum: number): number {
  const base = XP_TABLE[difficulty as 1 | 2 | 3] ?? 10
  if (attemptNum === 1) return base
  if (attemptNum === 2) return Math.round(base * 0.6)
  return Math.round(base * 0.3)
}

export async function generateRecommendations(userId: string) {
  const analytics = await getUserAnalytics(userId)
  const existingRecs = await db.recommendation.findMany({ where: { userId, seen: false, dismissed: false }, select: { taskId: true } })
  const excludeTaskIds = new Set(existingRecs.map(r => r.taskId))

  const solved = await db.userProgress.findMany({ where: { userId, status: 'SOLVED_CORRECT' }, select: { taskId: true } })
  solved.forEach(p => excludeTaskIds.add(p.taskId))

  const recs: { taskId: string; reason: string; context: string; priority: number }[] = []

  // 1. Weak topics — pick 2 tasks per weak topic
  for (const weak of analytics.weakTopics.slice(0, 3)) {
    const tasks = await db.task.findMany({
      where: { verificationStatus: 'VERIFIED', topics: { some: { topicId: weak.topicId } }, id: { notIn: [...excludeTaskIds] }, difficulty: { lte: 2 } },
      take: 2,
      orderBy: { difficulty: 'asc' },
      select: { id: true },
    })
    tasks.forEach(t => { recs.push({ taskId: t.id, reason: 'WEAK_TOPIC', context: `weak_topic:${weak.topicName}`, priority: 90 }); excludeTaskIds.add(t.id) })
  }

  // 2. Next level — slightly harder than average solved
  if (analytics.totalSolved > 5) {
    const avgDiff = analytics.difficultyBreakdown.reduce((s, d) => s + d.difficulty * d.solved, 0) / (analytics.totalSolved || 1)
    const nextDiff = Math.min(3, Math.round(avgDiff + 0.5))
    const tasks = await db.task.findMany({
      where: { verificationStatus: 'VERIFIED', difficulty: nextDiff, id: { notIn: [...excludeTaskIds] } },
      take: 3, orderBy: { taskNumber: 'asc' }, select: { id: true },
    })
    tasks.forEach(t => { recs.push({ taskId: t.id, reason: 'NEXT_LEVEL', context: `difficulty:${nextDiff}`, priority: 60 }); excludeTaskIds.add(t.id) })
  }

  if (recs.length === 0) return []

  await db.recommendation.createMany({ data: recs.map(r => ({ ...r, userId })), skipDuplicates: true })
  return recs
}

export async function afterWrongAttempt(userId: string, taskId: string) {
  const task = await db.task.findUnique({ where: { id: taskId }, include: { topics: { include: { topic: true } } } })
  if (!task) return

  const topicIds = task.topics.map(tt => tt.topicId)
  const similarTasks = await db.task.findMany({
    where: { verificationStatus: 'VERIFIED', topics: { some: { topicId: { in: topicIds } } }, id: { not: taskId }, difficulty: { lte: task.difficulty } },
    take: 3, orderBy: { difficulty: 'asc' }, select: { id: true },
  })

  await db.recommendation.createMany({
    data: similarTasks.map(t => ({ userId, taskId: t.id, reason: 'AFTER_ERROR', context: `after_error:${taskId}`, priority: 85 })),
    skipDuplicates: true,
  })
}

export async function checkAndUpdateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const streak = await db.userStreak.upsert({ where: { userId }, create: { userId, current: 1, best: 1 }, update: {} })
  const lastDate = streak.lastActiveAt.toISOString().split('T')[0]

  if (lastDate === today) return streak

  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newCurrent = lastDate === yesterdayStr ? streak.current + 1 : 1
  const newBest = Math.max(streak.best, newCurrent)

  return db.userStreak.update({ where: { userId }, data: { current: newCurrent, best: newBest, lastActiveAt: new Date() } })
}

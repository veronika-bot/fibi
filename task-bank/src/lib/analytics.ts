import { db } from './db'
import { cached } from './redis'

export interface TopicStat {
  topicId: string
  topicName: string
  total: number
  solved: number
  accuracy: number    // 0–100
  avgAttempts: number
  isWeak: boolean     // accuracy < 65%
}

export interface UserAnalytics {
  totalSolved: number
  totalAttempts: number
  overallAccuracy: number
  currentStreak: number
  bestStreak: number
  xpTotal: number
  topicStats: TopicStat[]
  weakTopics: TopicStat[]
  recentAttempts: { date: string; count: number; correct: number }[]
  speedAvg: number | null   // avg seconds per correct answer
  difficultyBreakdown: { difficulty: number; solved: number; total: number }[]
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  return cached(`analytics:${userId}`, 60, async () => {
    const [attempts, progress, streak, topics] = await Promise.all([
      db.attempt.findMany({ where: { userId }, include: { task: { include: { topics: { include: { topic: true } } } } }, orderBy: { createdAt: 'desc' } }),
      db.userProgress.findMany({ where: { userId } }),
      db.userStreak.findUnique({ where: { userId } }),
      db.topic.findMany({ where: { parentId: { not: null } }, include: { tasks: { include: { task: { include: { progress: { where: { userId } } } } } } } }),
    ])

    const totalSolved = progress.filter(p => p.status === 'SOLVED_CORRECT').length
    const totalAttempts = attempts.length
    const correctAttempts = attempts.filter(a => a.isCorrect).length
    const overallAccuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0

    // Topic breakdown
    const topicStats: TopicStat[] = topics.map(topic => {
      const taskIds = topic.tasks.map(tt => tt.taskId)
      const total = taskIds.length
      const topicProgress = progress.filter(p => taskIds.includes(p.taskId))
      const solved = topicProgress.filter(p => p.status === 'SOLVED_CORRECT').length
      const topicAttempts = attempts.filter(a => taskIds.includes(a.taskId))
      const correct = topicAttempts.filter(a => a.isCorrect).length
      const accuracy = topicAttempts.length ? Math.round((correct / topicAttempts.length) * 100) : 0
      const avgAttempts = solved ? topicAttempts.length / solved : 0

      return { topicId: topic.id, topicName: topic.name, total, solved, accuracy, avgAttempts: Math.round(avgAttempts * 10) / 10, isWeak: accuracy < 65 && topicAttempts.length >= 3 }
    }).filter(t => t.total > 0)

    // Recent 14 days heatmap
    const recentAttempts = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      const dateStr = d.toISOString().split('T')[0]
      const dayAttempts = attempts.filter(a => a.createdAt.toISOString().split('T')[0] === dateStr)
      return { date: dateStr, count: dayAttempts.length, correct: dayAttempts.filter(a => a.isCorrect).length }
    })

    // Speed
    const timedAttempts = attempts.filter(a => a.isCorrect && a.timeTaken)
    const speedAvg = timedAttempts.length ? Math.round(timedAttempts.reduce((s, a) => s + a.timeTaken!, 0) / timedAttempts.length) : null

    // Difficulty breakdown
    const difficultyBreakdown = [1, 2, 3].map(d => {
      const dProgress = progress.filter(p => {
        const task = attempts.find(a => a.taskId === p.taskId)?.task
        return task?.difficulty === d
      })
      return { difficulty: d, solved: dProgress.filter(p => p.status === 'SOLVED_CORRECT').length, total: dProgress.length }
    })

    const xpTotal = progress.reduce((s, p) => s + p.xpEarned, 0)

    return {
      totalSolved, totalAttempts, overallAccuracy,
      currentStreak: streak?.current ?? 0,
      bestStreak: streak?.best ?? 0,
      xpTotal, topicStats,
      weakTopics: topicStats.filter(t => t.isWeak).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
      recentAttempts, speedAvg, difficultyBreakdown,
    }
  })
}

export async function getTutorAnalytics(tutorId: string, studentId: string) {
  return cached(`tutor-analytics:${tutorId}:${studentId}`, 30, async () => {
    const [homework, analytics] = await Promise.all([
      db.homework.findMany({ where: { tutorId, studentId }, include: { tasks: { include: { task: true } } }, orderBy: { createdAt: 'desc' } }),
      getUserAnalytics(studentId),
    ])

    const hwStats = homework.map(hw => {
      const taskIds = hw.tasks.map(ht => ht.taskId)
      return { ...hw, taskCount: taskIds.length }
    })

    return { homework: hwStats, studentAnalytics: analytics }
  })
}

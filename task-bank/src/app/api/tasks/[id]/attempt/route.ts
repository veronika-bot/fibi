import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { afterWrongAttempt, calcXP, checkAndUpdateStreak } from '@/lib/recommendations'
import { invalidate } from '@/lib/redis'
import { z } from 'zod'

const AttemptSchema = z.object({
  userId:    z.string().min(1),
  answer:    z.string().min(1),
  timeTaken: z.number().int().optional(),
})

function normalizeAnswer(raw: string): string {
  return raw.trim().replace(',', '.').toLowerCase()
}

function checkAnswer(submitted: string, correct: string, alts: string[]): boolean {
  const norm = normalizeAnswer(submitted)
  const all = [correct, ...alts].map(normalizeAnswer)
  return all.includes(norm)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = AttemptSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { userId, answer, timeTaken } = parsed.data
  const { id: taskId } = params

  const task = await db.task.findUnique({ where: { id: taskId }, select: { id: true, answer: true, answerAlt: true, difficulty: true, part: true, hint1: true, hint2: true, partialSolution: true, fullSolution: true } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const progress = await db.userProgress.upsert({
    where: { userId_taskId: { userId, taskId } },
    create: { userId, taskId, status: 'IN_PROGRESS', attempts: 0 },
    update: {},
  })

  if (progress.attempts >= 3) {
    return NextResponse.json({ error: 'Max attempts reached', status: 'locked' }, { status: 403 })
  }

  const attemptNum = progress.attempts + 1
  const answerAlts: string[] = JSON.parse(task.answerAlt ?? '[]')
  const isCorrect = task.part === 1 ? checkAnswer(answer, task.answer ?? '', answerAlts) : false

  await db.attempt.create({ data: { userId, taskId, attemptNum, answer, isCorrect, timeTaken } })

  let xpEarned = 0
  let newStatus: 'IN_PROGRESS' | 'SOLVED_CORRECT' | 'SOLVED_WRONG' = 'IN_PROGRESS'

  if (isCorrect) {
    xpEarned = calcXP(task.difficulty, attemptNum)
    newStatus = 'SOLVED_CORRECT'
    await checkAndUpdateStreak(userId)
  } else if (attemptNum >= 3) {
    newStatus = 'SOLVED_WRONG'
    await afterWrongAttempt(userId, taskId)
  }

  const updatedProgress = await db.userProgress.update({
    where: { userId_taskId: { userId, taskId } },
    data: { attempts: attemptNum, status: newStatus, xpEarned: { increment: xpEarned }, ...(isCorrect && { solvedAt: new Date(), bestAttempt: attemptNum }), lastAttemptAt: new Date() },
  })

  await invalidate(`analytics:${userId}`)

  const response: Record<string, unknown> = { isCorrect, attemptNum, status: newStatus, xpEarned }

  if (!isCorrect) {
    if (attemptNum === 1 && task.hint1)          response.hint = task.hint1
    if (attemptNum === 2 && task.hint2)          response.hint = task.hint2
    if (attemptNum === 2 && task.partialSolution) response.partialSolution = task.partialSolution
    if (attemptNum >= 3)                          response.fullSolution = JSON.parse(task.fullSolution ?? '[]')
  }

  return NextResponse.json(response)
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  fullName:      z.string().min(2).optional(),
  avatar:        z.string().optional(),
  city:          z.string().optional(),
  school:        z.string().optional(),
  age:           z.coerce.number().int().min(10).max(25).optional(),
  gender:        z.enum(['male', 'female']).optional(),
  hobbies:       z.array(z.string()).optional(),
  extraSubjects: z.array(z.string()).optional(),
  exam:          z.enum(['OGE', 'EGE_BASE', 'EGE_PROFILE']).optional(),
  dailyGoal:     z.coerce.number().int().min(1).max(20).optional(),
  onboardingDone: z.boolean().optional(),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req, ['STUDENT'])
    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }
    const { fullName, avatar, hobbies, extraSubjects, exam, ...rest } = parsed.data

    const [user, profile] = await db.$transaction([
      db.user.update({
        where: { id: session.userId },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(avatar !== undefined && { avatar }),
        },
      }),
      db.studentProfile.update({
        where: { userId: session.userId },
        data: {
          ...rest,
          ...(exam !== undefined && { examType: exam }),
          ...(hobbies !== undefined && { hobbies: JSON.stringify(hobbies) }),
          ...(extraSubjects !== undefined && { extraSubjects: JSON.stringify(extraSubjects) }),
        },
      }),
    ])
    return applyCors(req, NextResponse.json({ user: { fullName: user.fullName, avatar: user.avatar }, profile }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

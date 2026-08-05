import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  fullName:       z.string().min(2).optional(),
  phone:          z.string().optional(),
  avatar:         z.string().optional(),
  subject:        z.string().optional(),
  priceRub:       z.coerce.number().int().min(0).optional(),
  experienceText: z.string().optional(),
  bio:            z.string().optional(),
  testingData:    z.record(z.any()).optional(),
  profileStatus:  z.enum(['draft', 'testing_required', 'test_in_progress', 'review_pending', 'approved', 'rejected']).optional(),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    const { fullName, phone, avatar, subject, priceRub, experienceText, bio, testingData, profileStatus } = parsed.data

    const [user, profile] = await db.$transaction([
      db.user.update({
        where: { id: session.userId },
        data:  { ...(fullName !== undefined && { fullName }), ...(phone !== undefined && { phone }), ...(avatar !== undefined && { avatar }) },
      }),
      db.tutorProfile.update({
        where: { userId: session.userId },
        data: {
          ...(subject !== undefined && { subject }),
          ...(priceRub !== undefined && { priceRub }),
          ...(experienceText !== undefined && { experienceText }),
          ...(bio !== undefined && { bio }),
          ...(testingData !== undefined && { testingData: JSON.stringify(testingData) }),
          ...(profileStatus !== undefined && { profileStatus }),
        },
      }),
    ])

    return applyCors(req, NextResponse.json({ user: { fullName: user.fullName, phone: user.phone, avatar: user.avatar }, profile }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

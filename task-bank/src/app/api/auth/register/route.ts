import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { signSession, setSessionCookie } from '@/lib/session'
import { generateLinkCode } from '@/lib/linkCode'
import { rateLimit } from '@/lib/redis'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Минимум 8 символов'),
  fullName: z.string().min(2),
  phone:    z.string().optional(),
  role:     z.enum(['STUDENT', 'PARENT', 'TUTOR']),
  grade:    z.coerce.number().int().min(8).max(11).optional(),
})

function defaultExamType(grade?: number): string | null {
  if (!grade) return null
  return grade >= 10 ? 'EGE_PROFILE' : 'OGE'
}

async function uniqueLinkCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateLinkCode()
    const exists = await db.studentProfile.findUnique({ where: { linkCode: code } })
    if (!exists) return code
  }
  throw new Error('Не удалось сгенерировать код привязки')
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const allowed = await rateLimit(`register:${ip}`, 10, 60 * 10)
  if (!allowed) {
    return applyCors(req, NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 }))
  }

  const body   = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) {
    return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
  }

  const { email, password, fullName, phone, role, grade } = parsed.data

  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    return applyCors(req, NextResponse.json({ error: { email: ['Email уже зарегистрирован'] } }, { status: 409 }))
  }

  const passwordHash = await hashPassword(password)

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      role,
      ...(role === 'STUDENT' && {
        studentProfile: {
          create: {
            grade,
            examType: defaultExamType(grade),
            linkCode: await uniqueLinkCode(),
          },
        },
      }),
      ...(role === 'TUTOR' && {
        tutorProfile: { create: {} },
      }),
      ...(role === 'PARENT' && {
        parentProfile: { create: { notifications: { create: {} } } },
      }),
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  })

  const token = await signSession({ userId: user.id, role })
  const res = NextResponse.json({ user }, { status: 201 })
  setSessionCookie(res, token)
  return applyCors(req, res)
}

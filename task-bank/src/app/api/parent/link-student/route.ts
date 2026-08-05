import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { rateLimit } from '@/lib/redis'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({
  code: z.string().length(6).toUpperCase(),
})

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])

    const allowed = await rateLimit(`link-student:${session.userId}`, 20, 60 * 10)
    if (!allowed) {
      return applyCors(req, NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 }))
    }

    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    const student = await db.studentProfile.findUnique({ where: { linkCode: parsed.data.code } })
    if (!student) {
      return applyCors(req, NextResponse.json({ error: 'Код не найден. Проверьте код в профиле ученика.' }, { status: 404 }))
    }

    await db.parentStudentLink.upsert({
      where:  { parentId_studentId: { parentId: session.userId, studentId: student.userId } },
      create: { parentId: session.userId, studentId: student.userId },
      update: {},
    })

    return applyCors(req, NextResponse.json({ studentId: student.userId, message: 'Ученик успешно привязан!' }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

const DeleteBody = z.object({
  studentId: z.string().min(1),
})

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireUser(req, ['PARENT'])
    const body   = await req.json().catch(() => null)
    const parsed = DeleteBody.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    await db.parentStudentLink.deleteMany({
      where: { parentId: session.userId, studentId: parsed.data.studentId },
    })

    return applyCors(req, NextResponse.json({ ok: true }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

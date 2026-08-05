import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const VerifySchema = z.object({ status: z.enum(['VERIFIED', 'REJECTED']) })

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser(req, ['ADMIN'])
    const body = await req.json()
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) return applyCors(req, NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }))

    const task = await db.task.update({
      where: { id: params.id },
      data: { verificationStatus: parsed.data.status },
    })

    return applyCors(req, NextResponse.json(task))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 }))
  }
}

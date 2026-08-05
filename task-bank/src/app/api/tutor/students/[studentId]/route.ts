import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, authErrorResponse } from '@/lib/authGuard'
import { applyCors, corsPreflight } from '@/lib/cors'

const Body = z.object({ notes: z.string().max(2000) })

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function PATCH(req: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const session = await requireUser(req, ['TUTOR'])
    const body   = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) {
      return applyCors(req, NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 }))
    }

    const link = await db.tutorStudentLink.update({
      where: { tutorId_studentId: { tutorId: session.userId, studentId: params.studentId } },
      data:  { notes: parsed.data.notes },
    })
    return applyCors(req, NextResponse.json({ notes: link.notes }))
  } catch (err) {
    return authErrorResponse(err) ?? applyCors(req, NextResponse.json({ error: 'Ученик не найден в вашем списке' }, { status: 404 }))
  }
}

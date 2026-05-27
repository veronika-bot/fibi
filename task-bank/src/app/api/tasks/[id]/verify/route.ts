import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const VerifySchema = z.object({ status: z.enum(['VERIFIED', 'REJECTED']) })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = VerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const task = await db.task.update({
    where: { id: params.id },
    data: { verificationStatus: parsed.data.status },
  })

  return NextResponse.json(task)
}

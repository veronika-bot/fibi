import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { applyCors, corsPreflight } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req)
}

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) {
    return applyCors(req, NextResponse.json({ user: null }, { status: 401 }))
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { studentProfile: true, tutorProfile: true, parentProfile: true },
  })
  if (!user) {
    return applyCors(req, NextResponse.json({ user: null }, { status: 401 }))
  }

  const { passwordHash: _passwordHash, ...safeUser } = user
  return applyCors(req, NextResponse.json({ user: safeUser }))
}

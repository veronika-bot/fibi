import { NextRequest, NextResponse } from 'next/server'
import { getTutorAnalytics } from '@/lib/analytics'

export async function GET(req: NextRequest) {
  const tutorId   = req.nextUrl.searchParams.get('tutorId')
  const studentId = req.nextUrl.searchParams.get('studentId')

  if (!tutorId || !studentId) {
    return NextResponse.json({ error: 'tutorId and studentId required' }, { status: 400 })
  }

  const data = await getTutorAnalytics(tutorId, studentId)
  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { getUserAnalytics, getTutorAnalytics } from '@/lib/analytics'

export async function GET(req: NextRequest) {
  const userId   = req.nextUrl.searchParams.get('userId')
  const tutorId  = req.nextUrl.searchParams.get('tutorId')
  const studentId = req.nextUrl.searchParams.get('studentId')

  if (tutorId && studentId) {
    const data = await getTutorAnalytics(tutorId, studentId)
    return NextResponse.json(data)
  }

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const analytics = await getUserAnalytics(userId)
  return NextResponse.json(analytics)
}

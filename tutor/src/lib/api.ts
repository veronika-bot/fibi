import type { Student, Homework } from './types'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} failed: ${res.status}`)
  return res.json()
}

export interface MeUser {
  id: string
  email: string
  role: string
  fullName: string
  phone: string | null
  avatar: string | null
  tutorProfile: {
    subject: string | null
    priceRub: number | null
    experienceText: string | null
    bio: string | null
    profileStatus: string
    rating: number
    reviewsCount: number
  } | null
}

export async function getMe(): Promise<MeUser | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    return data.user
  } catch {
    return null
  }
}

export async function login(email: string, password: string) {
  return req<{ user: MeUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function logout() {
  await req('/api/auth/logout', { method: 'POST' })
}

export async function getTutorStudents(): Promise<Student[]> {
  const data = await req<{ students: Student[] }>('/api/tutor/students')
  return data.students
}

export async function patchTutorProfile(body: {
  fullName?: string; avatar?: string; subject?: string; priceRub?: number; bio?: string
}) {
  return req('/api/tutor/profile', { method: 'PATCH', body: JSON.stringify(body) })
}

interface ServerHomework {
  id: string
  title: string
  studentId: string
  student?: { fullName: string }
  status: string
  dueDate: string | null
  tasks: unknown[]
  grade?: number | null
}

export async function getHomework(): Promise<Homework[]> {
  const rows = await req<ServerHomework[]>('/api/homework')
  // Server model only tracks ACTIVE/COMPLETED (+ OVERDUE computed by due date on some
  // routes) — no submitted/graded workflow exists yet, so that half of HWStatus is
  // approximated rather than real.
  return rows.map(hw => ({
    id: hw.id,
    title: hw.title,
    studentId: hw.studentId,
    studentName: hw.student?.fullName || '—',
    status: hw.status === 'COMPLETED' ? 'checked' : 'assigned',
    dueDate: hw.dueDate ? hw.dueDate.slice(0, 10) : '—',
    tasks: hw.tasks?.length || 0,
    grade: hw.grade ?? undefined,
  }))
}

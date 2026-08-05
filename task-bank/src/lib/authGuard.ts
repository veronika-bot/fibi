import { NextRequest, NextResponse } from 'next/server'
import { getSession, SessionPayload } from './session'

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message)
  }
}

/** Reads and validates the session cookie. Throws AuthError(401/403) if missing/unauthorized. */
export async function requireUser(req: NextRequest, roles?: string[]): Promise<SessionPayload> {
  const session = await getSession(req)
  if (!session) throw new AuthError(401, 'Не авторизован')
  if (roles && !roles.includes(session.role)) throw new AuthError(403, 'Недостаточно прав')
  return session
}

export function authErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  return null
}

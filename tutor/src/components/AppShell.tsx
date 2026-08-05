'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { getMe, MeUser } from '@/lib/api'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    if (pathname === '/login') return
    let cancelled = false
    getMe().then(user => {
      if (cancelled) return
      if (!user || user.role !== 'TUTOR') {
        router.replace('/login')
        return
      }
      setStatus('ok')
    })
    return () => { cancelled = true }
  }, [pathname, router])

  if (pathname === '/login') {
    return <>{children}</>
  }

  if (status === 'checking') {
    return <div className="flex h-screen items-center justify-center text-gray-400 text-sm">Загрузка…</div>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'ФИБИ — Кабинет репетитора',
  description: 'Платформа ФИБИ для репетиторов',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

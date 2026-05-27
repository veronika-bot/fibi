import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'ФИБИ — Банк заданий',
  description: 'Банк заданий ОГЭ/ЕГЭ по математике',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Sidebar />
        <main className="page-container">{children}</main>
      </body>
    </html>
  )
}

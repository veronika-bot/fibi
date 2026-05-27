'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, FileCheck,
  Database, MessageSquare, BarChart2, TrendingUp, CreditCard, User,
} from 'lucide-react'
import { MOCK_TUTOR } from '@/lib/mock'

const NAV = [
  { href: '/',            icon: LayoutDashboard, label: 'Главная' },
  { href: '/students',    icon: Users,           label: 'Ученики' },
  { href: '/courses',     icon: BookOpen,        label: 'Курсы' },
  { href: '/homework',    icon: ClipboardList,   label: 'Домашние задания' },
  { href: '/checking',    icon: FileCheck,       label: 'Проверка' },
  { href: '/bank',        icon: Database,        label: 'Банк заданий' },
  { href: '/chats',       icon: MessageSquare,   label: 'Чаты' },
  { href: '/chart',       icon: TrendingUp,      label: 'Чарт' },
  { href: '/analytics',   icon: BarChart2,       label: 'Аналитика' },
  { href: '/subscription',icon: CreditCard,      label: 'Подписка' },
  { href: '/profile',     icon: User,            label: 'Профиль' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yale flex items-center justify-center">
            <OctopusIcon />
          </div>
          <div>
            <p className="font-black text-yale text-base leading-none">ФИБИ</p>
            <p className="text-xs text-gray-400 mt-0.5">Кабинет репетитора</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-yale text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <Link href="/profile">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yale to-yale-light flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {MOCK_TUTOR.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{MOCK_TUTOR.name}</p>
              <p className="text-xs text-gray-400 truncate">{MOCK_TUTOR.subject}</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}

function OctopusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
      <ellipse cx="12" cy="10" rx="6" ry="5"/>
      <path d="M6 13c-1 2-2 4-1.5 6M9 15c-.5 2-1 4 0 6M12 15v6M15 15c.5 2 1 4 0 6M18 13c1 2 2 4 1.5 6"/>
      <path d="M9 6.5c0-1 .8-2 1.5-2.5M13 4.5c.5.3 1.5 1.5 1.5 2"/>
      <rect x="10" y="2" width="4" height="2.5" rx="0.8" strokeWidth="1.4"/>
    </svg>
  )
}

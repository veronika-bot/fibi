'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, FileCheck,
  Database, MessageSquare, TrendingUp, BarChart2, CreditCard, User, Menu, X,
} from 'lucide-react'
import { MOCK_TUTOR } from '@/lib/mock'

const NAV = [
  { href: '/',             icon: LayoutDashboard, label: 'Главная' },
  { href: '/students',     icon: Users,           label: 'Ученики' },
  { href: '/courses',      icon: BookOpen,        label: 'Курсы' },
  { href: '/homework',     icon: ClipboardList,   label: 'Домашние задания' },
  { href: '/checking',     icon: FileCheck,       label: 'Проверка' },
  { href: '/bank',         icon: Database,        label: 'Банк заданий' },
  { href: '/chats',        icon: MessageSquare,   label: 'Чаты' },
  { href: '/chart',        icon: TrendingUp,      label: 'Чарт' },
  { href: '/analytics',    icon: BarChart2,       label: 'Аналитика' },
  { href: '/subscription', icon: CreditCard,      label: 'Подписка' },
  { href: '/profile',      icon: User,            label: 'Профиль' },
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <OctopusIcon />
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-base leading-none">ФИБИ</p>
            <p className="text-xs text-white/50 mt-0.5 truncate">Кабинет репетитора</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onNav}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  active
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
        <Link href="/profile" onClick={onNav}>
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {MOCK_TUTOR.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{MOCK_TUTOR.name}</p>
              <p className="text-xs text-white/50 truncate">{MOCK_TUTOR.subject}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close sidebar on route change
  const pathname = usePathname()
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile burger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-yale rounded-xl flex items-center justify-center shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu size={20} color="white" strokeWidth={2.2}/>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-64 flex-col bg-yale min-h-screen flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide in */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-yale z-50 flex flex-col shadow-2xl"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <X size={16}/>
            </button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
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

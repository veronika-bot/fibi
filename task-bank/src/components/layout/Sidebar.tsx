'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, BookOpen, AlertCircle, BarChart2, ClipboardList, Users, ShieldCheck, Search } from 'lucide-react'
import { cn } from '@/components/ui'
import Image from 'next/image'

const NAV = [
  { href: '/bank',               icon: BookOpen,     label: 'Банк заданий' },
  { href: '/bank/search',        icon: Search,       label: 'Поиск' },
  { href: '/stats',              icon: BarChart2,    label: 'Статистика' },
  { href: '/bank/errors',        icon: AlertCircle,  label: 'Ошибки' },
  { href: '/homework/builder',   icon: ClipboardList,label: 'Домашние задания' },
  { href: '/analytics/student',  icon: LayoutGrid,   label: 'Аналитика' },
  { href: '/analytics/tutor',    icon: Users,        label: 'Репетитор' },
  { href: '/admin',              icon: ShieldCheck,  label: 'Админ' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-60 min-h-screen bg-yale fixed left-0 top-0 flex flex-col z-40">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-lemon-200 flex items-center justify-center overflow-hidden">
          <img src="/icon.png" alt="ФИБИ" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-white font-black text-lg leading-none">ФИБИ</p>
          <p className="text-white/50 text-xs mt-0.5">Банк заданий</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/bank' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150',
                active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/8')}>
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition">← На платформу</Link>
      </div>
    </aside>
  )
}

'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function Card({ children, className, hover = false, onClick }:
  { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 32px rgba(13,59,102,0.14)' } : {}}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl shadow-card p-5',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function KPICard({ label, value, sub, icon, trend }:
  { label: string; value: string | number; sub?: string; icon: ReactNode; trend?: number }) {
  return (
    <Card hover className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-yale flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <span className={clsx('text-xs font-semibold mt-1 inline-block',
            trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </Card>
  )
}

export function Badge({ children, variant = 'default' }:
  { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'gold' }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', {
      'bg-blue-50 text-yale':       variant === 'default',
      'bg-green-50 text-green-700': variant === 'success',
      'bg-amber-50 text-amber-700': variant === 'warning',
      'bg-red-50 text-red-600':     variant === 'danger',
      'bg-gradient-to-r from-amber-400 to-yellow-300 text-white': variant === 'gold',
    })}>
      {children}
    </span>
  )
}

export function Avatar({ initials, size = 'md', online }:
  { initials: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  return (
    <div className="relative inline-flex">
      <div className={clsx('rounded-full bg-gradient-to-br from-yale to-yale-light flex items-center justify-center font-bold text-white flex-shrink-0', sizes[size])}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={clsx('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
          online ? 'bg-green-400' : 'bg-gray-300')} />
      )}
    </div>
  )
}

export function Btn({ children, variant = 'primary', className, onClick, disabled, type = 'button' }:
  { children: ReactNode; variant?: 'primary' | 'outline' | 'ghost' | 'danger'; className?: string;
    onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      type={type} onClick={onClick} disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50',
        {
          'bg-yale text-white hover:bg-yale-light shadow-sm':          variant === 'primary',
          'border border-gray-200 text-gray-700 hover:bg-gray-50':     variant === 'outline',
          'text-gray-600 hover:bg-gray-100':                           variant === 'ghost',
          'bg-red-50 text-red-600 hover:bg-red-100':                   variant === 'danger',
        },
        className
      )}
    >
      {children}
    </motion.button>
  )
}

export function SectionTitle({ children, action }:
  { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-black text-gray-900">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, sub, action }:
  { icon?: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 opacity-30">{icon}</div>}
      <p className="font-bold text-gray-600 text-base">{title}</p>
      {sub && <p className="text-sm text-gray-400 mt-1 max-w-xs">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export function HWStatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    assigned:  ['Выдано', 'default'],
    submitted: ['Сдано', 'warning'],
    checked:   ['Проверено', 'success'],
    overdue:   ['Просрочено', 'danger'],
  }
  const [label, variant] = map[status] ?? ['—', 'default']
  return <Badge variant={variant as any}>{label}</Badge>
}

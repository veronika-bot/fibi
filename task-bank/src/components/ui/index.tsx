'use client'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

export function cn(...inputs: Parameters<typeof clsx>) { return twMerge(clsx(...inputs)) }

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className, hover = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div className={cn('bg-white rounded-3xl p-6 shadow-card border border-yale-100/50', hover && 'transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5 cursor-pointer', className)} {...props}>
      {children}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export function Button({ children, variant = 'primary', className, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  const base = 'inline-flex items-center gap-2 justify-center rounded-2xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yale-500 disabled:opacity-50 disabled:cursor-not-allowed select-none'
  const variants: Record<BtnVariant, string> = {
    primary:   'bg-yale text-white px-5 py-2.5 text-sm hover:bg-yale-600 active:scale-95 shadow-sm',
    secondary: 'bg-white border-2 border-yale text-yale px-5 py-2.5 text-sm hover:bg-yale-50 active:scale-95',
    ghost:     'bg-transparent text-yale-500 px-4 py-2 text-sm hover:bg-yale-50 active:scale-95',
    danger:    'bg-red-500 text-white px-5 py-2.5 text-sm hover:bg-red-600 active:scale-95',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────
type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'navy'
export function Badge({ children, color = 'blue', className }: { children: React.ReactNode; color?: BadgeColor; className?: string }) {
  const colors: Record<BadgeColor, string> = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-700',
    gray:   'bg-gray-100 text-gray-600',
    navy:   'bg-yale text-white',
  }
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', colors[color], className)}>{children}</span>
}

// ── DiffBadge ─────────────────────────────────────────────
export function DiffBadge({ diff }: { diff: number }) {
  if (diff === 1) return <Badge color="green">Лёгкий</Badge>
  if (diff === 2) return <Badge color="yellow">Средний</Badge>
  return <Badge color="red">Сложный</Badge>
}

// ── Input ─────────────────────────────────────────────────
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-yale focus:ring-2 focus:ring-yale/10', className)} {...props} />
}

// ── Select ────────────────────────────────────────────────
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-yale cursor-pointer', className)} {...props} />
}

// ── Progress bar ──────────────────────────────────────────
export function ProgressBar({ value, className, color = 'yale' }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn('h-2 rounded-full bg-gray-100 overflow-hidden', className)}>
      <motion.div className="h-full rounded-full bg-yale" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
    </div>
  )
}

// ── Progress ring ─────────────────────────────────────────
export function ProgressRing({ value, size = 80, stroke = 7, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0D3B66" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </svg>
      {label && <span className="absolute text-sm font-bold text-yale-700">{label}</span>}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer', className)} />
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-20 h-20 rounded-3xl bg-yale-50 flex items-center justify-center text-yale">{icon}</div>
      <div><p className="text-lg font-bold text-gray-800">{title}</p>{desc && <p className="text-sm text-gray-500 mt-1 max-w-xs">{desc}</p>}</div>
      {action}
    </div>
  )
}

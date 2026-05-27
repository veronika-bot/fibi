'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Zap, Target, TrendingUp, Award, BookOpen } from 'lucide-react'
import { Card, ProgressBar, ProgressRing, Badge, Skeleton } from '@/components/ui'
import Link from 'next/link'

const USER_ID = 'demo-student'

const LEVELS = [
  { name: 'Новичок',   min: 0,    max: 100  },
  { name: 'Ученик',    min: 100,  max: 250  },
  { name: 'Практик',   min: 250,  max: 500  },
  { name: 'Знаток',    min: 500,  max: 900  },
  { name: 'Мастер',    min: 900,  max: 1500 },
  { name: 'Эксперт',   min: 1500, max: 2500 },
  { name: 'Профи',     min: 2500, max: 4000 },
  { name: 'Гений',     min: 4000, max: 99999},
]

function getLevelInfo(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) if (xp >= LEVELS[i].min) return { ...LEVELS[i], index: i }
  return { ...LEVELS[0], index: 0 }
}

export default function StatsPage() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics?userId=${USER_ID}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div>
      <div className="topbar"><h1 className="section-title">Статистика</h1></div>
      <div className="grid grid-cols-3 gap-4 mb-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
    </div>
  )

  const xp  = data?.xpTotal ?? 0
  const lvl = getLevelInfo(xp)
  const next = LEVELS[Math.min(lvl.index + 1, LEVELS.length - 1)]
  const pct = lvl.index === LEVELS.length - 1 ? 100 : Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100)

  return (
    <div>
      <div className="topbar">
        <div><h1 className="section-title">Статистика</h1><p className="section-sub">Твой прогресс в ФИБИ</p></div>
      </div>

      {/* Level card */}
      <Card className="mb-6 bg-gradient-to-r from-yale to-yale-400 text-white">
        <div className="flex items-center gap-8">
          <ProgressRing value={pct} size={88} stroke={8} label={`${pct}%`} />
          <div className="flex-1">
            <p className="text-white/70 text-sm font-semibold mb-1">Текущий уровень</p>
            <h2 className="text-3xl font-black text-white">{lvl.name}</h2>
            <p className="text-white/70 text-sm mt-1">{xp} XP · {lvl.index < LEVELS.length - 1 ? `до «${next.name}»: ${next.min - xp} XP` : 'Максимальный уровень!'}</p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div className="h-full bg-lemon-200 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: BookOpen,  label: 'Решено задач',   value: data?.totalSolved, color: 'text-yale', bg: 'bg-yale-50' },
          { icon: Target,    label: 'Точность',        value: `${data?.overallAccuracy}%`, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: Flame,     label: 'Текущая серия',   value: `${data?.currentStreak} дн.`, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Trophy,    label: 'Рекорд серии',    value: `${data?.bestStreak} дн.`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { icon: Zap,       label: 'XP всего',        value: data?.xpTotal, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: TrendingUp,label: 'Попыток всего',   value: data?.totalAttempts, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
            <Card className="text-center py-5">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}><Icon size={22} className={color} /></div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level roadmap */}
      <Card>
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><Award size={18} className="text-yale" /> Путь уровней</h3>
        <div className="space-y-3">
          {LEVELS.map((l, i) => {
            const done = xp >= l.max
            const current = lvl.index === i
            const locked = xp < l.min
            return (
              <div key={l.name} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${current ? 'bg-yale-50 border-2 border-yale' : done ? 'bg-green-50' : locked ? 'opacity-40' : 'bg-gray-50'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${current ? 'bg-yale text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
                <div className="flex-1">
                  <span className={`font-bold text-sm ${current ? 'text-yale' : done ? 'text-green-700' : 'text-gray-700'}`}>{l.name}</span>
                  <p className="text-xs text-gray-500">{l.min}–{l.max === 99999 ? '∞' : l.max} XP</p>
                </div>
                {done && !current && <span className="text-green-500 text-xs font-bold">✓</span>}
                {current && <Badge color="navy">Сейчас</Badge>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

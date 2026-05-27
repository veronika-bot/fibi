'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { Flame, Target, TrendingUp, CheckCircle2, XCircle, Zap, Clock, Trophy } from 'lucide-react'
import { Card, Badge, ProgressBar, ProgressRing, Skeleton } from '@/components/ui'

const USER_ID = 'demo-student'

interface Analytics {
  totalSolved: number; totalAttempts: number; overallAccuracy: number
  currentStreak: number; bestStreak: number; xpTotal: number
  topicStats: { topicName: string; solved: number; total: number; accuracy: number; isWeak: boolean }[]
  recentAttempts: { date: string; count: number; correct: number }[]
  speedAvg: number | null
  difficultyBreakdown: { difficulty: number; solved: number; total: number }[]
}

const DIFF_LABELS: Record<number, string> = { 1: 'Лёгкие', 2: 'Средние', 3: 'Сложные' }
const DIFF_COLORS: Record<number, string> = { 1: '#16a34a', 2: '#d97706', 3: '#dc2626' }

export default function StudentAnalyticsPage() {
  const [data, setData]     = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics?userId=${USER_ID}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div>
      <div className="topbar"><div><h1 className="section-title">Аналитика</h1></div></div>
      <div className="grid grid-cols-4 gap-4 mb-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-64 mb-4" /><Skeleton className="h-64" />
    </div>
  )

  if (!data) return null

  const statCards = [
    { icon: CheckCircle2, label: 'Решено',     value: data.totalSolved,       color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: Target,       label: 'Точность',   value: `${data.overallAccuracy}%`, color: 'text-yale',   bg: 'bg-yale-50' },
    { icon: Flame,        label: 'Серия дней', value: data.currentStreak,     color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Zap,          label: 'XP всего',   value: data.xpTotal,           color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  const heatmapMax = Math.max(...data.recentAttempts.map(d => d.count), 1)

  return (
    <div>
      <div className="topbar">
        <div><h1 className="section-title">Аналитика</h1><p className="section-sub">Твой прогресс и статистика</p></div>
        {data.bestStreak > 0 && <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2"><Trophy size={16} className="text-orange-500" /><span className="text-sm font-bold text-orange-700">Рекорд серии: {data.bestStreak} дн.</span></div>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="text-center py-5">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}><Icon size={22} className={color} /></div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Activity heatmap */}
        <Card>
          <h3 className="font-black text-gray-900 mb-5">Активность за 14 дней</h3>
          <div className="flex items-end gap-1.5">
            {data.recentAttempts.map(d => {
              const pct = d.count / heatmapMax
              const solved = d.count > 0 ? Math.round((d.correct / d.count) * 100) : 0
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(pct * 64, d.count > 0 ? 8 : 2)}px`, background: d.count === 0 ? '#f3f4f6' : `rgba(13,59,102,${0.2 + pct * 0.8})` }} />
                  <span className="text-[9px] text-gray-400 font-medium">{new Date(d.date).getDate()}</span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yale text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.count} попыток · {solved}% верно
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Difficulty breakdown */}
        <Card>
          <h3 className="font-black text-gray-900 mb-5">По сложности</h3>
          <div className="space-y-4">
            {data.difficultyBreakdown.map(d => (
              <div key={d.difficulty}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">{DIFF_LABELS[d.difficulty]}</span>
                  <span className="text-gray-500 font-medium">{d.solved} / {d.total}</span>
                </div>
                <ProgressBar value={d.total ? Math.round(d.solved / d.total * 100) : 0} />
              </div>
            ))}
          </div>
          {data.speedAvg && (
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Среднее время: <strong className="text-yale">{Math.round(data.speedAvg / 60)} мин</strong></span>
            </div>
          )}
        </Card>
      </div>

      {/* Topic breakdown */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900">По темам</h3>
          <Badge color="red">{data.topicStats.filter(t => t.isWeak).length} слабых тем</Badge>
        </div>
        <div className="space-y-3">
          {data.topicStats.sort((a, b) => a.accuracy - b.accuracy).map(t => (
            <div key={t.topicName} className={`p-3 rounded-2xl ${t.isWeak ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
              <div className="flex justify-between text-sm mb-2">
                <span className={`font-semibold ${t.isWeak ? 'text-red-800' : 'text-gray-800'}`}>{t.topicName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{t.solved}/{t.total}</span>
                  <span className={`font-bold text-sm ${t.accuracy >= 80 ? 'text-green-600' : t.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{t.accuracy}%</span>
                </div>
              </div>
              <ProgressBar value={t.accuracy} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

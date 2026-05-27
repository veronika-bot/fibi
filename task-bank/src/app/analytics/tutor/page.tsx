'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, ClipboardList, TrendingDown, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import { Card, Badge, ProgressBar, Button, DiffBadge } from '@/components/ui'
import Link from 'next/link'

const TUTOR_ID   = 'demo-tutor'
const STUDENT_ID = 'demo-student'

export default function TutorAnalyticsPage() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/tutor?tutorId=${TUTOR_ID}&studentId=${STUDENT_ID}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div><div className="topbar"><h1 className="section-title">Аналитика репетитора</h1></div>
      <div className="grid grid-cols-3 gap-4 mb-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-3xl animate-pulse" />)}</div></div>
  )

  const a = data?.studentAnalytics
  const hw = data?.homework ?? []

  return (
    <div>
      <div className="topbar">
        <div><h1 className="section-title">Аналитика репетитора</h1><p className="section-sub">Статистика по ученику и домашним заданиям</p></div>
        <Link href="/homework/builder"><Button><ClipboardList size={16} /> Новое ДЗ</Button></Link>
      </div>

      {/* Student summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Решено', value: a?.totalSolved ?? 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Точность', value: `${a?.overallAccuracy ?? 0}%`, icon: TrendingDown, color: 'text-yale', bg: 'bg-yale-50' },
          { label: 'Серия', value: a?.currentStreak ?? 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Домашних ДЗ', value: hw.length, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="py-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-2`}><Icon size={18} className={color} /></div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Weak topics for student */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-gray-900">Слабые темы ученика</h3>
            <Badge color="red">{a?.weakTopics?.length ?? 0}</Badge>
          </div>
          {a?.weakTopics?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Слабых тем не обнаружено</p>
          ) : (
            <div className="space-y-3">
              {(a?.weakTopics ?? []).map((t: any) => (
                <div key={t.topicName} className="bg-red-50 rounded-2xl p-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-red-800">{t.topicName}</span>
                    <span className="font-bold text-red-600">{t.accuracy}%</span>
                  </div>
                  <ProgressBar value={t.accuracy} />
                  <Link href={`/homework/builder?topic=${encodeURIComponent(t.topicName)}`}>
                    <button className="text-xs text-red-600 font-semibold mt-2 hover:text-red-800 transition flex items-center gap-1">
                      Составить ДЗ по теме <ChevronRight size={12} />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Homework history */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-gray-900">История ДЗ</h3>
            <Link href="/homework/builder"><Button variant="ghost" className="text-xs">+ Новое</Button></Link>
          </div>
          {hw.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Домашних заданий ещё не было</p>
              <Link href="/homework/builder"><Button className="mt-4" variant="secondary">Составить первое ДЗ</Button></Link>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {hw.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{h.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{h.taskCount} заданий · {new Date(h.createdAt).toLocaleDateString('ru')}</p>
                  </div>
                  <Badge color={h.status === 'ACTIVE' ? 'blue' : h.status === 'REVIEWED' ? 'green' : 'gray'}>
                    {h.status === 'ACTIVE' ? 'Активно' : h.status === 'SUBMITTED' ? 'Сдано' : h.status === 'REVIEWED' ? 'Проверено' : 'Закрыто'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Topic performance chart */}
      <Card>
        <h3 className="font-black text-gray-900 mb-5">Прогресс по всем темам</h3>
        <div className="space-y-2.5">
          {(a?.topicStats ?? []).map((t: any) => (
            <div key={t.topicName} className="flex items-center gap-4">
              <span className="w-36 text-sm font-medium text-gray-700 truncate flex-shrink-0">{t.topicName}</span>
              <div className="flex-1"><ProgressBar value={t.accuracy} /></div>
              <span className={`w-12 text-right text-sm font-bold flex-shrink-0 ${t.accuracy >= 80 ? 'text-green-600' : t.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{t.accuracy}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

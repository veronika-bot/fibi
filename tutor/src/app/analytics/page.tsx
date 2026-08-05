'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, BookOpen, CheckCircle2, BarChart2 } from 'lucide-react'
import { Card, SectionTitle, KPICard } from '@/components/ui'
import { ACTIVITY_DATA } from '@/lib/mock'
import { getTutorStudents, getHomework } from '@/lib/api'
import type { Student, Homework } from '@/lib/types'

function MiniBar({ value, max, label, color = 'bg-yale' }: { value: number; max: number; label: string; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span><span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width:0 }} animate={{ width:`${(value/max)*100}%` }}
          transition={{ duration:0.8, ease:'easeOut' }}
          className={`h-full rounded-full ${color}`}/>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [hw, setHw] = useState<Homework[]>([])

  useEffect(() => {
    getTutorStudents().then(setStudents).catch(() => setStudents([]))
    getHomework().then(setHw).catch(() => setHw([]))
  }, [])

  const avgScore = students.length ? Math.round(students.reduce((s,st) => s+st.score, 0) / students.length) : 0
  const hwDone   = hw.filter(h => h.status==='checked').length
  const hwTotal  = hw.length
  const allWeak  = students.flatMap(s => s.weakTopics)
  const topicFreq: Record<string,number> = {}
  allWeak.forEach(t => topicFreq[t] = (topicFreq[t]||0)+1)
  const topics = Object.entries(topicFreq).sort((a,b)=>b[1]-a[1])
  const maxFreq = topics[0]?.[1] || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Аналитика</h1>
        <p className="text-gray-500 text-sm mt-1">Обзор за последние 30 дней</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Учеников" value={students.length} icon={<Users size={20} strokeWidth={1.8}/>}/>
        <KPICard label="Ср. балл" value={avgScore+'%'} icon={<TrendingUp size={20} strokeWidth={1.8}/>}/>
        <KPICard label="ДЗ выполнено" value={`${hwDone}/${hwTotal}`} icon={<CheckCircle2 size={20} strokeWidth={1.8}/>}/>
        <KPICard label="Активных дней" value={18} icon={<BarChart2 size={20} strokeWidth={1.8}/>}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Активность по дням</SectionTitle>
          <div className="flex items-end justify-between h-32 gap-2">
            {ACTIVITY_DATA.map(d => (
              <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-gray-500 font-medium">{d.checks}</span>
                <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex-1">
                  <motion.div initial={{ height:0 }} animate={{ height:`${(d.checks/22)*100}%` }}
                    transition={{ duration:0.7 }}
                    className="w-full bg-gradient-to-t from-yale to-yale-light rounded-t-lg"/>
                </div>
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Слабые темы учеников</SectionTitle>
          <div className="space-y-3">
            {topics.map(([topic, freq]) => (
              <MiniBar key={topic} label={topic} value={freq} max={maxFreq}
                color={freq === maxFreq ? 'bg-red-400' : 'bg-yale'}/>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>Прогресс учеников</SectionTitle>
        <div className="space-y-4">
          {students.map(s => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">{s.name.split(' ')[0]}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${s.score}%` }}
                  transition={{ duration:0.8 }}
                  className={`h-full rounded-full ${s.score>=70?'bg-green-400':s.score>=50?'bg-amber-400':'bg-red-400'}`}/>
              </div>
              <span className="text-sm font-bold text-gray-700 w-12 text-right">{s.score}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

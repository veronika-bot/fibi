'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, BookOpen, AlertCircle } from 'lucide-react'
import { Card, SectionTitle, Badge, Avatar, Btn, EmptyState } from '@/components/ui'
import { getTutorStudents, getHomework } from '@/lib/api'
import type { Student, Homework } from '@/lib/types'

function StudentCard({ s, hw, onClick }: { s: Student; hw: Homework[]; onClick: () => void }) {
  const active = hw.filter(h => h.studentId === s.id && h.status === 'assigned').length
  return (
    <motion.div layout whileHover={{ y: -3 }} onClick={onClick}
      className="bg-white rounded-2xl shadow-card p-5 cursor-pointer hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar initials={s.avatar} size="lg"/>
          <div>
            <p className="font-bold text-gray-900">{s.name}</p>
            <p className="text-xs text-gray-400">{s.exam} · Стрик {s.streak}д</p>
          </div>
        </div>
        <Badge variant={s.score >= 70 ? 'success' : s.score >= 50 ? 'warning' : 'danger'}>{s.score}%</Badge>
      </div>
      <div className="mb-3">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-yale to-yale-light"/>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {s.weakTopics.map(t => <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t}</span>)}
      </div>
      <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1"><BookOpen size={12}/> {s.hwDone} ДЗ</span>
        {active > 0 && <span className="flex items-center gap-1 text-amber-600"><AlertCircle size={12}/> {active} активных</span>}
        <span>{s.lastActive}</span>
      </div>
    </motion.div>
  )
}

function StudentModal({ s, allHw, onClose }: { s: Student; allHw: Homework[]; onClose: () => void }) {
  const hw = allHw.filter(h => h.studentId === s.id)
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <Avatar initials={s.avatar} size="lg"/>
            <div>
              <h2 className="text-xl font-black text-gray-900">{s.name}</h2>
              <p className="text-sm text-gray-500">{s.exam} · {s.lastActive}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">×</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['Прогресс',s.score+'%'],['Стрик',s.streak+'д'],['ДЗ сдано',s.hwDone+'']].map(([l,v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-gray-900">{v}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Слабые темы</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {s.weakTopics.map(t => <span key={t} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">{t}</span>)}
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Домашние задания</p>
        <div className="space-y-2 mb-5">
          {hw.map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <span className="font-medium text-gray-800">{h.title}</span>
              <Badge variant={h.status==='checked'?'success':h.status==='submitted'?'warning':h.status==='overdue'?'danger':'default'}>
                {h.status==='assigned'?'Выдано':h.status==='submitted'?'Сдано':h.status==='checked'?'Готово':'Просрочено'}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Btn className="flex-1">Написать</Btn>
          <Btn variant="outline" className="flex-1">Выдать ДЗ</Btn>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function StudentsPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Student|null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [hw, setHw] = useState<Homework[]>([])

  useEffect(() => {
    getTutorStudents().then(setStudents).catch(() => setStudents([]))
    getHomework().then(setHw).catch(() => setHw([]))
  }, [])

  const filtered = students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Ученики</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} активных</p>
        </div>
        <Btn><Plus size={16}/> Добавить ученика</Btn>
      </div>
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yale focus:ring-2 focus:ring-blue-100"/>
      </div>
      {filtered.length === 0
        ? <EmptyState title="Ученики не найдены" sub={students.length === 0 ? 'Пока никто не привязан к вашему кабинету.' : undefined}/>
        : <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(s => <StudentCard key={s.id} s={s} hw={hw} onClick={() => setSelected(s)}/>)}
          </motion.div>}
      <AnimatePresence>
        {selected && <StudentModal s={selected} allHw={hw} onClose={() => setSelected(null)}/>}
      </AnimatePresence>
    </div>
  )
}

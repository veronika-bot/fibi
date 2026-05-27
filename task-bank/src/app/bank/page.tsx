'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronRight, Clock, BookOpen, Zap } from 'lucide-react'
import { Card, Badge, DiffBadge, Button, Input, Select, Skeleton, EmptyState, ProgressBar } from '@/components/ui'
import Link from 'next/link'

const EXAMS = [{ v: '', l: 'Все экзамены' }, { v: 'OGE', l: 'ОГЭ' }, { v: 'EGE_BASE', l: 'ЕГЭ База' }, { v: 'EGE_PROFILE', l: 'ЕГЭ Профиль' }]
const PARTS = [{ v: '', l: 'Часть 1+2' }, { v: '1', l: 'Часть 1' }, { v: '2', l: 'Часть 2' }]
const DIFFS = [{ v: '', l: 'Все уровни' }, { v: '1', l: 'Лёгкий' }, { v: '2', l: 'Средний' }, { v: '3', l: 'Сложный' }]

interface Task { id: string; examType: string; part: number; taskNumber: number; description: string; difficulty: number; estimatedTimeSec?: number; topics: { topic: { name: string } }[] }

const EXAM_LABELS: Record<string, string> = { OGE: 'ОГЭ', EGE_BASE: 'ЕГЭ База', EGE_PROFILE: 'ЕГЭ Профиль' }

export default function BankPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)

  const [examType,   setExamType]   = useState('')
  const [part,       setPart]       = useState('')
  const [difficulty, setDifficulty] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const sp = new URLSearchParams({ page: String(page) })
    if (examType)   sp.set('examType', examType)
    if (part)       sp.set('part', part)
    if (difficulty) sp.set('difficulty', difficulty)
    const r = await fetch(`/api/tasks?${sp}`)
    const data = await r.json()
    setTasks(data.tasks ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, examType, part, difficulty])

  useEffect(() => { load() }, [load])

  const resetPage = () => setPage(1)

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="section-title">Банк заданий</h1>
          <p className="section-sub">{total} заданий · ОГЭ и ЕГЭ по математике</p>
        </div>
        <Link href="/bank/search">
          <Button variant="secondary"><Search size={16} /> Поиск</Button>
        </Link>
      </div>

      {/* Stats chips */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ icon: BookOpen, label: 'Всего заданий', value: total }, { icon: Zap, label: 'Решено сегодня', value: 0 }, { icon: Clock, label: 'Среднее время', value: '4 мин' }].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="flex items-center gap-4 py-4">
            <div className="w-11 h-11 rounded-2xl bg-yale-50 flex items-center justify-center text-yale"><Icon size={20} /></div>
            <div><p className="text-2xl font-black text-yale">{value}</p><p className="text-xs text-gray-500 mt-0.5">{label}</p></div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <Select className="flex-1 min-w-36" value={examType} onChange={e => { setExamType(e.target.value); resetPage() }}>
            {EXAMS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </Select>
          <Select className="flex-1 min-w-32" value={part} onChange={e => { setPart(e.target.value); resetPage() }}>
            {PARTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </Select>
          <Select className="flex-1 min-w-32" value={difficulty} onChange={e => { setDifficulty(e.target.value); resetPage() }}>
            {DIFFS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </Select>
        </div>
      </Card>

      {/* Task grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={<BookOpen size={32} />} title="Заданий не найдено" desc="Попробуй изменить фильтры" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={`${examType}-${part}-${difficulty}-${page}`} className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tasks.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/bank/${t.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="blue">{EXAM_LABELS[t.examType]}</Badge>
                        <Badge color="gray">Ч.{t.part} · №{t.taskNumber}</Badge>
                        {t.topics[0] && <Badge color="blue">{t.topics[0].topic.name}</Badge>}
                      </div>
                      <DiffBadge diff={t.difficulty} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3">{t.description}</p>
                    <div className="flex items-center justify-between">
                      {t.estimatedTimeSec && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> {Math.round(t.estimatedTimeSec / 60)} мин</span>}
                      <span className="ml-auto text-yale text-xs font-bold flex items-center gap-1">Решить <ChevronRight size={12} /></span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page ? 'bg-yale text-white' : 'text-gray-500 hover:bg-yale-50'}`}>
                {p}
              </button>
            )
          })}
          <Button variant="ghost" disabled={page === pages} onClick={() => setPage(p => p + 1)}>→</Button>
        </div>
      )}
    </div>
  )
}

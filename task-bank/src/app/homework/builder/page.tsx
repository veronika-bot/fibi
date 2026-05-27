'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, Trash2, GripVertical, Send, Calendar, BookOpen, Search, Filter, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Card, Badge, DiffBadge, Button, Input, Select, EmptyState } from '@/components/ui'

const TUTOR_ID   = 'demo-tutor'
const STUDENT_ID = 'demo-student'

interface Task { id: string; taskNumber: number; description: string; difficulty: number; topics: { topic: { name: string } }[] }
interface HWTask extends Task { comment: string }

export default function HomeworkBuilderPage() {
  const [tasks,     setTasks]     = useState<Task[]>([])
  const [selected,  setSelected]  = useState<HWTask[]>([])
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [title,     setTitle]     = useState('')
  const [dueDate,   setDueDate]   = useState('')
  const [desc,      setDesc]      = useState('')
  const [examType,  setExamType]  = useState('')
  const [difficulty,setDiff]      = useState('')
  const [search,    setSearch]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const sp = new URLSearchParams()
    if (examType)   sp.set('examType', examType)
    if (difficulty) sp.set('difficulty', difficulty)
    sp.set('limit', '40')
    const r = await fetch(`/api/tasks?${sp}`)
    const data = await r.json()
    setTasks(data.tasks ?? [])
    setLoading(false)
  }, [examType, difficulty])

  useEffect(() => { load() }, [load])

  const addTask = (t: Task) => {
    if (selected.find(s => s.id === t.id)) return
    setSelected(prev => [...prev, { ...t, comment: '' }])
  }
  const removeTask = (id: string) => setSelected(prev => prev.filter(s => s.id !== id))
  const updateComment = (id: string, comment: string) => setSelected(prev => prev.map(s => s.id === id ? { ...s, comment } : s))

  const sendHomework = async () => {
    if (!title.trim() || selected.length === 0) return
    setSending(true)
    await fetch('/api/homework', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId: TUTOR_ID, studentId: STUDENT_ID, title, description: desc || undefined, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined, tasks: selected.map((t, i) => ({ taskId: t.id, comment: t.comment, order: i })) }),
    })
    setSending(false)
    setSent(true)
    setSelected([]); setTitle(''); setDesc(''); setDueDate('')
    setTimeout(() => setSent(false), 3000)
  }

  const filtered = tasks.filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.topics[0]?.topic.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="topbar">
        <div><h1 className="section-title">Homework Builder</h1><p className="section-sub">Составь домашнее задание для ученика</p></div>
        {selected.length > 0 && <Badge color="navy">{selected.length} задан.</Badge>}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Task picker — left 3 cols */}
        <div className="col-span-3 space-y-4">
          <Card className="py-4">
            <div className="flex gap-3 mb-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск задания..." className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm outline-none focus:border-yale transition" />
              </div>
              <Select value={examType} onChange={e => setExamType(e.target.value)} className="w-36">
                <option value="">Все экзамены</option><option value="OGE">ОГЭ</option><option value="EGE_BASE">ЕГЭ База</option><option value="EGE_PROFILE">ЕГЭ Профиль</option>
              </Select>
              <Select value={difficulty} onChange={e => setDiff(e.target.value)} className="w-32">
                <option value="">Уровень</option><option value="1">Лёгкий</option><option value="2">Средний</option><option value="3">Сложный</option>
              </Select>
            </div>
            <p className="text-xs text-gray-500">{filtered.length} заданий</p>
          </Card>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filtered.map(t => {
                const added = !!selected.find(s => s.id === t.id)
                return (
                  <motion.div key={t.id} layout>
                    <Card className={`py-3 cursor-pointer transition-all ${added ? 'border-green-300 bg-green-50/50' : 'hover:border-yale-300 hover:shadow-card-md'}`} onClick={() => added ? removeTask(t.id) : addTask(t)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${added ? 'bg-green-500' : 'bg-gray-100'}`}>
                          {added ? <CheckCircle2 size={14} className="text-white" /> : <Plus size={14} className="text-gray-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{t.description}</p>
                          <div className="flex gap-2 mt-1">
                            {t.topics[0] && <Badge color="blue" className="text-[10px]">{t.topics[0].topic.name}</Badge>}
                            <DiffBadge diff={t.difficulty} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Builder panel — right 2 cols */}
        <div className="col-span-2 space-y-4 sticky top-8">
          <Card>
            <h3 className="font-black text-gray-900 mb-4">Параметры ДЗ</h3>
            <div className="space-y-3">
              <Input placeholder="Название (напр. «Уравнения — тема 3»)" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Комментарий для ученика..." rows={2}
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm resize-none outline-none focus:border-yale transition" />
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm outline-none focus:border-yale transition" />
              </div>
            </div>
          </Card>

          {/* Selected tasks */}
          {selected.length === 0 ? (
            <Card className="py-10 text-center">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Добавь задания слева</p>
            </Card>
          ) : (
            <Card>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Задания ({selected.length})</p>
              <Reorder.Group axis="y" values={selected} onReorder={setSelected} className="space-y-2">
                {selected.map((t, i) => (
                  <Reorder.Item key={t.id} value={t}>
                    <div className="flex items-start gap-2 bg-gray-50 rounded-2xl p-3">
                      <GripVertical size={14} className="text-gray-400 mt-1 flex-shrink-0 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">{t.description.substring(0, 60)}...</p>
                        <input value={t.comment} onChange={e => updateComment(t.id, e.target.value)} placeholder="Комментарий..." className="mt-1.5 w-full text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-yale" />
                      </div>
                      <button onClick={() => removeTask(t.id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </Card>
          )}

          <AnimatePresence>
            {sent && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center text-sm font-bold text-green-700 flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Домашнее задание отправлено!</motion.div>}
          </AnimatePresence>

          <Button className="w-full" onClick={sendHomework} loading={sending} disabled={!title.trim() || selected.length === 0}>
            <Send size={16} /> Отправить ученику
          </Button>
        </div>
      </div>
    </div>
  )
}

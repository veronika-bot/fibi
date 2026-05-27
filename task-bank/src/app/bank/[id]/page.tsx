'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lightbulb, CheckCircle2, XCircle, Lock, ChevronRight, Clock, BookOpen, RotateCcw } from 'lucide-react'
import { Card, Badge, DiffBadge, Button, Input } from '@/components/ui'
import Link from 'next/link'

const USER_ID = 'demo-student' // Replace with auth session

interface SolutionStep { step: string; detail: string; latex?: string }
interface TaskDetail {
  id: string; examType: string; part: number; taskNumber: number
  description: string; difficulty: number; estimatedTimeSec?: number
  topics: { topic: { name: string; slug: string } }[]
  relationsFrom?: { related: { id: string; description: string; difficulty: number } }[]
}

type AttemptState = 'idle' | 'correct' | 'wrong_1' | 'wrong_2' | 'wrong_3'

const XP_TABLE = { 1: 10, 2: 20, 3: 40 }
const EXAM_LABELS: Record<string, string> = { OGE: 'ОГЭ', EGE_BASE: 'ЕГЭ База', EGE_PROFILE: 'ЕГЭ Профиль' }

export default function TaskPage({ params }: { params: { id: string } }) {
  const [task, setTask]           = useState<TaskDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [answer, setAnswer]       = useState('')
  const [state, setState]         = useState<AttemptState>('idle')
  const [submitting, setSub]      = useState(false)
  const [hint, setHint]           = useState<string | null>(null)
  const [partial, setPartial]     = useState<string | null>(null)
  const [solution, setSolution]   = useState<SolutionStep[] | null>(null)
  const [xpEarned, setXp]         = useState(0)
  const [attempts, setAttempts]   = useState(0)
  const [timer, setTimer]         = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch(`/api/tasks/${params.id}`).then(r => r.json()).then(d => { setTask(d); setLoading(false) })
  }, [params.id])

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const submit = async () => {
    if (!answer.trim() || submitting) return
    setSub(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const r = await fetch(`/api/tasks/${params.id}/attempt`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, answer, timeTaken: timer }),
    })
    const data = await r.json()
    setSub(false)
    const num = data.attemptNum as number
    setAttempts(num)
    if (data.isCorrect) { setState('correct'); setXp(data.xpEarned) }
    else {
      setState(num === 1 ? 'wrong_1' : num === 2 ? 'wrong_2' : 'wrong_3')
      if (data.hint)            setHint(data.hint)
      if (data.partialSolution) setPartial(data.partialSolution)
      if (data.fullSolution)    setSolution(data.fullSolution as SolutionStep[])
    }
    if (!data.isCorrect && num < 3) { setAnswer(''); setTimer(0); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-yale border-t-transparent rounded-full animate-spin" /></div>
  if (!task) return null

  const isLocked = state === 'wrong_1' || state === 'wrong_2'
  const isDone   = state === 'correct' || state === 'wrong_3'
  const maxXP    = XP_TABLE[task.difficulty as 1 | 2 | 3] ?? 10

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/bank"><Button variant="ghost" className="px-2 py-2"><ArrowLeft size={18} /></Button></Link>
        <div>
          <h1 className="section-title">Задание {task.taskNumber}</h1>
          <p className="section-sub">{EXAM_LABELS[task.examType]} · {task.topics[0]?.topic.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DiffBadge diff={task.difficulty} />
          <Badge color="gray" className="flex items-center gap-1"><Clock size={11} /> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</Badge>
        </div>
      </div>

      {/* Task card */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge color="blue">{EXAM_LABELS[task.examType]}</Badge>
          <Badge color="gray">Ч.{task.part} · №{task.taskNumber}</Badge>
          {task.topics.map(tt => <Badge key={tt.topic.slug} color="blue">{tt.topic.name}</Badge>)}
          <Badge color="gray" className="ml-auto flex items-center gap-1 text-xs"><Clock size={10} /> {task.estimatedTimeSec ? `${Math.round(task.estimatedTimeSec / 60)} мин` : '—'}</Badge>
        </div>
        <p className="text-base font-semibold text-gray-900 leading-relaxed">{task.description}</p>
      </Card>

      {/* Answer input */}
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div key="input" className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Attempt indicators */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Попытки:</span>
              {[1, 2, 3].map(n => (
                <div key={n} className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors
                  ${attempts >= n ? (state === 'correct' && n === attempts ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600') : 'bg-gray-100 text-gray-400'}`}>{n}</div>
              ))}
              <span className="ml-auto text-xs text-gray-400">Макс. {maxXP} XP</span>
            </div>

            <div className="flex gap-3">
              <Input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Введи ответ..." disabled={submitting} className="flex-1" autoFocus />
              <Button onClick={submit} loading={submitting} disabled={!answer.trim()}>Проверить <ChevronRight size={16} /></Button>
            </div>

            {/* Hints & partial */}
            <AnimatePresence>
              {hint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-lemon-200/60 border border-lemon-300 rounded-2xl p-4 flex items-start gap-3">
                  <Lightbulb size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div><p className="text-xs font-bold text-yellow-800 mb-1">Подсказка</p><p className="text-sm text-yellow-900">{hint}</p></div>
                </motion.div>
              )}
              {partial && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2"><BookOpen size={14} /> Частичное решение</p>
                  <p className="text-sm text-blue-900">{partial}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : state === 'correct' ? (
          <motion.div key="correct" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <p className="text-xl font-black text-green-800 mb-1">Верно!</p>
            <p className="text-sm text-green-600 mb-4">С {attempts === 1 ? 'первой' : attempts === 2 ? 'второй' : 'третьей'} попытки · +{xpEarned} XP</p>
            <div className="flex gap-3 justify-center">
              <Link href="/bank"><Button variant="ghost">← Банк</Button></Link>
              <Link href="/bank"><Button>Следующее →</Button></Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key="wrong" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 flex items-center gap-4">
              <XCircle size={32} className="text-red-500 flex-shrink-0" />
              <div><p className="font-black text-red-800">Все попытки использованы</p><p className="text-sm text-red-600 mt-0.5">Задание добавлено в список ошибок</p></div>
            </div>
            {solution && (
              <Card>
                <p className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={16} className="text-yale" /> Разбор решения</p>
                <div className="space-y-3">
                  {solution.map((s, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-7 h-7 rounded-xl bg-yale text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                      <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{s.step}</p><p className="text-sm text-gray-800">{s.detail}</p></div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <div className="flex gap-3">
              <Link href="/bank/errors"><Button variant="secondary" className="flex-1"><XCircle size={16} /> Мои ошибки</Button></Link>
              <Link href="/bank"><Button className="flex-1">Следующее →</Button></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

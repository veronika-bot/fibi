'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw, BookOpen, TrendingDown, ChevronRight } from 'lucide-react'
import { Card, Badge, DiffBadge, Button, EmptyState, ProgressBar } from '@/components/ui'
import Link from 'next/link'

const USER_ID = 'demo-student'

interface ErrorTask { taskId: string; attempts: number; lastAttemptAt: string; task: { id: string; description: string; difficulty: number; taskNumber: number; topics: { topic: { name: string } }[] } }

export default function ErrorsPage() {
  const [errors, setErrors]     = useState<ErrorTask[]>([])
  const [loading, setLoading]   = useState(true)
  const [weakTopics, setWeak]   = useState<{ name: string; accuracy: number; count: number }[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/tasks/errors?userId=${USER_ID}`).then(r => r.json()),
      fetch(`/api/analytics?userId=${USER_ID}`).then(r => r.json()),
    ]).then(([err, analytics]) => {
      setErrors(err ?? [])
      setWeak(analytics?.weakTopics?.map((t: any) => ({ name: t.topicName, accuracy: t.accuracy, count: t.total - t.solved })) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="section-title">Ошибки</h1>
          <p className="section-sub">Задания с неверными ответами · работа над ошибками</p>
        </div>
      </div>

      {/* Weak topics heatmap */}
      {weakTopics.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown size={18} className="text-red-500" />
            <h2 className="font-black text-gray-900">Проблемные темы</h2>
          </div>
          <div className="space-y-3">
            {weakTopics.map(t => (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-800">{t.name}</span>
                  <span className={`font-bold text-sm ${t.accuracy < 40 ? 'text-red-600' : 'text-yellow-600'}`}>{t.accuracy}%</span>
                </div>
                <ProgressBar value={t.accuracy} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error list */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : errors.length === 0 ? (
        <EmptyState icon={<AlertCircle size={32} />} title="Ошибок пока нет" desc="Решай задания из банка — ошибки появятся здесь" action={<Link href="/bank"><Button>Перейти к банку</Button></Link>} />
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">{errors.length} заданий с ошибками</p>
          <div className="grid grid-cols-2 gap-4">
            {errors.map((e, i) => (
              <motion.div key={e.taskId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/bank/${e.taskId}`}>
                  <Card hover className="border-l-4 border-l-red-400">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2 flex-wrap">
                        {e.task.topics[0] && <Badge color="blue">{e.task.topics[0].topic.name}</Badge>}
                        <DiffBadge diff={e.task.difficulty} />
                      </div>
                      <Badge color="red" className="flex items-center gap-1"><AlertCircle size={10} /> {e.attempts} поп.</Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3">{e.task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(e.lastAttemptAt).toLocaleDateString('ru')}</span>
                      <span className="text-yale text-xs font-bold flex items-center gap-1"><RotateCcw size={11} /> Повторить</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Clock, Upload, Eye, Edit2, AlertTriangle } from 'lucide-react'
import { Card, Badge, DiffBadge, Button, Select, EmptyState } from '@/components/ui'

interface AdminTask { id: string; examType: string; part: number; taskNumber: number; description: string; difficulty: number; verificationStatus: string; source: string; createdAt: string; topics: { topic: { name: string } }[] }

const STATUS_COLORS: Record<string, string> = { VERIFIED: 'green', PENDING: 'yellow', REJECTED: 'red' }
const STATUS_LABELS: Record<string, string> = { VERIFIED: 'Проверено', PENDING: 'На проверке', REJECTED: 'Отклонено' }
const EXAM_LABELS: Record<string, string> = { OGE: 'ОГЭ', EGE_BASE: 'ЕГЭ База', EGE_PROFILE: 'ЕГЭ Профиль' }

export default function AdminPage() {
  const [tasks,    setTasks]   = useState<AdminTask[]>([])
  const [filter,   setFilter]  = useState('PENDING')
  const [loading,  setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tasks/admin?status=${filter}`).then(r => r.json()).then(d => { setTasks(d.tasks ?? []); setLoading(false) })
  }, [filter])

  const verify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setUpdating(id)
    await fetch(`/api/tasks/${id}/verify`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setTasks(prev => prev.filter(t => t.id !== id))
    setUpdating(null)
  }

  const stats = [
    { label: 'На проверке', value: '—', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Проверено', value: '—', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Отклонено', value: '—', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Всего', value: '—', icon: ShieldCheck, color: 'text-yale', bg: 'bg-yale-50' },
  ]

  return (
    <div>
      <div className="topbar">
        <div><h1 className="section-title">Модерация</h1><p className="section-sub">Проверка и управление заданиями</p></div>
        <Button><Upload size={16} /> Импортировать PDF</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="py-4 text-center">
            <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-2`}><Icon size={18} className={color} /></div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['PENDING', 'VERIFIED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${filter === s ? 'bg-yale text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-yale'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={32} />} title="Задания не найдены" desc="Попробуй другой фильтр" />
      ) : (
        <div className="space-y-3">
          {tasks.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge color={STATUS_COLORS[t.verificationStatus] as any}>{STATUS_LABELS[t.verificationStatus]}</Badge>
                      <Badge color="blue">{EXAM_LABELS[t.examType]}</Badge>
                      <Badge color="gray">Ч.{t.part} · №{t.taskNumber}</Badge>
                      <DiffBadge diff={t.difficulty} />
                      {t.topics[0] && <Badge color="blue">{t.topics[0].topic.name}</Badge>}
                      <Badge color="gray">{t.source}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString('ru')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" className="px-2 py-2"><Eye size={16} /></Button>
                    <Button variant="ghost" className="px-2 py-2"><Edit2 size={16} /></Button>
                    {filter === 'PENDING' && (
                      <>
                        <Button variant="secondary" className="text-green-600 border-green-300 hover:bg-green-50" onClick={() => verify(t.id, 'VERIFIED')} loading={updating === t.id}>
                          <CheckCircle2 size={15} /> Принять
                        </Button>
                        <Button variant="danger" onClick={() => verify(t.id, 'REJECTED')} loading={updating === t.id}>
                          <XCircle size={15} /> Отклонить
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

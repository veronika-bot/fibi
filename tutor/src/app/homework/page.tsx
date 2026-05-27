'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import { Card, SectionTitle, Badge, Avatar, Btn, HWStatusBadge } from '@/components/ui'
import { MOCK_HW } from '@/lib/mock'

const FILTERS = ['Все', 'Выдано', 'Сдано', 'Проверено', 'Просрочено']
const STATUS_MAP: Record<string, string> = { 'Выдано':'assigned', 'Сдано':'submitted', 'Проверено':'checked', 'Просрочено':'overdue' }

export default function HomeworkPage() {
  const [filter, setFilter] = useState('Все')
  const filtered = filter === 'Все' ? MOCK_HW : MOCK_HW.filter(h => h.status === STATUS_MAP[filter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Домашние задания</h1>
          <p className="text-gray-500 text-sm mt-1">{MOCK_HW.length} заданий всего</p>
        </div>
        <Btn><Plus size={16}/> Создать ДЗ</Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Активных', value: MOCK_HW.filter(h=>h.status==='assigned').length, icon:<Circle size={18}/>, color:'text-blue-600' },
          { label:'Сдано', value: MOCK_HW.filter(h=>h.status==='submitted').length, icon:<Clock size={18}/>, color:'text-amber-600' },
          { label:'Проверено', value: MOCK_HW.filter(h=>h.status==='checked').length, icon:<CheckCircle2 size={18}/>, color:'text-green-600' },
          { label:'Просрочено', value: MOCK_HW.filter(h=>h.status==='overdue').length, icon:<AlertCircle size={18}/>, color:'text-red-500' },
        ].map(s => (
          <Card key={s.label} className="flex items-center gap-3">
            <div className={`${s.color}`}>{s.icon}</div>
            <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter===f ? 'bg-yale text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* HW list */}
      <div className="space-y-3">
        {filtered.map((hw, i) => (
          <motion.div key={hw.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
            <Card hover className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar initials={hw.studentName.split(' ').map(n=>n[0]).join('')} size="md"/>
                <div>
                  <p className="font-bold text-gray-900">{hw.title}</p>
                  <p className="text-xs text-gray-400">{hw.studentName} · {hw.tasks} заданий · до {hw.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hw.grade && <span className="text-sm font-bold text-green-700">{hw.grade}/10</span>}
                <HWStatusBadge status={hw.status}/>
                {hw.status === 'submitted' && <Btn>Проверить</Btn>}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legal disclaimer */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          <strong>Важно:</strong> Платформа ФИБИ не участвует в оплате уроков, не устанавливает расписание и не берёт комиссий с занятий. Финансовые договорённости между репетитором и учеником регулируются самостоятельно.
        </p>
      </div>
    </div>
  )
}

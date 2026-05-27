'use client'
import { motion } from 'framer-motion'
import { Users, ClipboardList, FileCheck, TrendingUp, Calendar, MessageSquare, Zap, Star } from 'lucide-react'
import { Card, KPICard, SectionTitle, Badge, Avatar, Btn } from '@/components/ui'
import { MOCK_TUTOR, MOCK_STUDENTS, MOCK_HW, MOCK_CHATS, MOCK_LESSONS, ACTIVITY_DATA } from '@/lib/mock'

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

function ActivityBar({ value, max, day }: { value: number; max: number; day: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-semibold text-gray-700">{value}</span>
      <div className="w-8 bg-gray-100 rounded-full overflow-hidden" style={{ height: 64 }}>
        <motion.div
          initial={{ height: 0 }} animate={{ height: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="w-full bg-gradient-to-t from-yale to-yale-light rounded-full mt-auto"
          style={{ marginTop: `${100 - pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{day}</span>
    </div>
  )
}

export default function HomePage() {
  const maxChecks = Math.max(...ACTIVITY_DATA.map(d => d.checks))
  const pendingHW = MOCK_HW.filter(h => h.status === 'submitted').length
  const unreadChats = MOCK_CHATS.reduce((s, c) => s + c.unread, 0)

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Добро пожаловать, {MOCK_TUTOR.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">Сегодня {new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="gold">
            <Star size={11} strokeWidth={2}/> #{MOCK_TUTOR.chartRank} в чарте
          </Badge>
          <Badge variant="default">
            <Zap size={11}/> {MOCK_TUTOR.streakDays} дней подряд
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Учеников" value={MOCK_STUDENTS.length} sub="активных" trend={+25}
          icon={<Users size={20} strokeWidth={1.8}/>}/>
        <KPICard label="Активных ДЗ" value={MOCK_HW.filter(h=>h.status==='assigned').length} sub="на проверку скоро"
          icon={<ClipboardList size={20} strokeWidth={1.8}/>}/>
        <KPICard label="На проверке" value={pendingHW} sub="ждут оценки"
          icon={<FileCheck size={20} strokeWidth={1.8}/>}/>
        <KPICard label="Проверок" value={MOCK_TUTOR.checksTotal} sub="всего в чарте" trend={+12}
          icon={<TrendingUp size={20} strokeWidth={1.8}/>}/>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Activity chart */}
        <Card className="col-span-2">
          <SectionTitle>Активность за неделю</SectionTitle>
          <div className="flex items-end justify-between px-2">
            {ACTIVITY_DATA.map(d => <ActivityBar key={d.day} value={d.checks} max={maxChecks} day={d.day}/>)}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm">
            <div><span className="text-gray-400">Всего проверок:</span> <span className="font-bold">89</span></div>
            <div><span className="text-gray-400">Ср. в день:</span> <span className="font-bold">12.7</span></div>
            <div><span className="text-gray-400">Активных учеников:</span> <span className="font-bold">4</span></div>
          </div>
        </Card>

        {/* Upcoming lessons */}
        <Card>
          <SectionTitle action={<Btn variant="ghost" className="text-xs py-1 px-3">Расписание</Btn>}>
            <div className="flex items-center gap-2">
              <Calendar size={16} strokeWidth={1.8} className="text-yale"/>Ближайшие уроки
            </div>
          </SectionTitle>
          <div className="space-y-3">
            {MOCK_LESSONS.map(l => (
              <motion.div key={l.id} whileHover={{ x: 2 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center min-w-[44px]">
                  <p className="text-xs text-gray-400 font-medium">{l.date}</p>
                  <p className="text-sm font-black text-yale">{l.time}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{l.studentName}</p>
                  <p className="text-xs text-gray-400 truncate">{l.topic}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent HW */}
        <Card className="col-span-2">
          <SectionTitle action={<a href="/homework" className="text-xs text-yale font-semibold hover:underline">Все ДЗ</a>}>
            Домашние задания
          </SectionTitle>
          <div className="space-y-2">
            {MOCK_HW.slice(0,4).map(hw => (
              <motion.div key={hw.id} whileHover={{ x: 2 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={hw.studentName.split(' ').map(n=>n[0]).join('')} size="sm"/>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{hw.title}</p>
                    <p className="text-xs text-gray-400">{hw.studentName} · до {hw.dueDate}</p>
                  </div>
                </div>
                <Badge variant={hw.status==='submitted'?'warning':hw.status==='checked'?'success':hw.status==='overdue'?'danger':'default'}>
                  {hw.status==='assigned'?'Выдано':hw.status==='submitted'?'Сдано':hw.status==='checked'?'Готово':'Просрочено'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Chats */}
        <Card>
          <SectionTitle action={<a href="/chats" className="text-xs text-yale font-semibold hover:underline">Открыть</a>}>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} strokeWidth={1.8} className="text-yale"/>
              Чаты
              {unreadChats > 0 && (
                <span className="bg-yale text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadChats}</span>
              )}
            </div>
          </SectionTitle>
          <div className="space-y-3">
            {MOCK_CHATS.map(c => (
              <motion.div key={c.id} whileHover={{ x: 2 }}
                className="flex items-center gap-3 cursor-pointer">
                <Avatar initials={c.avatar} size="sm" online={c.online}/>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMsg}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{c.time}</p>
                  {c.unread > 0 && <span className="bg-yale text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <SectionTitle>Быстрые действия</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href:'/homework?new=1', icon: <ClipboardList size={20}/>, label: 'Выдать ДЗ' },
            { href:'/checking',       icon: <FileCheck size={20}/>,    label: 'Проверить работу' },
            { href:'/students?add=1', icon: <Users size={20}/>,        label: 'Добавить ученика' },
            { href:'/chats',          icon: <MessageSquare size={20}/>, label: 'Написать' },
          ].map(a => (
            <a key={a.href} href={a.href}>
              <motion.div whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(13,59,102,0.12)' }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-all cursor-pointer">
                <div className="text-yale">{a.icon}</div>
                <p className="text-xs font-semibold text-gray-700 text-center">{a.label}</p>
              </motion.div>
            </a>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

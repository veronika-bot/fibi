'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Award, TrendingUp, Edit3, Check, X } from 'lucide-react'
import { Card, SectionTitle, Badge, Btn } from '@/components/ui'
import { MOCK_TUTOR, MOCK_STUDENTS } from '@/lib/mock'

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(MOCK_TUTOR.name)
  const [bio, setBio] = useState(MOCK_TUTOR.bio)
  const [price, setPrice] = useState('2 500')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">Профиль репетитора</h1>
        <Btn variant={editing ? 'outline' : 'primary'} onClick={() => setEditing(!editing)}>
          {editing ? <><X size={15}/> Отмена</> : <><Edit3 size={15}/> Редактировать</>}
        </Btn>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main profile card */}
        <div className="col-span-1 space-y-4">
          <Card className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yale to-yale-light flex items-center justify-center text-white text-3xl font-black mx-auto">
                {MOCK_TUTOR.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Основатель
              </span>
            </div>
            {editing
              ? <input value={name} onChange={e=>setName(e.target.value)}
                  className="text-xl font-black text-center w-full border-b border-yale focus:outline-none mb-2"/>
              : <h2 className="text-xl font-black text-gray-900">{name}</h2>}
            <p className="text-gray-500 text-sm">{MOCK_TUTOR.subject}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
              {[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i<4?'currentColor':'none'}/>)}
              <span className="text-sm font-bold text-gray-700 ml-1">{MOCK_TUTOR.rating}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              {[['Стаж', MOCK_TUTOR.exp+'л'], ['Отзывов', MOCK_TUTOR.reviews+''], ['#'+MOCK_TUTOR.chartRank, 'чарт']].map(([v,l]) => (
                <div key={l}><p className="font-black text-gray-900 text-lg">{v}</p><p className="text-xs text-gray-400">{l}</p></div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-gray-700 mb-3">Стоимость урока</p>
            {editing
              ? <div className="flex items-center gap-2">
                  <input value={price} onChange={e=>setPrice(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yale"/>
                  <span className="text-sm text-gray-500">₽/ч</span>
                </div>
              : <p className="text-2xl font-black text-gray-900">{price} <span className="text-sm font-normal text-gray-400">₽/ч</span></p>}
            <p className="text-xs text-gray-400 mt-2">Оплата напрямую. Платформа не участвует в расчётах.</p>
          </Card>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-4">
          <Card>
            <SectionTitle>О себе</SectionTitle>
            {editing
              ? <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yale resize-none"/>
              : <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>}
          </Card>

          <Card>
            <SectionTitle>Достижения</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:<Award size={20}/>, label:'Основатель', desc:'Первый в платформе' },
                { icon:<TrendingUp size={20}/>, label:'Топ-2', desc:'В чарте репетиторов' },
                { icon:<Star size={20}/>, label:'312 проверок', desc:'Второй части' },
              ].map(a => (
                <div key={a.label} className="bg-gradient-to-br from-blue-50 to-lemon rounded-xl p-3 text-center">
                  <div className="text-yale mb-2 flex justify-center">{a.icon}</div>
                  <p className="text-sm font-bold text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Результаты учеников</SectionTitle>
            <div className="space-y-3">
              {MOCK_STUDENTS.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yale text-white flex items-center justify-center text-xs font-bold">{s.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.exam}</p>
                    </div>
                  </div>
                  <Badge variant={s.score>=70?'success':s.score>=50?'warning':'danger'}>{s.score}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          {editing && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex gap-2">
              <Btn className="flex-1" onClick={() => setEditing(false)}><Check size={16}/> Сохранить изменения</Btn>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

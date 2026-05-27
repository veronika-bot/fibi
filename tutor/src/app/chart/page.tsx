'use client'
import { motion } from 'framer-motion'
import { Crown, Star, Shield, TrendingUp } from 'lucide-react'
import { Card, SectionTitle, Badge, Avatar } from '@/components/ui'
import { MOCK_CHART, MOCK_TUTOR } from '@/lib/mock'

export default function ChartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Чарт репетиторов</h1>
        <p className="text-gray-500 text-sm mt-1">Рейтинг по количеству проверок второй части</p>
      </div>

      {/* Your rank */}
      <Card className="bg-gradient-to-r from-yale to-yale-light text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
              #{MOCK_TUTOR.chartRank}
            </div>
            <div>
              <p className="text-white/70 text-sm">Ваше место в чарте</p>
              <p className="font-black text-2xl">{MOCK_TUTOR.name} {MOCK_TUTOR.lastName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Проверок</p>
            <p className="font-black text-3xl">{MOCK_TUTOR.checksTotal}</p>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card>
        <SectionTitle>Таблица лидеров</SectionTitle>
        <div className="space-y-3">
          {MOCK_CHART.map((r, i) => {
            const isFounder = r.badge === 'founder'
            const isMe = r.name === `${MOCK_TUTOR.name} ${MOCK_TUTOR.lastName}`
            return (
              <motion.div key={r.rank}
                initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isMe ? 'bg-blue-50 border-2 border-yale' : 'bg-gray-50 hover:bg-gray-100'}`}>

                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  {r.rank === 1 ? <Crown size={22} className="text-amber-400"/>
                  : r.rank === 2 ? <Star size={22} className="text-gray-400"/>
                  : r.rank === 3 ? <Shield size={20} className="text-amber-700"/>
                  : <span className="text-gray-400 font-bold text-lg">#{r.rank}</span>}
                </div>

                <Avatar initials={r.avatar} size="md"/>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{r.name}</p>
                    {isFounder && (
                      <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-300 text-white px-2 py-0.5 rounded-full font-semibold">
                        Основатель
                      </span>
                    )}
                    {isMe && <span className="text-xs bg-yale text-white px-2 py-0.5 rounded-full font-semibold">Вы</span>}
                  </div>
                  {/* Score bar */}
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden w-48">
                    <motion.div initial={{ width:0 }} animate={{ width:`${r.score}%` }}
                      transition={{ delay: 0.3 + i*0.07, duration:0.8 }}
                      className={`h-full rounded-full ${isFounder ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-yale to-yale-light'}`}/>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-black text-gray-900 text-lg">{r.checks}</p>
                  <p className="text-xs text-gray-400">проверок</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <Card className="bg-lemon border border-amber-100">
        <div className="flex items-start gap-3">
          <TrendingUp size={20} className="text-amber-700 mt-0.5 flex-shrink-0"/>
          <div>
            <p className="font-bold text-amber-900">Как повысить место в чарте?</p>
            <p className="text-sm text-amber-800 mt-1">Проверяйте работы учеников по второй части. Каждая проверка с развёрнутым комментарием увеличивает ваш счёт. Сохраняйте типичные ошибки в библиотеку — это учитывается отдельно.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

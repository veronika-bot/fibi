'use client'
import { motion } from 'framer-motion'
import { Card, EmptyState } from '@/components/ui'

const TITLES: Record<string, [string, string]> = {
  courses: ['Курсы', 'Учебные материалы: ОГЭ, ЕГЭ База, ЕГЭ Профиль'],
  checking: ['Проверка', 'Проверка работ второй части'],
  bank: ['Банк заданий', 'База из 42+ заданий ОГЭ'],
  subscription: ['Подписка', 'Управление тарифом'],
}

export default function Page() {
  const [title, sub] = TITLES['courses']
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">{sub}</p>
      </div>
      <Card>
        <EmptyState
          title="Раздел в разработке"
          sub="Этот раздел скоро будет доступен. Мы работаем над ним."
        />
      </Card>
    </motion.div>
  )
}

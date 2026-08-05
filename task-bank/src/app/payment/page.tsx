'use client'

import { useState } from 'react'
import { CheckCircle, Zap, BookOpen, Users, Shield, ArrowRight, Loader2 } from 'lucide-react'

const PLANS = [
  {
    id: 'FREE',
    name: 'Бесплатно',
    price: 0,
    period: 'навсегда',
    color: 'border-gray-200',
    features: [
      'Стартовый доступ к платформе',
      'Часть заданий из банка',
      'Базовый прогресс и серии',
      'Пробные подсказки ИИ',
    ],
    disabled: ['Полный банк заданий', 'Персональный план на год'],
    cta: 'Текущий тариф',
    isCurrent: true,
  },
  {
    id: 'SELF_STUDY',
    name: 'Самостоятельная',
    price: 679,
    period: 'в месяц',
    color: 'border-[#0D3B66]',
    badge: 'Популярный',
    features: [
      'Полный банк заданий',
      'Персональный план на год',
      'ИИ-помощник без ограничений',
      'Полная карта знаний',
      'Демоварианты и решения',
      'Материалы для самоподготовки',
    ],
    cta: 'Выбрать тариф',
    isCurrent: false,
  },
  {
    id: 'WITH_TUTOR',
    name: 'С репетитором',
    price: null,
    period: 'стоимость занятия',
    color: 'border-gray-200',
    features: [
      'Всё из «Самостоятельной»',
      'Занятия с проверенным репетитором',
      'Оплата безопасно через ФИБИ',
      'Проверка задач 2-й части',
      'Индивидуальный план занятий',
    ],
    cta: 'Найти репетитора',
    isCurrent: false,
    noCheckout: true,
  },
]

export default function PaymentPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  // In production: get userId from session (next-auth)
  const userId = 'demo-user-id'

  async function handleSubscribe(planId: string) {
    if (planId === 'FREE' || planId === 'WITH_TUTOR') return
    setLoading(planId)
    setError(null)

    try {
      const res = await fetch('/api/payment/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId, userId }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? 'Ошибка при создании платежа')

      if (data.confirmUrl) {
        window.location.href = data.confirmUrl
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fdf8ed] to-[#f8f0d0] py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#0D3B66]/10 text-[#0D3B66] rounded-full px-4 py-1.5 text-sm font-bold mb-4">
            <Zap className="w-4 h-4" /> Тарифы ФИБИ
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Выбери план подготовки
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Начни бесплатно — перейди на полный доступ, когда будешь готов
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-7 border-2 ${plan.color} ${
                plan.badge ? 'shadow-2xl shadow-[#0D3B66]/10' : 'shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D3B66] text-white text-xs font-bold rounded-full px-4 py-1">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-[#0D3B66]/60" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{plan.name}</span>
                </div>
                {plan.price === null ? (
                  <div className="text-2xl font-bold text-gray-900 mt-2">По стоимости занятия</div>
                ) : plan.price === 0 ? (
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">0 ₽</div>
                ) : (
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price} ₽</span>
                    <span className="text-gray-400 mb-1">{plan.period}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#0D3B66] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.disabled?.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400 line-through">
                    <CheckCircle className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.isCurrent || loading === plan.id}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-sm transition-all
                  ${plan.isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : plan.badge
                    ? 'bg-[#0D3B66] text-white hover:bg-[#0a2f50] shadow-lg shadow-[#0D3B66]/25 hover:-translate-y-0.5'
                    : 'bg-[#FAF0CA] text-[#0D3B66] hover:bg-[#f0e28a] border border-[#0D3B66]/10'
                  }`}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {plan.cta}
                    {!plan.isCurrent && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield,  text: 'Безопасная оплата через YooKassa' },
            { icon: Users,   text: 'Защита ученика и репетитора' },
            { icon: Zap,     text: 'Отмена подписки в любой момент' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-gray-100">
              <Icon className="w-5 h-5 text-[#0D3B66] flex-shrink-0" />
              <span className="text-sm text-gray-600">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

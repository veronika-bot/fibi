'use client'

import { useEffect, useState } from 'react'
import { Wallet, Clock, TrendingUp, ArrowDownCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

interface Balance {
  availableRub: string
  pendingRub: string
  totalRub: string
  available: number
  recentTransactions: {
    id: string; type: string; amountRub: string; status: string; note: string | null; date: string; label: string
  }[]
}

interface Payout {
  id: string; amountRub: string; status: string; bankCard: string | null; date: string; failReason: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Ожидает',    color: 'bg-amber-100 text-amber-700' },
  PROCESSING: { label: 'В процессе', color: 'bg-blue-100 text-blue-700' },
  COMPLETED:  { label: 'Выплачено',  color: 'bg-emerald-100 text-emerald-700' },
  FAILED:     { label: 'Ошибка',     color: 'bg-red-100 text-red-700' },
}

const TYPE_LABELS: Record<string, string> = {
  TUTOR_CREDIT: 'Зачисление за занятие',
  PAYOUT:       'Вывод средств',
  CHARGE:       'Платёж',
  PLATFORM_FEE: 'Комиссия платформы',
  REFUND:       'Возврат',
}

export default function TutorEarningsPage() {
  // In production: get tutorId from session
  const tutorId = 'demo-tutor-id'

  const [balance, setBalance]       = useState<Balance | null>(null)
  const [payouts, setPayouts]       = useState<Payout[]>([])
  const [loading, setLoading]       = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [withdrawMsg, setWithdrawMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [balRes, payRes] = await Promise.all([
        fetch(`/api/tutor/balance?tutorId=${tutorId}`),
        fetch(`/api/tutor/withdraw?tutorId=${tutorId}`),
      ])
      setBalance(await balRes.json())
      const pd = await payRes.json()
      setPayouts(pd.payouts ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseInt(withdrawAmt)
    if (!amt || amt < 100) return

    setWithdrawing(true)
    setWithdrawMsg(null)
    try {
      const res  = await fetch('/api/tutor/withdraw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tutorId, amountRub: amt }),
      })
      const data = await res.json()
      if (res.ok) {
        setWithdrawMsg({ ok: true,  text: data.message })
        setWithdrawAmt('')
        load()
      } else {
        setWithdrawMsg({ ok: false, text: data.error ?? 'Ошибка вывода' })
      }
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#0D3B66] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Мой заработок</h1>
            <p className="text-gray-500 text-sm mt-0.5">Баланс и история выплат</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0D3B66] rounded-3xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3 opacity-70">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Доступно</span>
            </div>
            <div className="text-3xl font-extrabold">{balance?.availableRub ?? '0 ₽'}</div>
            <div className="text-xs mt-1 opacity-60">Готово к выводу</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">В ожидании</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-800">{balance?.pendingRub ?? '0 ₽'}</div>
            <div className="text-xs text-gray-400 mt-1">Ожидает подтверждения занятия</div>
          </div>

          <div className="bg-[#FAF0CA] rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3" style={{ color: '#0D3B66', opacity: 0.7 }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Всего заработано</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: '#0D3B66' }}>{balance?.totalRub ?? '0 ₽'}</div>
            <div className="text-xs mt-1" style={{ color: '#0D3B66', opacity: 0.5 }}>За всё время</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Withdraw form */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">Вывести средства</h2>
            <p className="text-sm text-gray-500 mb-5">Минимальная сумма вывода: 100 ₽. Средства поступят в течение 24 часов.</p>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Сумма вывода (₽)</label>
                <input
                  type="number"
                  min={100}
                  max={Math.floor((balance?.available ?? 0) / 100)}
                  value={withdrawAmt}
                  onChange={e => setWithdrawAmt(e.target.value)}
                  placeholder="Например, 3000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D3B66] transition-colors"
                />
              </div>

              {withdrawMsg && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                  withdrawMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {withdrawMsg.ok
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    : <XCircle    className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  {withdrawMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawing || !withdrawAmt || parseInt(withdrawAmt) < 100}
                className="w-full flex items-center justify-center gap-2 bg-[#0D3B66] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#0a2f50] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowDownCircle className="w-4 h-4" />
                    Вывести
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Последние операции</h2>
            {!balance?.recentTransactions?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">Операций пока нет</p>
            ) : (
              <div className="space-y-3">
                {balance.recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {TYPE_LABELS[t.type] ?? t.type}
                      </div>
                      {t.note && <div className="text-xs text-gray-400 truncate">{t.note}</div>}
                      <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div className={`text-sm font-bold ml-3 ${
                      t.type === 'TUTOR_CREDIT' ? 'text-emerald-600' : 'text-gray-700'
                    }`}>
                      {t.type === 'TUTOR_CREDIT' ? '+' : ''}{t.amountRub}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payout history */}
        {payouts.length > 0 && (
          <div className="mt-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">История выплат</h2>
            <div className="space-y-3">
              {payouts.map(p => {
                const s = STATUS_LABELS[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{p.amountRub}</div>
                      {p.bankCard && <div className="text-xs text-gray-400">•••• {p.bankCard.slice(-4)}</div>}
                      <div className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      {p.failReason && <span className="text-xs text-red-500">{p.failReason}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

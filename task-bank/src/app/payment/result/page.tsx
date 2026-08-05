'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'pending' | 'failed'

export default function PaymentResultPage() {
  const params    = useSearchParams()
  const paymentId = params.get('paymentId')
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!paymentId) { setStatus('failed'); return }
    // Poll payment status (YooKassa may take a few seconds to confirm)
    let attempts = 0
    const poll = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch(`/api/payment/history?userId=demo-user-id`)
        const data = await res.json()
        const p    = data.payments?.find((x: { id: string; status: string }) => x.id === paymentId)

        if (p?.status === 'SUCCEEDED') { setStatus('success'); clearInterval(poll) }
        else if (p?.status === 'CANCELLED') { setStatus('failed'); clearInterval(poll) }
        else if (attempts >= 10) { setStatus('pending'); clearInterval(poll) }
      } catch { /* ignore */ }
    }, 1500)

    return () => clearInterval(poll)
  }, [paymentId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fdf8ed] to-[#f8f0d0] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-[#0D3B66] animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Проверяем платёж…</h2>
            <p className="text-gray-500 text-sm">Это займёт несколько секунд</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-5" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Оплата прошла!</h2>
            <p className="text-gray-500 mb-8">Тариф активирован. Полный доступ уже открыт.</p>
            <Link href="/bank"
              className="inline-flex items-center gap-2 bg-[#0D3B66] text-white rounded-2xl px-6 py-3.5 font-bold hover:bg-[#0a2f50] transition-all">
              Начать подготовку <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Платёж обрабатывается</h2>
            <p className="text-gray-500 mb-6 text-sm">
              YooKassa ещё не подтвердила платёж. Обычно это занимает 1–5 минут.
              Как только всё пройдёт — тариф активируется автоматически.
            </p>
            <Link href="/bank" className="text-[#0D3B66] font-semibold hover:underline text-sm">
              Перейти в банк заданий →
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-5" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Платёж отменён</h2>
            <p className="text-gray-500 mb-8">Средства не списаны. Попробуй снова.</p>
            <Link href="/payment"
              className="inline-flex items-center gap-2 bg-[#0D3B66] text-white rounded-2xl px-6 py-3.5 font-bold hover:bg-[#0a2f50] transition-all">
              Попробовать снова <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

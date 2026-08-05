'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Btn } from '@/components/ui'
import { login } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await login(email, password)
      if (user.role !== 'TUTOR') {
        setError('Этот кабинет доступен только репетиторам.')
        setLoading(false)
        return
      }
      router.replace('/')
    } catch {
      setError('Неверный email или пароль.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Кабинет репетитора</h1>
        <p className="text-sm text-gray-500 mb-6">Войдите в аккаунт ФИБИ</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yale"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Пароль</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yale"/>
          </div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? 'Входим…' : 'Войти'}
          </Btn>
        </form>
      </Card>
    </div>
  )
}

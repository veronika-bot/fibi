/**
 * YooKassa REST API wrapper (v3)
 * Docs: https://yookassa.ru/developers/api
 * Auth: HTTP Basic — shopId:secretKey
 */

const BASE = 'https://api.yookassa.ru/v3'
const SHOP_ID   = process.env.YOOKASSA_SHOP_ID   ?? ''
const SECRET    = process.env.YOOKASSA_SECRET_KEY ?? ''
export const COMMISSION = parseFloat(process.env.PLATFORM_COMMISSION ?? '0.20')

function auth() {
  return 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET}`).toString('base64')
}

function idempotenceKey() {
  return crypto.randomUUID()
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: auth(),
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`YooKassa ${res.status}: ${JSON.stringify(err)}`)
  }

  return res.json() as Promise<T>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type YKPaymentStatus =
  | 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'

export interface YKPayment {
  id: string
  status: YKPaymentStatus
  amount: { value: string; currency: string }
  confirmation?: { type: string; confirmation_url: string }
  metadata?: Record<string, string>
  paid: boolean
  created_at: string
}

export interface YKPayout {
  id: string
  status: 'pending' | 'succeeded' | 'canceled'
  amount: { value: string; currency: string }
  created_at: string
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface CreatePaymentParams {
  amountKopecks: number
  description: string
  returnUrl: string
  metadata?: Record<string, string>
  capture?: boolean   // false = two-step (capture later)
}

export async function createPayment(p: CreatePaymentParams): Promise<YKPayment> {
  return request<YKPayment>('POST', '/payments', {
    amount: {
      value: (p.amountKopecks / 100).toFixed(2),
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      return_url: p.returnUrl,
    },
    capture: p.capture ?? true,
    description: p.description,
    metadata: p.metadata ?? {},
  })
}

export async function capturePayment(paymentId: string, amountKopecks: number): Promise<YKPayment> {
  return request<YKPayment>('POST', `/payments/${paymentId}/capture`, {
    amount: { value: (amountKopecks / 100).toFixed(2), currency: 'RUB' },
  })
}

export async function cancelPayment(paymentId: string): Promise<YKPayment> {
  return request<YKPayment>('POST', `/payments/${paymentId}/cancel`, {})
}

export async function getPayment(paymentId: string): Promise<YKPayment> {
  return request<YKPayment>('GET', `/payments/${paymentId}`)
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export interface CreatePayoutParams {
  amountKopecks: number
  /** YooKassa payout token — obtained when tutor links their card */
  payoutToken: string
  description?: string
  metadata?: Record<string, string>
}

export async function createPayout(p: CreatePayoutParams): Promise<YKPayout> {
  return request<YKPayout>('POST', '/payouts', {
    amount: { value: (p.amountKopecks / 100).toFixed(2), currency: 'RUB' },
    payout_destination_data: {
      type: 'bank_card',
      card: { number: p.payoutToken }, // in production: use saved payment method token
    },
    description: p.description ?? 'Выплата репетитору ФИБИ',
    metadata: p.metadata ?? {},
  })
}

// ─── Business logic helpers ───────────────────────────────────────────────────

/** Calculates what the tutor receives after platform commission */
export function splitPayment(totalKopecks: number) {
  const fee        = Math.round(totalKopecks * COMMISSION)
  const tutorShare = totalKopecks - fee
  return { fee, tutorShare }
}

/** Formats kopecks as "679 ₽" */
export function formatRub(kopecks: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(kopecks / 100)
}

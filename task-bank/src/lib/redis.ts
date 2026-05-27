import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis | null | undefined }

function createRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) return null
  try {
    const r = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true, enableOfflineQueue: false })
    r.on('error', () => {})
    return r
  } catch { return null }
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined ? globalForRedis.redis : createRedis()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  if (!redis) return fn()
  try {
    const hit = await redis.get(key)
    if (hit) return JSON.parse(hit) as T
    const value = await fn()
    await redis.setex(key, ttlSec, JSON.stringify(value))
    return value
  } catch {
    return fn()
  }
}

export async function invalidate(pattern: string) {
  if (!redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch {}
}

'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Sparkles, Clock } from 'lucide-react'
import { Card, Badge, DiffBadge, Input, Select, Skeleton } from '@/components/ui'
import Link from 'next/link'

const EXAM_LABELS: Record<string, string> = { OGE: 'ОГЭ', EGE_BASE: 'ЕГЭ База', EGE_PROFILE: 'ЕГЭ Профиль' }
const RECENT_KEY = 'fibi:recent-searches'

interface Hit { id: string; examType: string; part: number; taskNumber: number; description: string; difficulty: number; _formatted?: { description: string }; topics?: { topic: { name: string } }[] }

function highlight(html: string) { return <span dangerouslySetInnerHTML={{ __html: html.replace(/<mark>/g, '<mark class="bg-lemon-200 text-yale-700 px-0.5 rounded">') }} /> }

export default function SearchPage() {
  const [query,      setQuery]    = useState('')
  const [results,    setResults]  = useState<Hit[]>([])
  const [total,      setTotal]    = useState(0)
  const [searching,  setSearching] = useState(false)
  const [examType,   setExamType]  = useState('')
  const [difficulty, setDiff]      = useState('')
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getRecent = (): string[] => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
  }
  const addRecent = (q: string) => {
    const r = [q, ...getRecent().filter(s => s !== q)].slice(0, 8)
    localStorage.setItem(RECENT_KEY, JSON.stringify(r))
  }
  const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] } })

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setTotal(0); return }
    setSearching(true)
    const sp = new URLSearchParams({ q })
    if (examType)   sp.set('examType', examType)
    if (difficulty) sp.set('difficulty', difficulty)
    const r = await fetch(`/api/search?${sp}`)
    const data = await r.json()
    setResults(data.hits ?? [])
    setTotal(data.estimatedTotalHits ?? 0)
    setSearching(false)
    addRecent(q)
    setRecent(getRecent())
  }, [examType, difficulty])

  const onChange = (v: string) => {
    setQuery(v)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(v), 250)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="topbar">
        <div><h1 className="section-title">Поиск заданий</h1><p className="section-sub">Мгновенный поиск по банку ОГЭ/ЕГЭ</p></div>
      </div>

      {/* Search bar */}
      <Card className="mb-6 py-4">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => onChange(e.target.value)} placeholder="Найди задание по теме, формулировке..." autoFocus
            className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 text-sm font-medium outline-none transition focus:border-yale focus:ring-2 focus:ring-yale/10" />
          {query && <button onClick={() => { setQuery(''); setResults([]); setTotal(0) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X size={16} /></button>}
        </div>
        <div className="flex gap-3">
          <Select value={examType} onChange={e => { setExamType(e.target.value); if (query) doSearch(query) }}>
            <option value="">Все экзамены</option>
            <option value="OGE">ОГЭ</option>
            <option value="EGE_BASE">ЕГЭ База</option>
            <option value="EGE_PROFILE">ЕГЭ Профиль</option>
          </Select>
          <Select value={difficulty} onChange={e => { setDiff(e.target.value); if (query) doSearch(query) }}>
            <option value="">Все уровни</option>
            <option value="1">Лёгкий</option>
            <option value="2">Средний</option>
            <option value="3">Сложный</option>
          </Select>
        </div>
      </Card>

      {/* Recent / suggestions */}
      {!query && recent.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2"><Clock size={13} /> Недавние поиски</p>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <button key={r} onClick={() => { setQuery(r); doSearch(r) }}
                className="px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-yale hover:text-yale transition-colors">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searching ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs text-gray-500 mb-4">{total} результатов</p>
              <div className="space-y-3">
                {results.map((hit, i) => (
                  <motion.div key={hit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link href={`/bank/${hit.id}`}>
                      <Card hover className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex gap-2 flex-wrap mb-2">
                              <Badge color="blue">{EXAM_LABELS[hit.examType]}</Badge>
                              <Badge color="gray">Ч.{hit.part} · №{hit.taskNumber}</Badge>
                              <DiffBadge diff={hit.difficulty} />
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                              {hit._formatted?.description ? highlight(hit._formatted.description) : hit.description}
                            </p>
                          </div>
                          <span className="text-yale shrink-0">→</span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          {query && !searching && results.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Sparkles size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуй изменить запрос</p>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

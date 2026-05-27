import MeiliSearch from 'meilisearch'

export const search = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY,
})

export const TASKS_INDEX = 'tasks'

export async function ensureIndex() {
  try {
    await search.getIndex(TASKS_INDEX)
  } catch {
    await search.createIndex(TASKS_INDEX, { primaryKey: 'id' })
    const idx = search.index(TASKS_INDEX)
    await idx.updateSettings({
      searchableAttributes: ['title', 'description', 'tags', 'topicNames'],
      filterableAttributes: ['examType', 'part', 'taskNumber', 'difficulty', 'topicIds', 'verificationStatus'],
      sortableAttributes: ['taskNumber', 'difficulty', 'createdAt'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    })
  }
}

export interface TaskSearchDoc {
  id: string
  title: string | null
  description: string
  examType: string
  part: number
  taskNumber: number
  difficulty: number
  tags: string[]
  topicIds: string[]
  topicNames: string[]
  verificationStatus: string
  createdAt: string
}

export async function indexTask(task: TaskSearchDoc) {
  await ensureIndex()
  await search.index(TASKS_INDEX).addDocuments([task])
}

export async function searchTasks(query: string, filters?: {
  examType?: string
  part?: number
  difficulty?: number
  topicId?: string
}) {
  const filterParts: string[] = ['verificationStatus = "VERIFIED"']
  if (filters?.examType) filterParts.push(`examType = "${filters.examType}"`)
  if (filters?.part)     filterParts.push(`part = ${filters.part}`)
  if (filters?.difficulty) filterParts.push(`difficulty = ${filters.difficulty}`)
  if (filters?.topicId)  filterParts.push(`topicIds IN ["${filters.topicId}"]`)

  return search.index(TASKS_INDEX).search(query, {
    filter: filterParts.join(' AND '),
    limit: 50,
    attributesToHighlight: ['title', 'description'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
  })
}

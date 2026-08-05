/**
 * Интеграция генератора задач с реальной Prisma-схемой ФИБИ.
 *
 * Маппинг GeneratedTask → Task (prisma/schema.prisma):
 *   .number        → taskNumber
 *   .condition     → description
 *   .answer        → answer
 *   .solution[]    → fullSolution  (JSON: [{step,detail}])
 *   .difficulty    → difficulty    (easy→1, medium→2, hard→3)
 *   .topic         → tags          (JSON array)
 *   .variant       → stored in tags array
 *   (examType, part, source, verificationStatus have fixed defaults)
 */

import { db } from '@/lib/db';
import { GeneratedTask } from './types';

// ─── helpers ────────────────────────────────────────────────────────────────

function difficultyToInt(d: string): number {
  return d === 'easy' ? 1 : d === 'hard' ? 3 : 2;
}

function intToDifficulty(n: number): string {
  return n === 1 ? 'easy' : n === 3 ? 'hard' : 'medium';
}

function toFullSolution(solution?: string[]): string {
  if (!solution?.length) return '[]';
  return JSON.stringify(
    solution.map((step, i) => ({ step: i + 1, detail: step }))
  );
}

function toTags(topic: string, variant: number): string {
  return JSON.stringify([topic, `variant:${variant}`]);
}

function taskToPrisma(task: GeneratedTask) {
  return {
    id:                 task.id,
    examType:           'OGE',
    part:               task.number <= 19 ? 1 : 2,
    taskNumber:         task.number,
    description:        task.condition,
    answer:             String(task.answer),
    answerAlt:          task.options ? JSON.stringify(task.options) : '[]',
    hint1:              task.solution?.[0] ?? null,
    hint2:              task.solution?.[1] ?? null,
    fullSolution:       toFullSolution(task.solution),
    explanation:        task.solution ? task.solution.join(' → ') : null,
    difficulty:         difficultyToInt(task.difficulty),
    source:             'PLATFORM',
    tags:               toTags(task.topic, task.variant),
    hasLatex:           task.condition.includes('\\') || task.condition.includes('^'),
    verificationStatus: 'VERIFIED',
  };
}

// ─── TaskDatabaseService ─────────────────────────────────────────────────────

export class TaskDatabaseService {
  /** Save one generated task */
  static async saveTask(task: GeneratedTask) {
    return db.task.create({ data: taskToPrisma(task) });
  }

  /** Batch-save with progress logging */
  static async saveBatch(tasks: GeneratedTask[], batchSize = 100): Promise<number> {
    let saved = 0;
    console.log(`Загрузка ${tasks.length} задач в БД...`);

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      try {
        const results = await Promise.allSettled(
          batch.map(t => db.task.upsert({
            where:  { id: t.id },
            create: taskToPrisma(t),
            update: taskToPrisma(t),
          }))
        );
        saved += results.filter(r => r.status === 'fulfilled').length;
        console.log(`  ${saved}/${tasks.length} (${Math.round(saved / tasks.length * 100)}%)`);
      } catch (e) {
        console.error(`Batch ${i}-${i + batchSize} error:`, e);
      }
    }

    console.log(`Загрузка завершена: ${saved} задач.`);
    return saved;
  }

  /** Delete all generated (PLATFORM-sourced) tasks */
  static async clearAll(): Promise<number> {
    const r = await db.task.deleteMany({ where: { source: 'PLATFORM' } });
    return r.count;
  }

  /** Delete by topic slug (stored in tags JSON) */
  static async clearByTopic(topic: string): Promise<number> {
    const tasks = await db.task.findMany({
      where: { source: 'PLATFORM', tags: { contains: topic } },
      select: { id: true },
    });
    for (const t of tasks) await db.task.delete({ where: { id: t.id } });
    return tasks.length;
  }

  /** DB statistics using actual schema fields */
  static async getDBStatistics() {
    const total = await db.task.count({ where: { source: 'PLATFORM' } });

    const byDiffRaw = await db.task.groupBy({
      by: ['difficulty'],
      where: { source: 'PLATFORM' },
      _count: true,
    });

    const byNumRaw = await db.task.groupBy({
      by: ['taskNumber'],
      where: { source: 'PLATFORM' },
      _count: true,
    });

    const byPartRaw = await db.task.groupBy({
      by: ['part'],
      where: { source: 'PLATFORM' },
      _count: true,
    });

    return {
      total,
      byDifficulty: Object.fromEntries(
        byDiffRaw.map(r => [intToDifficulty(r.difficulty), r._count])
      ),
      byTaskNumber: Object.fromEntries(
        byNumRaw
          .sort((a, b) => a.taskNumber - b.taskNumber)
          .map(r => [`Задача ${r.taskNumber}`, r._count])
      ),
      byPart: Object.fromEntries(
        byPartRaw.map(r => [`Часть ${r.part}`, r._count])
      ),
    };
  }

  /** Remove duplicate tasks (same taskNumber + same condition) */
  static async removeDuplicates(): Promise<number> {
    const all = await db.task.findMany({
      where:  { source: 'PLATFORM' },
      select: { id: true, taskNumber: true, description: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const seen = new Map<string, boolean>();
    const toDelete: string[] = [];

    for (const t of all) {
      const key = `${t.taskNumber}::${t.description}`;
      if (seen.has(key)) toDelete.push(t.id);
      else seen.set(key, true);
    }

    for (const id of toDelete) await db.task.delete({ where: { id } });
    return toDelete.length;
  }

  /** Not needed with shared db client, kept for script compat */
  static async disconnect() {}
}

// ─── TaskFetchService ────────────────────────────────────────────────────────

export class TaskFetchService {
  static async getTaskById(id: string) {
    return db.task.findUnique({ where: { id } });
  }

  static async getTasksByNumber(taskNumber: number, limit = 100) {
    return db.task.findMany({
      where: { taskNumber, source: 'PLATFORM' },
      take:  limit,
    });
  }

  static async getRandomTaskByNumber(taskNumber: number) {
    const count = await db.task.count({ where: { taskNumber, source: 'PLATFORM' } });
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    const tasks = await db.task.findMany({
      where: { taskNumber, source: 'PLATFORM' },
      skip,
      take: 1,
    });
    return tasks[0] ?? null;
  }

  /** Get one task per number for a complete OGE variant */
  static async getOGEVariant() {
    const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,20,21,22,23,24,25];
    const tasks = await Promise.all(
      numbers.map(n => this.getRandomTaskByNumber(n))
    );
    return tasks.filter(Boolean);
  }

  static async getTasksByDifficulty(difficulty: 'easy' | 'medium' | 'hard', limit = 100) {
    return db.task.findMany({
      where: { difficulty: difficultyToInt(difficulty), source: 'PLATFORM' },
      take: limit,
    });
  }

  static async searchTasks(query: string, limit = 20) {
    return db.task.findMany({
      where: {
        source: 'PLATFORM',
        description: { contains: query },
      },
      take: limit,
    });
  }
}

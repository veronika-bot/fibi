/**
 * Главный генератор банка задач ОГЭ по математике
 */

import { GeneratedTask, BatchGenerateOptions, OGE_TOPICS } from './types';
import { BasicTaskGenerator } from './generators';
import { v4 as uuidv4 } from 'uuid';

// All implemented task numbers
const IMPLEMENTED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 20, 21, 22, 23, 25] as const;

export class TaskBankGenerator {
  /**
   * Generate a single task by number
   */
  static generateTask(taskNumber: number, difficulty: 'easy' | 'medium' | 'hard'): GeneratedTask {
    const cfg = { difficulty };
    switch (taskNumber) {
      case 1:  return BasicTaskGenerator.generateArithmetic(cfg);
      case 2:  return BasicTaskGenerator.generateFractionsAndPercents(cfg);
      case 3:  return BasicTaskGenerator.generatePowersAndRoots(cfg);
      case 4:  return BasicTaskGenerator.generateLinearEquation(cfg);
      case 5:  return BasicTaskGenerator.generateInequality(cfg);
      case 6:  return BasicTaskGenerator.generateFunction(cfg);
      case 7:  return BasicTaskGenerator.generateBasicGeometry(cfg);
      case 8:  return BasicTaskGenerator.generateGeometryArea(cfg);
      case 9:  return BasicTaskGenerator.generateRightTriangle(cfg);
      case 11: return BasicTaskGenerator.generateSequence(cfg);
      case 13: return BasicTaskGenerator.generateFormula(cfg);
      case 14: return BasicTaskGenerator.generateProbability(cfg);
      case 15: return BasicTaskGenerator.generateStatistics(cfg);
      case 20: return BasicTaskGenerator.generateQuadraticEquation(cfg);
      case 21: return BasicTaskGenerator.generateSystemOfEquations(cfg);
      case 22: return BasicTaskGenerator.generateMotionProblem(cfg);
      case 23: return BasicTaskGenerator.generateCoordinateGeometry(cfg);
      case 25: return BasicTaskGenerator.generateCombinatorics(cfg);
      default:
        throw new Error(`Генератор для задачи №${taskNumber} не реализован. Реализованы: ${IMPLEMENTED.join(', ')}`);
    }
  }

  /** Generate count variants of a single task number */
  static generateByNumber(taskNumber: number, count: number, difficulty: 'easy' | 'medium' | 'hard'): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const t = this.generateTask(taskNumber, difficulty);
        t.variant = i + 1;
        tasks.push(t);
      } catch (e) {
        console.warn(`Skip task ${taskNumber} variant ${i}: ${e}`);
      }
    }
    return tasks;
  }

  /** Generate tasks by topic name */
  static generateTasksByTopic(topic: string, count: number, difficulty: 'easy' | 'medium' | 'hard'): GeneratedTask[] {
    const entry = Object.entries(OGE_TOPICS).find(([k]) => k === topic);
    if (!entry) throw new Error(`Тема "${topic}" не найдена`);
    return this.generateByNumber((entry[1] as any).number, count, difficulty);
  }

  /**
   * Generate a full variant (one task per implemented number)
   */
  static generateFullVariant(variantNumber: number, difficulty: 'easy' | 'medium' | 'hard'): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    for (const n of IMPLEMENTED) {
      try {
        const t = this.generateTask(n, difficulty);
        t.variant = variantNumber;
        tasks.push(t);
      } catch (e) {
        console.warn(`Variant task ${n}: ${e}`);
      }
    }
    return tasks;
  }

  /**
   * Generate full task bank:
   * tasksPerNumber variants × each implemented task number
   */
  static generateFullBank(
    tasksPerNumber = 50,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): GeneratedTask[] {
    const all: GeneratedTask[] = [];
    console.log(`Генерирую банк: ${IMPLEMENTED.length} типов × ${tasksPerNumber} вариантов...`);
    for (const n of IMPLEMENTED) {
      const batch = this.generateByNumber(n, tasksPerNumber, difficulty);
      all.push(...batch);
      console.log(`  Задача ${n}: ${batch.length} вариантов`);
    }
    console.log(`Итого: ${all.length} задач`);
    return all;
  }

  /** Generate mixed-difficulty bank */
  static generateMixedBank(tasksPerNumber = 30): GeneratedTask[] {
    const all: GeneratedTask[] = [];
    const diffs: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    for (const d of diffs) {
      all.push(...this.generateFullBank(tasksPerNumber, d));
    }
    return all;
  }

  static generateCustom(options: BatchGenerateOptions): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    for (const topic of options.topicsToGenerate) {
      tasks.push(...this.generateTasksByTopic(topic, options.countPerTopic, options.difficulty));
    }
    return tasks;
  }

  static getStatistics(tasks: GeneratedTask[]) {
    const byNum = new Map<number, number>();
    const byTopic = new Map<string, number>();
    tasks.forEach(t => {
      byNum.set(t.number, (byNum.get(t.number) ?? 0) + 1);
      byTopic.set(t.topic, (byTopic.get(t.topic) ?? 0) + 1);
    });
    return {
      total:        tasks.length,
      implemented:  IMPLEMENTED.length,
      byDifficulty: {
        easy:   tasks.filter(t => t.difficulty === 'easy').length,
        medium: tasks.filter(t => t.difficulty === 'medium').length,
        hard:   tasks.filter(t => t.difficulty === 'hard').length,
      },
      byNumber: Object.fromEntries(byNum),
      byTopic:  Object.fromEntries(byTopic),
    };
  }
}

// ─── Exporter ─────────────────────────────────────────────────────────────────

export class TaskExporter {
  static toJSON(tasks: GeneratedTask[]): string {
    return JSON.stringify(tasks, null, 2);
  }

  static toCSV(tasks: GeneratedTask[]): string {
    const headers = ['ID', 'Номер', 'Тема', 'Сложность', 'Условие', 'Ответ', 'Тип ответа', 'Вариант'];
    const rows = tasks.map(t => [
      t.id,
      t.number,
      t.topic,
      t.difficulty,
      `"${String(t.condition).replace(/"/g, '""')}"`,
      `"${String(t.answer).replace(/"/g, '""')}"`,
      t.answerType,
      t.variant,
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\n');
  }

  static toSQL(tasks: GeneratedTask[]): string {
    const now = new Date().toISOString();
    let sql = `-- Банк задач ОГЭ — сгенерировано ${now}\n\n`;
    for (const t of tasks) {
      const esc = (s: string) => s.replace(/'/g, "''");
      const diff = t.difficulty === 'easy' ? 1 : t.difficulty === 'hard' ? 3 : 2;
      const part = t.number <= 19 ? 1 : 2;
      const tags = JSON.stringify([t.topic, `variant:${t.variant}`]);
      const sol  = t.solution ? JSON.stringify(t.solution.map((s, i) => ({ step: i + 1, detail: s }))) : '[]';
      sql += `INSERT INTO "Task" (id,examType,part,taskNumber,description,answer,fullSolution,difficulty,source,tags,verificationStatus,createdAt,updatedAt) VALUES `
           + `('${t.id}','OGE',${part},${t.number},'${esc(t.condition)}','${esc(String(t.answer))}','${esc(sol)}',${diff},'PLATFORM','${esc(tags)}','VERIFIED','${now}','${now}');\n`;
    }
    return sql;
  }
}

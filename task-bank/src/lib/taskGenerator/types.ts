/**
 * Типы данных для генератора задач ОГЭ по математике
 */

export interface GeneratedTask {
  id: string;
  number: number; // номер задания в ОГЭ (1-26)
  topic: string; // тема
  difficulty: 'easy' | 'medium' | 'hard';

  // Условие задачи
  condition: string;

  // Ответ
  answer: number | string | boolean;
  answerType: 'number' | 'string' | 'select' | 'boolean';

  // Для выбора правильного ответа
  options?: string[];
  correctOptionIndex?: number;

  // Решение (пошагово)
  solution?: string[];

  // Параметры для регенерации
  parameters: Record<string, number | string>;

  // Метаданные
  createdAt: Date;
  variant: number; // номер варианта
}

export interface TaskGeneratorConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  seed?: number; // для воспроизводимости
}

export interface BatchGenerateOptions {
  topicsToGenerate: string[];
  countPerTopic: number;
  difficulty: 'easy' | 'medium' | 'hard';
  variant: number;
}

export interface TaskDatabase {
  id: string;
  taskId: string;
  number: number;
  topic: string;
  difficulty: string;
  condition: string;
  answer: string;
  answerType: string;
  options?: string;
  solution?: string;
  parameters: string;
  variant: number;
  createdAt: Date;
  updatedAt: Date;
}

// Темы ОГЭ по математике
export const OGE_TOPICS = {
  // Часть 1 (1-19)
  'Арифметика': { number: 1, difficulty: 'easy' },
  'Дроби и проценты': { number: 2, difficulty: 'easy' },
  'Степени и корни': { number: 3, difficulty: 'easy' },
  'Уравнения': { number: 4, difficulty: 'medium' },
  'Неравенства': { number: 5, difficulty: 'medium' },
  'Функции': { number: 6, difficulty: 'medium' },
  'Геометрия (основы)': { number: 7, difficulty: 'medium' },
  'Площади и периметры': { number: 8, difficulty: 'medium' },
  'Тригонометрия': { number: 9, difficulty: 'hard' },
  'Окружность': { number: 10, difficulty: 'hard' },
  'Последовательности': { number: 11, difficulty: 'medium' },
  'Графики функций': { number: 12, difficulty: 'medium' },
  'Формулы': { number: 13, difficulty: 'easy' },
  'Вероятность': { number: 14, difficulty: 'easy' },
  'Статистика': { number: 15, difficulty: 'easy' },

  // Часть 2 (20-26) - задачи повышенной сложности
  'Уравнения (сложные)': { number: 20, difficulty: 'hard' },
  'Системы уравнений': { number: 21, difficulty: 'hard' },
  'Задачи на движение': { number: 22, difficulty: 'hard' },
  'Геометрия (сложная)': { number: 23, difficulty: 'hard' },
  'Алгебра (сложная)': { number: 24, difficulty: 'hard' },
  'Комбинаторика': { number: 25, difficulty: 'hard' },
  'Доказательство': { number: 26, difficulty: 'hard' }
} as const;

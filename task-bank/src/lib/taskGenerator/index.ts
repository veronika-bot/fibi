/**
 * Index файл для экспорта всех функций генератора
 * File: src/lib/taskGenerator/index.ts
 */

export * from './types';
export { TaskCalculator } from './calculator';
export { BasicTaskGenerator } from './generators';
export { TaskBankGenerator, TaskExporter } from './taskBankGenerator';
export { TaskDatabaseService, TaskFetchService } from './database';

// Удобный импорт
export {
  type GeneratedTask,
  type TaskGeneratorConfig,
  type BatchGenerateOptions,
  type TaskDatabase,
  OGE_TOPICS
} from './types';

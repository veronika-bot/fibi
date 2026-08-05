/**
 * API Route для генерации и загрузки задач на платформу
 * File: app/api/admin/generate-tasks/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { TaskBankGenerator, TaskExporter } from '@/lib/taskGenerator/taskBankGenerator';
import { TaskDatabaseService, TaskFetchService } from '@/lib/taskGenerator/database';
import { requireUser, authErrorResponse } from '@/lib/authGuard';

// POST /api/admin/generate-tasks
export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ['ADMIN']);
    const body = await request.json();
    const {
      action,
      taskCount = 50,
      difficulty = 'medium',
      taskNumbers = [1, 2, 3, 4, 8, 14, 22],
      exportFormat = 'json' // 'json', 'csv', 'sql'
    } = body;

    console.log(`📝 Начинаю действие: ${action}`);

    if (action === 'generate') {
      // Генерировать задачи
      const tasks = TaskBankGenerator.generateFullBank(taskCount, difficulty);

      // Вернуть статистику
      const stats = TaskBankGenerator.getStatistics(tasks);

      return NextResponse.json({
        success: true,
        message: `✅ Сгенерировано ${tasks.length} задач`,
        tasks,
        statistics: stats,
        taskCount: tasks.length
      });
    }

    if (action === 'generate-and-save') {
      // Генерировать и сохранить в БД
      const tasks = TaskBankGenerator.generateFullBank(taskCount, difficulty);
      const saved = await TaskDatabaseService.saveBatch(tasks, 50);

      const stats = await TaskDatabaseService.getDBStatistics();

      return NextResponse.json({
        success: true,
        message: `✅ Сгенерировано и сохранено ${saved} задач`,
        statistics: stats,
        taskCount: saved
      });
    }

    if (action === 'export') {
      // Сгенерировать и экспортировать
      const tasks = TaskBankGenerator.generateFullBank(taskCount, difficulty);

      let exportedData: string;
      let contentType: string;
      let filename: string;

      if (exportFormat === 'csv') {
        exportedData = TaskExporter.toCSV(tasks);
        contentType = 'text/csv';
        filename = 'tasks.csv';
      } else if (exportFormat === 'sql') {
        exportedData = TaskExporter.toSQL(tasks);
        contentType = 'text/sql';
        filename = 'tasks.sql';
      } else {
        exportedData = TaskExporter.toJSON(tasks);
        contentType = 'application/json';
        filename = 'tasks.json';
      }

      return new NextResponse(exportedData, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    if (action === 'clear') {
      // Очистить БД
      const cleared = await TaskDatabaseService.clearAll();

      return NextResponse.json({
        success: true,
        message: `✅ Удалено ${cleared} задач из БД`
      });
    }

    if (action === 'clear-topic') {
      // Очистить задачи по теме
      const { topic } = body;
      if (!topic) {
        return NextResponse.json(
          { error: 'Требуется указать topic' },
          { status: 400 }
        );
      }

      const cleared = await TaskDatabaseService.clearByTopic(topic);

      return NextResponse.json({
        success: true,
        message: `✅ Удалено ${cleared} задач по теме "${topic}"`
      });
    }

    if (action === 'stats') {
      // Получить статистику БД
      const stats = await TaskDatabaseService.getDBStatistics();

      return NextResponse.json({
        success: true,
        statistics: stats
      });
    }

    if (action === 'remove-duplicates') {
      // Удалить дубликаты
      const removed = await TaskDatabaseService.removeDuplicates();

      return NextResponse.json({
        success: true,
        message: `✅ Удалено ${removed} дубликатов`
      });
    }

    return NextResponse.json(
      { error: `Неизвестное действие: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    const authErr = authErrorResponse(error);
    if (authErr) return authErr;
    console.error('❌ Ошибка при генерации задач:', error);

    return NextResponse.json(
      {
        error: 'Ошибка при генерации задач',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/generate-tasks/status
export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ['ADMIN']);
    const stats = await TaskDatabaseService.getDBStatistics();

    return NextResponse.json({
      success: true,
      status: 'online',
      statistics: stats
    });
  } catch (error) {
    const authErr = authErrorResponse(error);
    if (authErr) return authErr;
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    );
  }
}

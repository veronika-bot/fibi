# ⚡ Quick Start: Генератор задач ОГЭ

## За 5 минут до первой генерации

### Шаг 1: Установить зависимости

```bash
npm install mathjs uuid
npm install -D @types/uuid
```

### Шаг 2: Обновить БД

Добавьте в `prisma/schema.prisma`:

```prisma
model Task {
  id            String   @id @default(cuid())
  taskId        String   @unique
  number        Int
  topic         String
  difficulty    String
  condition     String   @db.LongText
  answer        String
  answerType    String
  options       String?  @db.Json
  solution      String?  @db.Json
  parameters    String   @db.Json
  variant       Int      @default(1)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([number])
  @@index([topic])
  @@index([difficulty])
}
```

Запустить миграцию:

```bash
npx prisma migrate dev --name add_tasks
```

### Шаг 3: Скопировать файлы

Копируем созданные файлы в ваш проект:

```bash
# Основной код генератора
cp -r src/lib/taskGenerator /path/to/your/project/src/lib/

# API routes
cp -r src/app/api/admin/generate-tasks /path/to/your/project/src/app/api/admin/

# Скрипт командной строки
cp scripts/generate-tasks.js /path/to/your/project/scripts/
```

### Шаг 4: Запустить генерацию

#### Способ A: Через Node скрипт (самый простой)

```bash
# Просто генерировать и показать в консоли (не сохраняет)
node scripts/generate-tasks.js generate --count=10

# Генерировать и сохранить в БД
node scripts/generate-tasks.js save --count=10

# Экспортировать в JSON
node scripts/generate-tasks.js export-json --count=50

# Показать статистику БД
node scripts/generate-tasks.js stats
```

#### Способ B: Через API

```bash
# Генерировать
curl -X POST http://localhost:3000/api/admin/generate-tasks \
  -H "Content-Type: application/json" \
  -d '{"action": "generate", "taskCount": 50, "difficulty": "medium"}'

# Генерировать + сохранить
curl -X POST http://localhost:3000/api/admin/generate-tasks \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-and-save", "taskCount": 100}'
```

#### Способ C: Из React админ-панели

Создайте компонент из файла `TASK_GENERATOR_README.md` (раздел "React компонент")

---

## Примеры команд

```bash
# Генерировать 50 задач средней сложности
node scripts/generate-tasks.js generate --count=50 --difficulty=medium

# Генерировать 100 сложных задач и сохранить
node scripts/generate-tasks.js save --count=100 --difficulty=hard

# Экспортировать в CSV
node scripts/generate-tasks.js export-csv --count=200

# Очистить БД
node scripts/generate-tasks.js clear-db

# Показать справку
node scripts/generate-tasks.js info
```

---

## Проверка результатов

### 1. Проверить в БД

```bash
# Подключиться к БД
npx prisma studio

# Или через SQL:
SELECT COUNT(*) FROM "Task";
SELECT difficulty, COUNT(*) FROM "Task" GROUP BY difficulty;
SELECT topic, COUNT(*) FROM "Task" GROUP BY topic;
```

### 2. Проверить JSON файл

```bash
# Первые 10 строк
head -20 tasks-*.json | jq '.[0]'
```

### 3. Получить API статистику

```bash
curl http://localhost:3000/api/admin/generate-tasks
```

---

## 🎯 Рекомендуемый workflow

### День 1: Первый запуск

```bash
# 1. Генерируем 20 вариантов каждого типа для тестирования
node scripts/generate-tasks.js generate --count=20 --difficulty=easy

# 2. Проверяем результаты в консоли
# 3. Сохраняем в JSON для проверки
node scripts/generate-tasks.js export-json --count=20
```

### День 2: Заполнение БД

```bash
# 1. Генерируем полный банк (100 вариантов каждого типа = 700 задач)
node scripts/generate-tasks.js save --count=100 --difficulty=medium

# 2. Проверяем статистику
node scripts/generate-tasks.js stats

# 3. Генерируем дополнительные задачи разной сложности
node scripts/generate-tasks.js save --count=50 --difficulty=easy
node scripts/generate-tasks.js save --count=50 --difficulty=hard
```

### День 3: Интеграция с платформой

```bash
# 1. Создаем API routes для студентов (получение задач)
# 2. Тестируем через web-интерфейс
# 3. Проверяем, что задачи правильно отображаются в кабинете ученика
```

---

## Структура сгенерированной задачи

```json
{
  "id": "unique-id",
  "number": 4,
  "topic": "Уравнения",
  "difficulty": "medium",
  "condition": "Решите уравнение: 5x + 12 = 47",
  "answer": "7",
  "answerType": "number",
  "solution": [
    "5x + 12 = 47",
    "5x = 35",
    "x = 7"
  ],
  "parameters": {
    "a": 5,
    "b": 47,
    "c": 12
  },
  "variant": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Часто задаваемые вопросы

**Q: Сколько времени занимает генерация 1000 задач?**
A: ~2-3 секунды на генерацию + 10-15 секунд на сохранение в БД.

**Q: Какой размер JSON файла с 1000 задач?**
A: ~2-3 MB.

**Q: Можно ли менять числа в условиях?**
A: Да, каждый раз генерируются новые числа. В `parameters` сохраняются исходные значения.

**Q: Как добавить новый тип задачи?**
A: Добавить генератор в `BasicTaskGenerator` класс.

**Q: Почему некоторые числа повторяются?**
A: Используется Math.random(). Для воспроизводимого результата, передайте `seed`.

---

## Дополнительно

- 📖 Полная документация: `TASK_GENERATOR_README.md`
- 💻 Исходный код: `src/lib/taskGenerator/`
- 🔌 API endpoints: `src/app/api/admin/generate-tasks/route.ts`

Готово! 🚀

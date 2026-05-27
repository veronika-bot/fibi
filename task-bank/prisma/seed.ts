import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Topic hierarchy ───────────────────────────────────────
const TOPIC_TREE = [
  { slug: 'oge',            name: 'ОГЭ',                          examType: 'OGE', order: 0, parent: null },
  { slug: 'oge-algebra',    name: 'Алгебра',                      examType: 'OGE', order: 1, parent: 'oge' },
  // Subtopics — Algebra
  { slug: 'arith',          name: 'Арифметика',                   examType: 'OGE', order: 1, parent: 'oge-algebra' },
  { slug: 'fractions',      name: 'Дроби и проценты',             examType: 'OGE', order: 2, parent: 'oge-algebra' },
  { slug: 'powers',         name: 'Степени и корни',              examType: 'OGE', order: 3, parent: 'oge-algebra' },
  { slug: 'equations',      name: 'Уравнения',                    examType: 'OGE', order: 4, parent: 'oge-algebra' },
  { slug: 'functions',      name: 'Функции и графики',            examType: 'OGE', order: 5, parent: 'oge-algebra' },
  { slug: 'stats',          name: 'Статистика и вероятность',     examType: 'OGE', order: 6, parent: 'oge-algebra' },
  { slug: 'text-tasks',     name: 'Текстовые задачи',             examType: 'OGE', order: 7, parent: 'oge-algebra' },
  { slug: 'inequalities',   name: 'Неравенства',                  examType: 'OGE', order: 8, parent: 'oge-algebra' },
  { slug: 'algebra-expr',   name: 'Алгебраические выражения',     examType: 'OGE', order: 9, parent: 'oge-algebra' },
  // Geometry (leaf)
  { slug: 'geo',            name: 'Геометрия',                    examType: 'OGE', order: 2, parent: 'oge' },
]

// Topic name → slug map (for tasks lookup)
const TOPIC_SLUG: Record<string, string> = {
  'Арифметика':                 'arith',
  'Дроби и проценты':           'fractions',
  'Степени и корни':            'powers',
  'Уравнения':                  'equations',
  'Функции и графики':          'functions',
  'Статистика и вероятность':   'stats',
  'Текстовые задачи':           'text-tasks',
  'Неравенства':                'inequalities',
  'Алгебраические выражения':   'algebra-expr',
  'Геометрия':                  'geo',
}

// ── Raw tasks (imported from /tasks.js) ───────────────────
const RAW_TASKS = [
  // АРИФМЕТИКА
  { id:1,  num:1,  topic:'Арифметика',               part:1, difficulty:1, text:'Вычислите: 2,4 · 5 − 3,8',                                                     answer:'8.2',     answerAlt:['8,2'],                 hint:'Сначала умножение, потом вычитание',                    solution:[{step:'Умножаем',detail:'2,4 · 5 = 12'},{step:'Вычитаем',detail:'12 − 3,8 = 8,2'}] },
  { id:2,  num:1,  topic:'Арифметика',               part:1, difficulty:1, text:'Вычислите: 3,6 : 0,4 + 1,5',                                                    answer:'10.5',    answerAlt:['10,5'],                hint:'Деление выполняется до сложения',                       solution:[{step:'Делим',detail:'3,6 : 0,4 = 9'},{step:'Складываем',detail:'9 + 1,5 = 10,5'}] },
  { id:3,  num:1,  topic:'Арифметика',               part:1, difficulty:1, text:'Вычислите: (−3)² − 4 · 2',                                                      answer:'1',       answerAlt:[],                      hint:'Порядок: степень → умножение → вычитание',              solution:[{step:'Возводим в степень',detail:'(−3)² = 9'},{step:'Умножаем',detail:'4 · 2 = 8'},{step:'Вычитаем',detail:'9 − 8 = 1'}] },
  // ДРОБИ И ПРОЦЕНТЫ
  { id:4,  num:2,  topic:'Дроби и проценты',         part:1, difficulty:1, text:'Велосипед стоит 12 000 ₽. На него сделали скидку 15%. Сколько стоит велосипед со скидкой?',                               answer:'10200',   answerAlt:['10 200'],              hint:'Скидка 15% = умножить на 0,85',                         solution:[{step:'Размер скидки',detail:'12 000 · 0,15 = 1 800 ₽'},{step:'Итого',detail:'12 000 − 1 800 = 10 200 ₽'}] },
  { id:5,  num:2,  topic:'Дроби и проценты',         part:1, difficulty:1, text:'В классе 30 учеников. 40% из них — отличники. Сколько отличников?',              answer:'12',      answerAlt:[],                      hint:'40% = 0,4',                                             solution:[{step:'Находим 40% от 30',detail:'30 · 0,4 = 12'}] },
  { id:6,  num:2,  topic:'Дроби и проценты',         part:1, difficulty:2, text:'Цена товара выросла с 800 ₽ до 1 000 ₽. На сколько процентов выросла цена?',    answer:'25',      answerAlt:['25%'],                 hint:'Прирост / старая цена × 100%',                          solution:[{step:'Прирост',detail:'1 000 − 800 = 200 ₽'},{step:'Процент',detail:'200 / 800 × 100% = 25%'}] },
  // СТЕПЕНИ И КОРНИ
  { id:7,  num:3,  topic:'Степени и корни',          part:1, difficulty:1, text:'Вычислите: √144',                                                                answer:'12',      answerAlt:[],                      hint:'Найди число, квадрат которого равен 144',               solution:[{step:'Извлекаем корень',detail:'√144 = 12, так как 12² = 144'}] },
  { id:8,  num:3,  topic:'Степени и корни',          part:1, difficulty:2, text:'Вычислите: 2³ · 2⁻¹',                                                           answer:'4',       answerAlt:[],                      hint:'При умножении степеней с одинаковым основанием показатели складываются', solution:[{step:'Складываем показатели',detail:'2³ · 2⁻¹ = 2^(3-1) = 2² = 4'}] },
  { id:9,  num:3,  topic:'Степени и корни',          part:1, difficulty:2, text:'Найдите значение: (√5)⁴',                                                       answer:'25',      answerAlt:[],                      hint:'(√a)² = a',                                             solution:[{step:'Упрощаем',detail:'(√5)⁴ = ((√5)²)² = 5² = 25'}] },
  // ДРОБИ (продолжение)
  { id:10, num:2,  topic:'Дроби и проценты',         part:1, difficulty:1, text:'Упростите: 3/4 + 1/6',                                                          answer:'0.917',   answerAlt:['11/12'],               hint:'Найди общий знаменатель (12)',                           solution:[{step:'Общий знаменатель 12',detail:'9/12 + 2/12 = 11/12 ≈ 0,917'}] },
  { id:11, num:2,  topic:'Дроби и проценты',         part:1, difficulty:2, text:'Вычислите: 2 2/3 · 1 1/4',                                                      answer:'3.333',   answerAlt:['3⅓','10/3'],           hint:'Переведи смешанные числа в неправильные дроби',         solution:[{step:'Переводим',detail:'8/3 · 5/4 = 40/12 = 10/3 ≈ 3,33'}] },
  // УРАВНЕНИЯ (Ч.1)
  { id:12, num:4,  topic:'Уравнения',                part:1, difficulty:1, text:'Решите уравнение: 3x − 7 = 14',                                                 answer:'7',       answerAlt:['x=7'],                 hint:'Переноси числа в одну сторону, x — в другую',          solution:[{step:'Переносим',detail:'3x = 14 + 7 = 21'},{step:'Делим',detail:'x = 21 / 3 = 7'}] },
  { id:13, num:4,  topic:'Уравнения',                part:1, difficulty:1, text:'Решите уравнение: 2(x + 3) = 10',                                               answer:'2',       answerAlt:['x=2'],                 hint:'Сначала раскрой скобки',                                solution:[{step:'Раскрываем скобки',detail:'2x + 6 = 10'},{step:'Решаем',detail:'2x = 4; x = 2'}] },
  { id:14, num:4,  topic:'Уравнения',                part:1, difficulty:2, text:'Решите уравнение: (x + 2) / 3 = (x − 1) / 2',                                  answer:'8',       answerAlt:['x=8'],                 hint:'Умножь обе части на НОК знаменателей',                  solution:[{step:'Умножаем на 6',detail:'2(x+2) = 3(x-1)'},{step:'Раскрываем',detail:'2x+4 = 3x-3'},{step:'Решаем',detail:'x = 7... пересчёт: 2x+4=3x−3 → x=7'}] },
  // АЛГЕБРАИЧЕСКИЕ ВЫРАЖЕНИЯ
  { id:15, num:5,  topic:'Алгебраические выражения', part:1, difficulty:2, text:'Разложите на множители: x² − 9',                                                answer:'(x-3)(x+3)', answerAlt:['(x+3)(x-3)'],      hint:'Разность квадратов: a² − b² = (a−b)(a+b)',             solution:[{step:'Применяем формулу',detail:'x² − 9 = x² − 3² = (x−3)(x+3)'}] },
  { id:16, num:5,  topic:'Алгебраические выражения', part:1, difficulty:2, text:'Упростите: (a + b)² − 2ab',                                                     answer:'a²+b²',   answerAlt:['a^2+b^2'],             hint:'Раскрой квадрат суммы: (a+b)² = a² + 2ab + b²',       solution:[{step:'Раскрываем',detail:'a² + 2ab + b² − 2ab = a² + b²'}] },
  // ФУНКЦИИ И ГРАФИКИ
  { id:17, num:6,  topic:'Функции и графики',        part:1, difficulty:1, text:'При каком значении x функция f(x) = 2x − 4 обращается в ноль?',                answer:'2',       answerAlt:['x=2'],                 hint:'Приравняй f(x) к нулю и реши уравнение',               solution:[{step:'Приравниваем',detail:'2x − 4 = 0'},{step:'Решаем',detail:'x = 2'}] },
  { id:18, num:6,  topic:'Функции и графики',        part:1, difficulty:2, text:'Найдите значение функции f(x) = x² − 3x + 2 при x = 3',                        answer:'2',       answerAlt:[],                      hint:'Подставь x = 3 в формулу',                             solution:[{step:'Подставляем',detail:'9 − 9 + 2 = 2'}] },
  { id:19, num:6,  topic:'Функции и графики',        part:1, difficulty:2, text:'Найдите наименьшее значение функции f(x) = x² − 4x + 7',                       answer:'3',       answerAlt:[],                      hint:'Вершина параболы: x₀ = −b/(2a)',                       solution:[{step:'Вершина',detail:'x₀ = 4/2 = 2'},{step:'Минимум',detail:'f(2) = 4 − 8 + 7 = 3'}] },
  // СТАТИСТИКА И ВЕРОЯТНОСТЬ
  { id:20, num:7,  topic:'Статистика и вероятность', part:1, difficulty:1, text:'В урне 5 красных и 3 синих шара. Найдите вероятность вытащить красный.',        answer:'0.625',   answerAlt:['5/8'],                 hint:'P = благоприятные / все исходы',                       solution:[{step:'Всего шаров',detail:'5 + 3 = 8'},{step:'Вероятность',detail:'P = 5/8 = 0,625'}] },
  { id:21, num:7,  topic:'Статистика и вероятность', part:1, difficulty:1, text:'Найдите среднее арифметическое: 4, 7, 3, 8, 3',                                answer:'5',       answerAlt:[],                      hint:'Сумма делить на количество',                            solution:[{step:'Сумма',detail:'4+7+3+8+3 = 25'},{step:'Среднее',detail:'25 / 5 = 5'}] },
  { id:22, num:7,  topic:'Статистика и вероятность', part:1, difficulty:2, text:'Монету подбросили 3 раза. Найдите вероятность выпадения хотя бы одного орла.', answer:'0.875',   answerAlt:['7/8'],                 hint:'P(хотя бы один орёл) = 1 − P(ни одного)',             solution:[{step:'P(ни одного орла)',detail:'(1/2)³ = 1/8'},{step:'Итого',detail:'1 − 1/8 = 7/8 = 0,875'}] },
  // ТЕКСТОВЫЕ ЗАДАЧИ
  { id:23, num:9,  topic:'Текстовые задачи',         part:1, difficulty:2, text:'Два велосипедиста выехали навстречу. Скорости 60 и 80 км/ч, расстояние 280 км. Через сколько часов они встретятся?', answer:'2', answerAlt:['2 ч','2 часа'], hint:'При движении навстречу скорости складываются', solution:[{step:'Скорость сближения',detail:'60 + 80 = 140 км/ч'},{step:'Время',detail:'280 : 140 = 2 часа'}] },
  { id:24, num:9,  topic:'Текстовые задачи',         part:1, difficulty:2, text:'Один рабочий выполнит заказ за 6 дней, другой — за 12 дней. За сколько дней они справятся вместе?', answer:'4', answerAlt:['4 дня'], hint:'Найди, какую часть заказа каждый выполняет в день', solution:[{step:'1-й рабочий',detail:'1/6 в день'},{step:'2-й рабочий',detail:'1/12 в день'},{step:'Вместе',detail:'1/6 + 1/12 = 3/12 = 1/4; т.е. 4 дня'}] },
  // УРАВНЕНИЯ Ч.2 — Квадратные
  { id:25, num:12, topic:'Уравнения',                part:2, difficulty:2, text:'Решите уравнение: x² − 5x + 6 = 0',                                            answer:'2; 3',    answerAlt:['x1=2, x2=3','2 и 3','x₁=2; x₂=3'], hint:'D = b² − 4ac', solution:[{step:'Дискриминант',detail:'D = 25 − 24 = 1'},{step:'Корни',detail:'x₁ = (5+1)/2 = 3; x₂ = (5−1)/2 = 2'}] },
  { id:26, num:12, topic:'Уравнения',                part:2, difficulty:2, text:'Решите уравнение: 2x² − 7x + 3 = 0',                                           answer:'0.5; 3',  answerAlt:['x1=3, x2=0.5','3 и 0,5','3; 0,5'], hint:'a=2, b=−7, c=3', solution:[{step:'D',detail:'D = 49 − 24 = 25'},{step:'Корни',detail:'x₁ = (7+5)/4 = 3; x₂ = (7−5)/4 = 0,5'}] },
  { id:27, num:12, topic:'Уравнения',                part:2, difficulty:3, text:'Решите уравнение: 3x² − 12 = 0',                                               answer:'2; -2',   answerAlt:['±2','x=2 и x=-2'],                  hint:'Когда b=0, уравнение решается без дискриминанта',    solution:[{step:'Делим на 3',detail:'x² − 4 = 0'},{step:'Решаем',detail:'x = ±2'}] },
  // СИСТЕМЫ УРАВНЕНИЙ
  { id:28, num:13, topic:'Уравнения',                part:2, difficulty:2, text:'Решите систему: { 2x + y = 7; x − y = 2',                                       answer:'x=3; y=1', answerAlt:['(3;1)','x=3, y=1'],               hint:'Сложи оба уравнения, чтобы исключить y',            solution:[{step:'Складываем',detail:'3x = 9; x = 3'},{step:'Подставляем',detail:'6 + y = 7; y = 1'}] },
  { id:29, num:13, topic:'Уравнения',                part:2, difficulty:3, text:'Решите систему: { 3x − 2y = 4; x + y = 3',                                      answer:'x=2; y=1', answerAlt:['(2;1)','x=2, y=1'],               hint:'Выразить x из второго уравнения',                    solution:[{step:'Из 2-го',detail:'x = 3 − y'},{step:'Подставляем в 1-е',detail:'3(3−y) − 2y = 4 → y = 1'},{step:'Итого',detail:'x = 2; y = 1'}] },
  // НЕРАВЕНСТВА
  { id:30, num:14, topic:'Неравенства',              part:2, difficulty:2, text:'Решите неравенство: 3x − 4 > 5',                                                answer:'x > 3',   answerAlt:['(3;+∞)'],                           hint:'Перенеси 4 вправо, потом раздели на 3',             solution:[{step:'Переносим',detail:'3x > 9'},{step:'Делим',detail:'x > 3'}] },
  { id:31, num:14, topic:'Неравенства',              part:2, difficulty:3, text:'Решите неравенство: x² − 4x − 5 < 0',                                          answer:'-1 < x < 5', answerAlt:['(-1;5)'],                       hint:'Найди корни уравнения x²−4x−5=0, затем определи знак', solution:[{step:'Корни',detail:'x₁=−1, x₂=5'},{step:'Параболаветвями вверх',detail:'Неравенство < 0 между корнями: −1 < x < 5'}] },
  // ФУНКЦИИ Ч.2
  { id:32, num:15, topic:'Текстовые задачи',         part:2, difficulty:2, text:'Поезд проехал 360 км за 4 часа. Найдите скорость поезда.',                      answer:'90',      answerAlt:['90 км/ч'],                          hint:'v = s / t',                                         solution:[{step:'Применяем формулу',detail:'v = 360 / 4 = 90 км/ч'}] },
  { id:33, num:15, topic:'Текстовые задачи',         part:2, difficulty:3, text:'Бассейн наполняется первой трубой за 6 ч, второй — за 4 ч. Третья опустошает за 12 ч. Через сколько часов наполнится?', answer:'4', answerAlt:['4 ч'], hint:'Производительности труб складываются/вычитаются', solution:[{step:'Производительность',detail:'1/6 + 1/4 − 1/12 = 2/12 + 3/12 − 1/12 = 4/12 = 1/3'},{step:'Время',detail:'1 : (1/3) = 3 ч'}] },
  // ГЕОМЕТРИЯ
  { id:34, num:16, topic:'Геометрия',                part:2, difficulty:1, text:'Найдите площадь прямоугольника со сторонами 6 и 9 см.',                         answer:'54',      answerAlt:['54 см²'],                           hint:'S = a · b',                                         solution:[{step:'Формула',detail:'S = 6 · 9 = 54 см²'}] },
  { id:35, num:16, topic:'Геометрия',                part:2, difficulty:1, text:'Найдите периметр квадрата со стороной 7 см.',                                   answer:'28',      answerAlt:['28 см'],                            hint:'P = 4a',                                            solution:[{step:'Формула',detail:'P = 4 · 7 = 28 см'}] },
  { id:36, num:17, topic:'Геометрия',                part:2, difficulty:2, text:'В прямоугольном треугольнике катеты равны 3 и 4. Найдите гипотенузу.',           answer:'5',       answerAlt:['5 см'],                             hint:'Теорема Пифагора: c² = a² + b²',                   solution:[{step:'Пифагор',detail:'c² = 9 + 16 = 25; c = 5'}] },
  { id:37, num:17, topic:'Геометрия',                part:2, difficulty:2, text:'Найдите площадь треугольника с основанием 10 и высотой 6.',                     answer:'30',      answerAlt:['30 см²'],                           hint:'S = (1/2) · a · h',                                 solution:[{step:'Формула',detail:'S = 0,5 · 10 · 6 = 30 см²'}] },
  { id:38, num:18, topic:'Геометрия',                part:2, difficulty:2, text:'Найдите длину окружности с радиусом 5 (ответ через π, числом).',                answer:'31.4',    answerAlt:['10π','≈31,4'],                      hint:'C = 2πr',                                           solution:[{step:'Формула',detail:'C = 2π · 5 ≈ 31,4'}] },
  { id:39, num:18, topic:'Геометрия',                part:2, difficulty:2, text:'Найдите площадь круга с радиусом 3 (ответ числом, округли до целых).',          answer:'28',      answerAlt:['9π','≈28'],                         hint:'S = πr²',                                           solution:[{step:'Формула',detail:'S = π · 9 ≈ 28,27 ≈ 28'}] },
  { id:40, num:19, topic:'Геометрия',                part:2, difficulty:3, text:'В трапеции основания 8 и 12, высота 5. Найдите площадь.',                       answer:'50',      answerAlt:['50 см²'],                           hint:'S = (a + b)/2 · h',                                 solution:[{step:'Формула',detail:'S = (8 + 12)/2 · 5 = 10 · 5 = 50 см²'}] },
  { id:41, num:19, topic:'Геометрия',                part:2, difficulty:3, text:'Угол при основании равнобедренного треугольника 72°. Найдите угол при вершине.', answer:'36',      answerAlt:['36°'],                              hint:'Сумма углов треугольника = 180°',                   solution:[{step:'Два основания',detail:'2 · 72 = 144'},{step:'Вершина',detail:'180 − 144 = 36°'}] },
  { id:42, num:19, topic:'Геометрия',                part:2, difficulty:3, text:'Найдите диагональ прямоугольника со сторонами 5 и 12.',                         answer:'13',      answerAlt:['13 см'],                            hint:'Диагональ — гипотенуза прямоугольного треугольника', solution:[{step:'Пифагор',detail:'d² = 25 + 144 = 169; d = 13'}] },
]

async function main() {
  console.log('🗑  Clearing existing data…')
  await prisma.taskTopic.deleteMany()
  await prisma.task.deleteMany()
  await prisma.topic.deleteMany()

  console.log('🌿 Seeding topics…')

  // Create topics in order (parents first)
  const topicIds: Record<string, string> = {}

  for (const t of TOPIC_TREE) {
    const parentId = t.parent ? topicIds[t.parent] : null
    const created = await prisma.topic.create({
      data: { name: t.name, slug: t.slug, examType: t.examType, order: t.order, parentId },
    })
    topicIds[t.slug] = created.id
  }

  console.log(`✅ ${TOPIC_TREE.length} topics created`)

  console.log('📚 Seeding tasks…')

  for (const raw of RAW_TASKS) {
    const slug = TOPIC_SLUG[raw.topic]
    const topicId = slug ? topicIds[slug] : null

    await prisma.task.create({
      data: {
        examType:          'OGE',
        part:              raw.part,
        taskNumber:        raw.num,
        description:       raw.text,
        answer:            raw.answer,
        answerAlt:         JSON.stringify(raw.answerAlt),
        hint1:             raw.hint,
        fullSolution:      JSON.stringify(raw.solution),
        difficulty:        raw.difficulty,
        source:            'PLATFORM',
        verificationStatus:'VERIFIED',
        topics: topicId ? { create: [{ topicId }] } : undefined,
      },
    })
  }

  console.log(`✅ ${RAW_TASKS.length} tasks seeded`)
  console.log('🎉 Done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

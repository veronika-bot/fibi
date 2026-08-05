/**
 * Генераторы задач ОГЭ по математике
 * Реализованы: 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 20, 21, 22, 23, 25
 */

import { GeneratedTask, TaskGeneratorConfig } from './types';
import { TaskCalculator } from './calculator';
import { v4 as uuidv4 } from 'uuid';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rFloat(min: number, max: number, dec = 1): number {
  return Math.round((Math.random() * (max - min) + min) * 10 ** dec) / 10 ** dec;
}

function pick<T>(arr: T[]): T {
  return arr[rInt(0, arr.length - 1)];
}

function mk(
  number: number,
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  condition: string,
  answer: number | string,
  solution: string[],
  params: Record<string, number | string> = {}
): GeneratedTask {
  return {
    id: uuidv4(),
    number,
    topic,
    difficulty,
    condition,
    answer: typeof answer === 'number' ? TaskCalculator.round(answer, 2) : answer,
    answerType: 'number',
    solution,
    parameters: params,
    createdAt: new Date(),
    variant: 0,
  };
}

// ─── BasicTaskGenerator ───────────────────────────────────────────────────────

export class BasicTaskGenerator {
  // ── Task 1: Arithmetic ──────────────────────────────────────────────────────
  static generateArithmetic(cfg: TaskGeneratorConfig): GeneratedTask {
    const a = rInt(1, 9), b = rInt(1, 9), c = rInt(1, 9), d = rInt(1, 9);
    const types = [
      { expr: `${a}/${b} + ${c}/${d}`, desc: 'сложение дробей' },
      { expr: `${a}/${b} - ${c}/${d}`, desc: 'вычитание дробей' },
      { expr: `(${a} + ${b}) * ${c} - ${d}`, desc: 'смешанное' },
      { expr: `${a}.${b} + ${c}.${d}`, desc: 'сложение десятичных' },
    ];
    const t = pick(types);
    const ans = TaskCalculator.evaluate(t.expr);
    return mk(1, 'Арифметика', cfg.difficulty,
      `Вычислите: ${t.expr}`,
      TaskCalculator.round(ans, 3),
      [`${t.desc}: ${t.expr}`, `Ответ: ${TaskCalculator.round(ans, 3)}`],
      { a, b, c, d }
    );
  }

  // ── Task 2: Fractions and percents ──────────────────────────────────────────
  static generateFractionsAndPercents(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 3);
    if (type === 0) {
      const n = rInt(100, 2000), p = pick([10, 15, 20, 25, 30, 40, 50]);
      const ans = TaskCalculator.percent(n, p);
      return mk(2, 'Дроби и проценты', cfg.difficulty,
        `Найдите ${p}% от числа ${n}.`,
        ans, [`${n} × ${p}/100 = ${ans}`], { n, p });
    }
    if (type === 1) {
      const price = rInt(100, 5000), disc = pick([5, 10, 15, 20, 25, 30]);
      const ans = TaskCalculator.discount(price, disc);
      return mk(2, 'Дроби и проценты', cfg.difficulty,
        `Цена товара ${price} руб. Скидка ${disc}%. Сколько стоит товар?`,
        ans,
        [`Скидка: ${price} × ${disc}/100 = ${TaskCalculator.percent(price, disc)} руб.`,
          `Цена: ${price} − ${TaskCalculator.percent(price, disc)} = ${ans} руб.`],
        { price, disc });
    }
    if (type === 2) {
      const val = rInt(100, 2000), p = pick([10, 15, 20, 25, 50]);
      const ans = TaskCalculator.increase(val, p);
      return mk(2, 'Дроби и проценты', cfg.difficulty,
        `Число ${val} увеличили на ${p}%. Найдите результат.`,
        ans,
        [`Прирост: ${val} × ${p}/100 = ${TaskCalculator.percent(val, p)}`,
          `Результат: ${val} + ${TaskCalculator.percent(val, p)} = ${ans}`],
        { val, p });
    }
    // type 3: find original given result and percent
    const orig = rInt(100, 1000), p = pick([10, 20, 25, 50]);
    const result = TaskCalculator.percent(orig, p);
    return mk(2, 'Дроби и проценты', cfg.difficulty,
      `${p}% от некоторого числа равно ${result}. Найдите это число.`,
      orig,
      [`Число = ${result} ÷ (${p}/100) = ${result} × ${100/p} = ${orig}`],
      { orig, p });
  }

  // ── Task 3: Powers and roots ────────────────────────────────────────────────
  static generatePowersAndRoots(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 3);
    if (type === 0) {
      const base = rInt(2, 9), exp = rInt(2, 5);
      const ans = Math.pow(base, exp);
      return mk(3, 'Степени и корни', cfg.difficulty,
        `Вычислите: ${base}^${exp}`,
        ans, [`${base}^${exp} = ${ans}`], { base, exp });
    }
    if (type === 1) {
      const root = rInt(2, 12), sq = root * root;
      return mk(3, 'Степени и корни', cfg.difficulty,
        `Вычислите: √${sq}`,
        root, [`√${sq} = ${root}, так как ${root}² = ${sq}`], { sq });
    }
    if (type === 2) {
      const a = rInt(2, 5), b = rInt(2, 4);
      const ans = Math.pow(a, b + 1);
      return mk(3, 'Степени и корни', cfg.difficulty,
        `Упростите: ${a}^${b} × ${a}`,
        ans,
        [`${a}^${b} × ${a}^1 = ${a}^${b + 1} = ${ans}`],
        { a, b });
    }
    // cube root
    const r = rInt(2, 6), cube = r * r * r;
    return mk(3, 'Степени и корни', cfg.difficulty,
      `Вычислите: ∛${cube}`,
      r, [`∛${cube} = ${r}, так как ${r}³ = ${cube}`], { cube });
  }

  // ── Task 4: Linear equations ────────────────────────────────────────────────
  static generateLinearEquation(cfg: TaskGeneratorConfig): GeneratedTask {
    const a = rInt(2, 10), c = rInt(5, 30), b = a * rInt(1, 10) + c;
    const x = (b - c) / a;
    return mk(4, 'Уравнения', cfg.difficulty,
      `Решите уравнение: ${a}x + ${c} = ${b}`,
      x,
      [`${a}x = ${b} − ${c} = ${b - c}`, `x = ${b - c} ÷ ${a} = ${x}`],
      { a, b, c });
  }

  // ── Task 5: Inequalities ────────────────────────────────────────────────────
  static generateInequality(cfg: TaskGeneratorConfig): GeneratedTask {
    const a = rInt(2, 9), b = rInt(1, 20);
    const signs: Array<{ s: string; sol: string }> = [
      { s: '<',  sol: `x < ${b / a}` },
      { s: '>',  sol: `x > ${b / a}` },
      { s: '≤',  sol: `x ≤ ${b / a}` },
      { s: '≥',  sol: `x ≥ ${b / a}` },
    ];
    const { s, sol } = pick(signs);
    const ans = TaskCalculator.round(b / a, 2);
    return mk(5, 'Неравенства', cfg.difficulty,
      `Решите неравенство: ${a}x ${s} ${b}`,
      sol,
      [`Делим обе части на ${a}`, `x ${s} ${ans}`, `Ответ: ${sol}`],
      { a, b });
  }

  // ── Task 6: Functions (linear) ──────────────────────────────────────────────
  static generateFunction(cfg: TaskGeneratorConfig): GeneratedTask {
    const k = rInt(-5, 5) || 1, m = rInt(-10, 10);
    const x = rInt(-5, 5);
    const y = k * x + m;
    const types = [
      {
        cond: `Дана функция y = ${k}x + ${m < 0 ? `(${m})` : m}. Найдите y при x = ${x}.`,
        ans: y,
        sol: [`y = ${k}·${x} + ${m} = ${k * x} + ${m} = ${y}`],
      },
      {
        cond: `При каком x функция y = ${k}x + ${m} равна ${y}?`,
        ans: TaskCalculator.round((y - m) / k, 2),
        sol: [`${k}x + ${m} = ${y}`, `${k}x = ${y - m}`, `x = ${TaskCalculator.round((y - m) / k, 2)}`],
      },
    ];
    const t = pick(types);
    return mk(6, 'Функции', cfg.difficulty, t.cond, t.ans, t.sol, { k, m, x });
  }

  // ── Task 7: Basic geometry (angles, triangles) ──────────────────────────────
  static generateBasicGeometry(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 2);
    if (type === 0) {
      // Sum of angles in triangle
      const a = rInt(30, 80), b = rInt(30, 80 - a + 30);
      const c = 180 - a - b;
      return mk(7, 'Геометрия (основы)', cfg.difficulty,
        `В треугольнике два угла равны ${a}° и ${b}°. Найдите третий угол.`,
        c,
        [`Сумма углов треугольника = 180°`, `${c}° = 180° − ${a}° − ${b}°`],
        { a, b });
    }
    if (type === 1) {
      // Supplementary angles
      const a = rInt(30, 150), b = 180 - a;
      return mk(7, 'Геометрия (основы)', cfg.difficulty,
        `Угол равен ${a}°. Найдите смежный угол.`,
        b,
        [`Смежные углы в сумме дают 180°`, `${b}° = 180° − ${a}°`],
        { a });
    }
    // Vertical angles
    const a = rInt(20, 160);
    return mk(7, 'Геометрия (основы)', cfg.difficulty,
      `Один из вертикальных углов равен ${a}°. Найдите другой вертикальный угол.`,
      a,
      ['Вертикальные углы равны.', `Ответ: ${a}°`],
      { a });
  }

  // ── Task 8: Areas and perimeters ────────────────────────────────────────────
  static generateGeometryArea(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 3);
    if (type === 0) {
      const w = rInt(3, 20), h = rInt(3, 20);
      const s = w * h, p = 2 * (w + h);
      return mk(8, 'Площади и периметры', cfg.difficulty,
        `Найдите площадь прямоугольника ${w} × ${h} см.`,
        s,
        [`S = ${w} × ${h} = ${s} см²`], { w, h });
    }
    if (type === 1) {
      const b = rInt(4, 20), h = rInt(4, 20);
      const s = TaskCalculator.triangleArea(b, h);
      return mk(8, 'Площади и периметры', cfg.difficulty,
        `Найдите площадь треугольника с основанием ${b} см и высотой ${h} см.`,
        s,
        [`S = (${b} × ${h}) / 2 = ${s} см²`], { b, h });
    }
    if (type === 2) {
      const r = rInt(2, 10);
      const s = TaskCalculator.round(Math.PI * r * r, 2);
      return mk(8, 'Площади и периметры', cfg.difficulty,
        `Найдите площадь круга радиусом ${r} см (ответ округлите до сотых).`,
        s,
        [`S = π·r² = π·${r}² ≈ ${s} см²`], { r });
    }
    // perimeter of rectangle
    const w = rInt(3, 20), h = rInt(3, 20);
    const p = 2 * (w + h);
    return mk(8, 'Площади и периметры', cfg.difficulty,
      `Найдите периметр прямоугольника ${w} × ${h} см.`,
      p,
      [`P = 2(${w} + ${h}) = 2 × ${w + h} = ${p} см`], { w, h });
  }

  // ── Task 9: Right triangle / Pythagorean theorem ────────────────────────────
  static generateRightTriangle(cfg: TaskGeneratorConfig): GeneratedTask {
    // Pick a Pythagorean triple
    const triples: [number, number, number][] = [
      [3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25]
    ];
    const [a, b, c] = pick(triples);
    const type = rInt(0, 2);
    if (type === 0) {
      return mk(9, 'Тригонометрия', cfg.difficulty,
        `В прямоугольном треугольнике катеты равны ${a} и ${b}. Найдите гипотенузу.`,
        c,
        [`c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}`, `c = ${c}`],
        { a, b, c });
    }
    if (type === 1) {
      return mk(9, 'Тригонометрия', cfg.difficulty,
        `В прямоугольном треугольнике гипотенуза ${c}, один катет ${a}. Найдите другой катет.`,
        b,
        [`b² = c² − a² = ${c * c} − ${a * a} = ${b * b}`, `b = ${b}`],
        { a, b, c });
    }
    return mk(9, 'Тригонометрия', cfg.difficulty,
      `Диагональ прямоугольника равна ${c} см, одна сторона ${a} см. Найдите другую сторону.`,
      b,
      [`b² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}`, `b = ${b} см`],
      { a, b, c });
  }

  // ── Task 11: Sequences ──────────────────────────────────────────────────────
  static generateSequence(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 2);
    if (type === 0) {
      // Arithmetic: nth term
      const a1 = rInt(2, 20), d = rInt(1, 10), n = rInt(5, 15);
      const an = a1 + (n - 1) * d;
      return mk(11, 'Последовательности', cfg.difficulty,
        `Первый член арифметической прогрессии равен ${a1}, разность ${d}. Найдите ${n}-й член.`,
        an,
        [`a${n} = a₁ + (n−1)·d = ${a1} + ${n - 1}·${d} = ${an}`],
        { a1, d, n });
    }
    if (type === 1) {
      // Sum of first n terms
      const a1 = rInt(1, 10), d = rInt(1, 5), n = rInt(4, 10);
      const an = a1 + (n - 1) * d;
      const s = TaskCalculator.arithmeticSum(a1, an, n);
      return mk(11, 'Последовательности', cfg.difficulty,
        `Арифметическая прогрессия: a₁ = ${a1}, d = ${d}. Найдите сумму первых ${n} членов.`,
        s,
        [`Sₙ = (a₁ + aₙ)·n / 2`, `a${n} = ${an}`, `S${n} = (${a1} + ${an})·${n}/2 = ${s}`],
        { a1, d, n });
    }
    // Find common difference
    const a1 = rInt(2, 20), an = rInt(30, 80), n = rInt(5, 10);
    const d = TaskCalculator.round((an - a1) / (n - 1), 2);
    return mk(11, 'Последовательности', cfg.difficulty,
      `Первый член прогрессии ${a1}, ${n}-й член ${an}. Найдите разность прогрессии.`,
      d,
      [`d = (aₙ − a₁) / (n−1) = (${an} − ${a1}) / ${n - 1} = ${d}`],
      { a1, an, n });
  }

  // ── Task 13: Formulas (substitution) ────────────────────────────────────────
  static generateFormula(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 3);
    if (type === 0) {
      const v = rInt(40, 120), t = rInt(1, 5);
      const s = v * t;
      return mk(13, 'Формулы', cfg.difficulty,
        `Скорость автомобиля ${v} км/ч. За ${t} ч он проехал ___ км.`,
        s, [`s = v · t = ${v} · ${t} = ${s} км`], { v, t });
    }
    if (type === 1) {
      const s = rInt(100, 500), t = rInt(1, 5);
      const v = s / t;
      return mk(13, 'Формулы', cfg.difficulty,
        `Автомобиль проехал ${s} км за ${t} ч. Найдите скорость.`,
        v, [`v = s / t = ${s} / ${t} = ${v} км/ч`], { s, t });
    }
    if (type === 2) {
      const p = rInt(50, 200), q = rInt(1, 10);
      const total = p * q;
      return mk(13, 'Формулы', cfg.difficulty,
        `Цена одного предмета ${p} руб. Стоимость ${q} предметов равна ___ руб.`,
        total, [`C = p · q = ${p} · ${q} = ${total} руб.`], { p, q });
    }
    // Density
    const m = rInt(10, 200), V = rInt(2, 20);
    const rho = TaskCalculator.round(m / V, 2);
    return mk(13, 'Формулы', cfg.difficulty,
      `Масса тела ${m} г, объём ${V} см³. Найдите плотность.`,
      rho, [`ρ = m / V = ${m} / ${V} = ${rho} г/см³`], { m, V });
  }

  // ── Task 14: Probability ────────────────────────────────────────────────────
  static generateProbability(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 3);
    if (type === 0) {
      const fav = rInt(1, 8), total = rInt(fav + 2, 20);
      const ans = TaskCalculator.round(fav / total, 2);
      return mk(14, 'Вероятность', 'easy',
        `В урне ${total} шаров, ${fav} из них белые. Какова вероятность выбрать белый?`,
        ans, [`P = ${fav}/${total} ≈ ${ans}`], { fav, total });
    }
    if (type === 1) {
      const fav = rInt(1, 3);
      const ans = TaskCalculator.round(fav / 6, 2);
      return mk(14, 'Вероятность', 'easy',
        `Кубик бросают один раз. Какова вероятность выпадения числа ≤ ${fav}?`,
        ans, [`P = ${fav}/6 ≈ ${ans}`], { fav });
    }
    if (type === 2) {
      return mk(14, 'Вероятность', 'easy',
        `Монету бросают 2 раза. Какова вероятность выпадения двух орлов?`,
        0.25, ['Исходов всего: ОО, ОР, РО, РР = 4', 'Благоприятных: 1', 'P = 1/4 = 0.25']);
    }
    const red = rInt(2, 8), blue = rInt(2, 8);
    const total = red + blue, ans = TaskCalculator.round(red / total, 2);
    return mk(14, 'Вероятность', 'easy',
      `В мешке ${red} красных и ${blue} синих шаров. Вероятность вытащить красный?`,
      ans, [`P = ${red}/${total} ≈ ${ans}`], { red, blue });
  }

  // ── Task 15: Statistics ──────────────────────────────────────────────────────
  static generateStatistics(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 2);
    if (type === 0) {
      const vals = Array.from({ length: 5 }, () => rInt(10, 90));
      const avg = TaskCalculator.round(TaskCalculator.average(...vals), 1);
      return mk(15, 'Статистика', cfg.difficulty,
        `Найдите среднее значение чисел: ${vals.join(', ')}.`,
        avg,
        [`Сумма: ${vals.reduce((a, b) => a + b, 0)}`, `Среднее: ${avg}`],
        { vals: vals.join(',') });
    }
    if (type === 1) {
      const vals = [3, 7, 7, 9, 11].map(() => rInt(1, 15)).sort((a, b) => a - b);
      const med = vals.length % 2 === 1
        ? vals[Math.floor(vals.length / 2)]
        : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
      return mk(15, 'Статистика', cfg.difficulty,
        `Найдите медиану набора: ${vals.join(', ')}.`,
        med,
        ['Медиана — среднее значение упорядоченного ряда', `Ответ: ${med}`],
        { vals: vals.join(',') });
    }
    // Mode
    const base = rInt(3, 9), extra = rInt(1, 5);
    const vals = [base, base, extra, rInt(1, 10), rInt(1, 10)].sort((a, b) => a - b);
    return mk(15, 'Статистика', cfg.difficulty,
      `Найдите моду набора: ${vals.join(', ')}.`,
      base,
      ['Мода — наиболее часто встречающееся число', `Число ${base} встречается 2 раза → мода = ${base}`],
      { vals: vals.join(',') });
  }

  // ── Task 20: Quadratic equations ─────────────────────────────────────────────
  static generateQuadraticEquation(cfg: TaskGeneratorConfig): GeneratedTask {
    // Ensure integer roots: pick roots x1, x2 then build ax²+bx+c
    const x1 = rInt(-6, -1), x2 = rInt(1, 6);
    const a = 1;
    const b = -(x1 + x2); // Vieta
    const c = x1 * x2;    // Vieta
    const bSign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const cSign = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    const cond = `Решите уравнение: x² ${bSign}x ${cSign} = 0`;
    const D = b * b - 4 * a * c;
    const smaller = Math.min(x1, x2), larger = Math.max(x1, x2);
    return mk(20, 'Уравнения (сложные)', 'hard',
      cond,
      `${smaller}; ${larger}`,
      [
        `D = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}`,
        `x₁ = (−${b} + √${D}) / 2 = ${larger}`,
        `x₂ = (−${b} − √${D}) / 2 = ${smaller}`,
        `Ответ: x = ${smaller}; x = ${larger}`,
      ],
      { b, c, x1, x2 });
  }

  // ── Task 21: Systems of linear equations ─────────────────────────────────────
  static generateSystemOfEquations(cfg: TaskGeneratorConfig): GeneratedTask {
    // x = a, y = b → build system
    const x = rInt(1, 8), y = rInt(1, 8);
    const c1 = rInt(1, 4), c2 = rInt(1, 4);
    // eq1: x + c1*y = x + c1*y
    const r1 = x + c1 * y;
    // eq2: c2*x + y = c2*x + y
    const r2 = c2 * x + y;
    const sys = `\\begin{cases} x + ${c1}y = ${r1} \\\\ ${c2}x + y = ${r2} \\end{cases}`;
    return mk(21, 'Системы уравнений', 'hard',
      `Решите систему уравнений: { x + ${c1}y = ${r1}; ${c2}x + y = ${r2} }`,
      `x = ${x}, y = ${y}`,
      [
        `Из 1-го уравнения: x = ${r1} − ${c1}y`,
        `Подставляем в 2-е: ${c2}(${r1} − ${c1}y) + y = ${r2}`,
        `${c2 * r1} − ${c2 * c1}y + y = ${r2}`,
        `y(1 − ${c2 * c1}) = ${r2 - c2 * r1}  →  y = ${y}`,
        `x = ${r1} − ${c1}·${y} = ${x}`,
        `Ответ: x = ${x}, y = ${y}`,
      ],
      { x, y, c1, c2 });
  }

  // ── Task 22: Motion problems ──────────────────────────────────────────────────
  static generateMotionProblem(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 2);
    if (type === 0) {
      const v1 = rInt(40, 80), v2 = rInt(40, 80);
      const dist = rInt(200, 600);
      const t = TaskCalculator.round(dist / (v1 + v2), 1);
      return mk(22, 'Задачи на движение', 'hard',
        `Два автомобиля едут навстречу. Скорости ${v1} и ${v2} км/ч, расстояние ${dist} км. Через сколько часов встретятся?`,
        t,
        [`v_сум = ${v1} + ${v2} = ${v1 + v2} км/ч`, `t = ${dist} / ${v1 + v2} = ${t} ч`],
        { v1, v2, dist });
    }
    if (type === 1) {
      const v1 = rInt(50, 80), gap = rInt(30, 100);
      const v2 = v1 + rInt(10, 30);
      const t = TaskCalculator.round(gap / (v2 - v1), 1);
      return mk(22, 'Задачи на движение', 'hard',
        `Автомобиль А едет ${v1} км/ч. Автомобиль Б (${v2} км/ч) выехал на ${gap} км позади. Через сколько часов догонит?`,
        t,
        [`Разность скоростей: ${v2} − ${v1} = ${v2 - v1} км/ч`, `t = ${gap} / ${v2 - v1} = ${t} ч`],
        { v1, v2, gap });
    }
    // train through tunnel
    const vTrain = rInt(60, 120), lTrain = rInt(100, 500), lTunnel = rInt(200, 1000);
    const t = TaskCalculator.round((lTrain + lTunnel) / (vTrain * 1000 / 3600), 1);
    return mk(22, 'Задачи на движение', 'hard',
      `Поезд длиной ${lTrain} м проезжает туннель ${lTunnel} м со скоростью ${vTrain} км/ч. Время проезда (сек)?`,
      t,
      [
        `Путь = ${lTrain} + ${lTunnel} = ${lTrain + lTunnel} м`,
        `v = ${vTrain} км/ч = ${TaskCalculator.round(vTrain * 1000 / 3600, 2)} м/с`,
        `t = ${lTrain + lTunnel} / ${TaskCalculator.round(vTrain * 1000 / 3600, 2)} ≈ ${t} с`,
      ],
      { vTrain, lTrain, lTunnel });
  }

  // ── Task 23: Coordinate geometry ─────────────────────────────────────────────
  static generateCoordinateGeometry(cfg: TaskGeneratorConfig): GeneratedTask {
    const x1 = rInt(-5, 0), y1 = rInt(-5, 0), x2 = rInt(1, 5), y2 = rInt(1, 5);
    const type = rInt(0, 1);
    if (type === 0) {
      const d = TaskCalculator.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 2);
      return mk(23, 'Геометрия (сложная)', 'hard',
        `Найдите расстояние между точками A(${x1}; ${y1}) и B(${x2}; ${y2}).`,
        d,
        [
          `d = √((x₂−x₁)² + (y₂−y₁)²)`,
          `d = √((${x2}−${x1})² + (${y2}−${y1})²)`,
          `d = √(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = √${(x2 - x1) ** 2 + (y2 - y1) ** 2} ≈ ${d}`,
        ],
        { x1, y1, x2, y2 });
    }
    const mx = TaskCalculator.round((x1 + x2) / 2, 1), my = TaskCalculator.round((y1 + y2) / 2, 1);
    return mk(23, 'Геометрия (сложная)', 'hard',
      `Найдите середину отрезка AB, где A(${x1}; ${y1}) и B(${x2}; ${y2}).`,
      `(${mx}; ${my})`,
      [`M = ((${x1}+${x2})/2; (${y1}+${y2})/2) = (${mx}; ${my})`],
      { x1, y1, x2, y2 });
  }

  // ── Task 25: Combinatorics ────────────────────────────────────────────────────
  static generateCombinatorics(cfg: TaskGeneratorConfig): GeneratedTask {
    const type = rInt(0, 2);
    if (type === 0) {
      const n = rInt(3, 6), items = rInt(2, n);
      const perm = Array.from({ length: n }, (_, i) => i + 1)
        .reduce((acc, v) => acc * v, 1);
      return mk(25, 'Комбинаторика', 'hard',
        `Сколько способов расставить ${n} различных книг на полке?`,
        perm,
        [`P = n! = ${n}! = ${perm}`], { n });
    }
    if (type === 1) {
      const n = rInt(4, 7), k = 2;
      const c = (n * (n - 1)) / 2;
      return mk(25, 'Комбинаторика', 'hard',
        `Сколько способов выбрать ${k} человека из ${n}?`,
        c,
        [`C(${n},${k}) = ${n}! / (${k}!·${n - k}!) = ${n}·${n - 1} / 2 = ${c}`],
        { n, k });
    }
    const roads = rInt(2, 4), ways = roads * roads;
    return mk(25, 'Комбинаторика', 'hard',
      `Из города A в B ведут ${roads} дороги, из B в C — тоже ${roads}. Сколько маршрутов A→B→C?`,
      ways,
      [`По правилу произведения: ${roads} × ${roads} = ${ways}`],
      { roads });
  }
}

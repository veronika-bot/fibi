#!/usr/bin/env node
'use strict';
/**
 * Генератор задач ОГЭ по математике — автономный Node.js скрипт
 *
 * Использование:
 *   node scripts/generate-tasks.js [команда] [--count=N] [--difficulty=D]
 *
 * Команды:
 *   generate      — Генерировать, вывести первую задачу + статистику
 *   save          — Генерировать и сохранить в БД через API
 *   export-json   — Сохранить в JSON-файл
 *   export-csv    — Сохранить в CSV-файл
 *   export-sql    — Сохранить SQL INSERT-скрипт
 *   stats         — Получить статистику из БД через API
 *   clear-db      — Очистить PLATFORM-задачи в БД через API
 *   info          — Справка
 *
 * Параметры:
 *   --count=N          Вариантов на каждое задание (по умолчанию 50)
 *   --difficulty=D     easy | medium | hard (по умолчанию medium)
 *   --url=URL          URL Next.js сервера (по умолчанию http://localhost:3000)
 */

const fs   = require('fs');
const path = require('path');
const { createId } = (() => {
  // tiny cuid-like id generator (no deps)
  let c = 0;
  return { createId: () => `gen_${Date.now()}_${(++c).toString(36)}_${Math.random().toString(36).slice(2, 7)}` };
})();

// ─── Mini-calculator ──────────────────────────────────────────────────────────
const Calc = {
  round: (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d,
  percent: (n, p) => (n * p) / 100,
  discount: (price, d) => price - (price * d) / 100,
  increase: (v, p) => v + (v * p) / 100,
  triangleArea: (b, h) => (b * h) / 2,
  circleArea: (r) => Math.PI * r * r,
  probability: (f, t) => f / t,
  arithmeticSum: (a1, an, n) => ((a1 + an) * n) / 2,
  average: (...vals) => vals.reduce((a, b) => a + b, 0) / vals.length,
};

function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rInt(0, arr.length - 1)]; }

function mk(number, topic, difficulty, condition, answer, solution, params = {}) {
  return {
    id: createId(),
    number,
    topic,
    difficulty,
    condition,
    answer: typeof answer === 'number' ? Calc.round(answer, 2) : answer,
    answerType: 'number',
    solution,
    parameters: params,
    createdAt: new Date().toISOString(),
    variant: 0,
  };
}

// ─── Task Generators ──────────────────────────────────────────────────────────
const Generators = {
  1: (d) => {
    const [a, b, c, e] = [rInt(1,9), rInt(1,9), rInt(1,9), rInt(1,9)];
    const exprs = [`${a}/${b} + ${c}/${e}`, `${a}/${b} - ${c}/${e}`, `(${a}+${b})*${c}-${e}`];
    const expr = pick(exprs);
    const ans = Calc.round(eval(expr.replace(/(\d+)\/(\d+)/g, '($1/$2)')), 3);
    return mk(1,'Арифметика',d, `Вычислите: ${expr}`, ans, [`${expr} = ${ans}`]);
  },
  2: (d) => {
    const type = rInt(0, 2);
    if (type === 0) {
      const n = rInt(200, 2000), p = pick([10,15,20,25,30,50]);
      const ans = Calc.percent(n, p);
      return mk(2,'Дроби и проценты',d, `Найдите ${p}% от ${n}.`, ans, [`${n}×${p}/100 = ${ans}`]);
    }
    if (type === 1) {
      const price = rInt(500, 5000), disc = pick([5,10,15,20,25]);
      const ans = Calc.discount(price, disc);
      return mk(2,'Дроби и проценты',d, `Цена ${price} руб., скидка ${disc}%. Итог?`, ans,
        [`Скидка: ${Calc.percent(price,disc)} руб.`, `Итог: ${ans} руб.`]);
    }
    const val = rInt(200, 1500), p = pick([10,20,25,50]);
    const ans = Calc.increase(val, p);
    return mk(2,'Дроби и проценты',d, `Число ${val} увеличили на ${p}%. Результат?`, ans,
      [`Прирост: ${Calc.percent(val,p)}`, `Результат: ${ans}`]);
  },
  3: (d) => {
    const type = rInt(0, 2);
    if (type === 0) { const b=rInt(2,9),e=rInt(2,4); return mk(3,'Степени и корни',d,`${b}^${e}=?`,Math.pow(b,e),[`${b}^${e}=${Math.pow(b,e)}`]); }
    if (type === 1) { const r=rInt(2,12); return mk(3,'Степени и корни',d,`√${r*r}=?`,r,[`√${r*r}=${r}`]); }
    const a=rInt(2,5),b=rInt(2,4),ans=Math.pow(a,b+1);
    return mk(3,'Степени и корни',d,`${a}^${b}×${a}=?`,ans,[`${a}^${b}×${a}=${a}^${b+1}=${ans}`]);
  },
  4: (d) => {
    const a=rInt(2,9), c=rInt(2,20), b=a*rInt(2,8)+c;
    const x=Calc.round((b-c)/a,2);
    return mk(4,'Уравнения',d,`${a}x + ${c} = ${b}`,x,
      [`${a}x = ${b}-${c} = ${b-c}`, `x = ${b-c}/${a} = ${x}`]);
  },
  5: (d) => {
    const a=rInt(2,9), b=rInt(5,40), sign=pick(['<','>']);
    const ans=Calc.round(b/a,2);
    return mk(5,'Неравенства',d,`Решите: ${a}x ${sign} ${b}`,`x ${sign} ${ans}`,
      [`${a}x ${sign} ${b}`, `x ${sign} ${ans}`]);
  },
  6: (d) => {
    const k=rInt(-5,5)||1, m=rInt(-8,8), x0=rInt(-4,4);
    const y=k*x0+m;
    return mk(6,'Функции',d,`y = ${k}x + ${m}. Найдите y при x = ${x0}.`,y,
      [`y = ${k}·${x0} + ${m} = ${k*x0} + ${m} = ${y}`]);
  },
  7: (d) => {
    const a=rInt(30,80), b=rInt(20,80-a+20), c=180-a-b;
    return mk(7,'Геометрия (основы)',d,`Два угла треугольника: ${a}° и ${b}°. Третий угол?`,c,
      [`Сумма углов = 180°`, `${c}° = 180° − ${a}° − ${b}°`]);
  },
  8: (d) => {
    const type=rInt(0,2);
    if(type===0){const w=rInt(3,20),h=rInt(3,20);return mk(8,'Площади и периметры',d,`Площадь прямоугольника ${w}×${h} см?`,w*h,[`S=${w}×${h}=${w*h} см²`]);}
    if(type===1){const b=rInt(4,20),h=rInt(4,20),s=Calc.triangleArea(b,h);return mk(8,'Площади и периметры',d,`Площадь треугольника: основание ${b}, высота ${h} см?`,s,[`S=(${b}×${h})/2=${s} см²`]);}
    const r=rInt(2,10),s=Calc.round(Calc.circleArea(r),2);
    return mk(8,'Площади и периметры',d,`Площадь круга r=${r} см?`,s,[`S=π·${r}²≈${s} см²`]);
  },
  9: (d) => {
    const triples=[[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
    const [a,b,c]=pick(triples);
    return mk(9,'Тригонометрия',d,`Катеты ${a} и ${b}. Гипотенуза?`,c,
      [`c²=${a}²+${b}²=${a*a+b*b}`, `c=${c}`]);
  },
  11: (d) => {
    const a1=rInt(2,15), diff=rInt(1,8), n=rInt(5,12);
    const an=a1+(n-1)*diff;
    return mk(11,'Последовательности',d,`a₁=${a1}, d=${diff}. Найдите a${n}.`,an,
      [`a${n}=${a1}+(${n}-1)·${diff}=${an}`]);
  },
  13: (d) => {
    const v=rInt(40,120), t=rInt(1,5), s=v*t;
    return mk(13,'Формулы',d,`Скорость ${v} км/ч, время ${t} ч. Расстояние?`,s,[`s=v·t=${v}·${t}=${s} км`]);
  },
  14: (_d) => {
    const fav=rInt(1,7), total=rInt(fav+2,20), ans=Calc.round(fav/total,2);
    return mk(14,'Вероятность','easy',`В урне ${total} шаров, ${fav} белых. P(белый)?`,ans,[`P=${fav}/${total}≈${ans}`]);
  },
  15: (d) => {
    const vals=Array.from({length:5},()=>rInt(10,90));
    const avg=Calc.round(Calc.average(...vals),1);
    return mk(15,'Статистика',d,`Среднее чисел: ${vals.join(', ')}?`,avg,
      [`Сумма=${vals.reduce((a,b)=>a+b,0)}`, `Среднее=${avg}`]);
  },
  20: (_d) => {
    const x1=rInt(-6,-1), x2=rInt(1,6);
    const b=-(x1+x2), c=x1*x2;
    const bs=b>=0?`+ ${b}`:`− ${Math.abs(b)}`, cs=c>=0?`+ ${c}`:`− ${Math.abs(c)}`;
    return mk(20,'Уравнения (сложные)','hard',`x² ${bs}x ${cs} = 0`,`${Math.min(x1,x2)}; ${Math.max(x1,x2)}`,
      [`D=${b}²−4·${c}=${b*b-4*c}`,`x₁=${Math.min(x1,x2)}, x₂=${Math.max(x1,x2)}`]);
  },
  21: (_d) => {
    const x=rInt(1,7),y=rInt(1,7),c1=rInt(1,3),c2=rInt(1,3);
    const r1=x+c1*y, r2=c2*x+y;
    return mk(21,'Системы уравнений','hard',`{ x+${c1}y=${r1}; ${c2}x+y=${r2} }`,`x=${x}, y=${y}`,
      [`Из 1-го: x=${r1}−${c1}y`, `Подст. в 2-е → y=${y}`, `x=${x}`]);
  },
  22: (_d) => {
    const v1=rInt(40,80), v2=rInt(40,80), dist=rInt(200,600);
    const t=Calc.round(dist/(v1+v2),1);
    return mk(22,'Задачи на движение','hard',
      `Два авто навстречу: ${v1} и ${v2} км/ч, расстояние ${dist} км. Через сколько ч встретятся?`,
      t,[`v_сум=${v1+v2}`, `t=${dist}/${v1+v2}=${t} ч`]);
  },
  23: (_d) => {
    const x1=rInt(-4,0),y1=rInt(-4,0),x2=rInt(1,5),y2=rInt(1,5);
    const d=Calc.round(Math.sqrt((x2-x1)**2+(y2-y1)**2),2);
    return mk(23,'Геометрия (сложная)','hard',
      `Расстояние A(${x1};${y1}) B(${x2};${y2})?`,d,
      [`d=√((${x2-x1})²+(${y2-y1})²)=√${(x2-x1)**2+(y2-y1)**2}≈${d}`]);
  },
  25: (_d) => {
    const n=rInt(3,6); const p=Array.from({length:n},(_,i)=>i+1).reduce((a,b)=>a*b,1);
    return mk(25,'Комбинаторика','hard',`Сколько способов расставить ${n} книги?`,p,[`P=${n}!=${p}`]);
  },
};

const NUMBERS = Object.keys(Generators).map(Number).sort((a,b)=>a-b);

// ─── Bank generator ───────────────────────────────────────────────────────────
function generateFullBank(count, difficulty) {
  const all = [];
  for (const n of NUMBERS) {
    for (let i = 0; i < count; i++) {
      try {
        const t = Generators[n](difficulty);
        t.variant = i + 1;
        all.push(t);
      } catch(e) { /* skip */ }
    }
  }
  return all;
}

function getStats(tasks) {
  const byNum = {}, byTopic = {}, byDiff = { easy:0, medium:0, hard:0 };
  for (const t of tasks) {
    byNum[t.number] = (byNum[t.number] || 0) + 1;
    byTopic[t.topic] = (byTopic[t.topic] || 0) + 1;
    byDiff[t.difficulty] = (byDiff[t.difficulty] || 0) + 1;
  }
  return { total: tasks.length, byDifficulty: byDiff, byNumber: byNum, byTopic };
}

function toCSV(tasks) {
  const hdr = ['ID','Номер','Тема','Сложность','Условие','Ответ','Вариант'];
  const rows = tasks.map(t => [
    t.id, t.number, t.topic, t.difficulty,
    `"${String(t.condition).replace(/"/g,'""')}"`,
    `"${String(t.answer).replace(/"/g,'""')}"`,
    t.variant,
  ]);
  return [hdr, ...rows].map(r => r.join(',')).join('\n');
}

function toSQL(tasks) {
  const now = new Date().toISOString();
  const esc = s => String(s).replace(/'/g,"''");
  const diff = d => d==='easy'?1:d==='hard'?3:2;
  let sql = `-- OGE Task Bank — generated ${now}\n\n`;
  for (const t of tasks) {
    const sol = t.solution ? JSON.stringify(t.solution.map((s,i)=>({step:i+1,detail:s}))) : '[]';
    const tags = JSON.stringify([t.topic, `variant:${t.variant}`]);
    sql += `INSERT INTO "Task"(id,examType,part,taskNumber,description,answer,fullSolution,difficulty,source,tags,verificationStatus,createdAt,updatedAt) VALUES`
         + `('${t.id}','OGE',${t.number<=19?1:2},${t.number},'${esc(t.condition)}','${esc(t.answer)}','${esc(sol)}',${diff(t.difficulty)},'PLATFORM','${esc(tags)}','VERIFIED','${now}','${now}');\n`;
  }
  return sql;
}

// ─── API helpers ───────────────────────────────────────────────────────────────
async function apiPost(url, body) {
  const res = await fetch(`${url}/api/admin/generate-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiGet(url) {
  const res = await fetch(`${url}/api/admin/generate-tasks`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── CLI ───────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = {};
  for (let i = 3; i < argv.length; i++) {
    const m = argv[i].match(/^--([^=]+)=?(.*)$/);
    if (m) a[m[1]] = m[2] || true;
  }
  return a;
}

async function main() {
  const cmd  = process.argv[2] || 'info';
  const args = parseArgs(process.argv);
  const count  = parseInt(args.count  || '50');
  const diff   = args.difficulty || 'medium';
  const apiUrl = args.url || 'http://localhost:3000';

  console.log(`\nГенератор задач ОГЭ по математике\n`);

  switch (cmd) {
    case 'generate': {
      console.log(`Генерирую ${count} вариантов × ${NUMBERS.length} заданий (${diff})...\n`);
      const tasks = generateFullBank(count, diff);
      const stats = getStats(tasks);
      console.log(`Всего: ${stats.total}`);
      console.log('По номерам:', stats.byNumber);
      console.log('\nПервая задача:');
      console.log(JSON.stringify(tasks[0], null, 2));
      break;
    }

    case 'save': {
      console.log(`Генерирую и сохраняю через API (${apiUrl})...\n`);
      const data = await apiPost(apiUrl, { action:'generate-and-save', taskCount:count, difficulty:diff });
      console.log('Ответ API:', JSON.stringify(data, null, 2));
      break;
    }

    case 'export-json': {
      const tasks = generateFullBank(count, diff);
      const fname = `tasks-${Date.now()}.json`;
      fs.writeFileSync(fname, JSON.stringify(tasks, null, 2));
      const kb = (fs.statSync(fname).size / 1024).toFixed(1);
      console.log(`Сохранено ${tasks.length} задач → ${fname} (${kb} KB)`);
      break;
    }

    case 'export-csv': {
      const tasks = generateFullBank(count, diff);
      const fname = `tasks-${Date.now()}.csv`;
      fs.writeFileSync(fname, toCSV(tasks));
      console.log(`Сохранено ${tasks.length} задач → ${fname}`);
      break;
    }

    case 'export-sql': {
      const tasks = generateFullBank(count, diff);
      const fname = `tasks-${Date.now()}.sql`;
      fs.writeFileSync(fname, toSQL(tasks));
      const kb = (fs.statSync(fname).size / 1024).toFixed(1);
      console.log(`Сохранено ${tasks.length} задач → ${fname} (${kb} KB)`);
      break;
    }

    case 'stats': {
      console.log(`Получаю статистику из БД (${apiUrl})...\n`);
      const data = await apiGet(apiUrl);
      if (data.statistics) {
        const s = data.statistics;
        console.log(`Всего в БД: ${s.total}`);
        if (s.byDifficulty)  { console.log('По сложности:'); Object.entries(s.byDifficulty).forEach(([k,v])=>console.log(`  ${k}: ${v}`)); }
        if (s.byTaskNumber)  { console.log('По номерам:');   Object.entries(s.byTaskNumber).sort(([a],[b])=>parseInt(a)-parseInt(b)).forEach(([k,v])=>console.log(`  ${k}: ${v}`)); }
      } else { console.log(JSON.stringify(data, null, 2)); }
      break;
    }

    case 'clear-db': {
      const ans = await ask('Удалить ВСЕ PLATFORM-задачи из БД? (y/n): ');
      if (ans.toLowerCase() === 'y') {
        const data = await apiPost(apiUrl, { action:'clear' });
        console.log(data.message || JSON.stringify(data));
      } else { console.log('Отменено.'); }
      break;
    }

    case 'info':
    default:
      console.log(`Реализованные задания: ${NUMBERS.join(', ')}\n`);
      console.log('Команды:');
      [
        ['generate',    'Генерировать и вывести в консоль'],
        ['save',        'Генерировать + сохранить в БД через API'],
        ['export-json', 'Экспортировать в JSON файл'],
        ['export-csv',  'Экспортировать в CSV файл'],
        ['export-sql',  'Экспортировать в SQL файл'],
        ['stats',       'Статистика БД через API'],
        ['clear-db',    'Очистить PLATFORM-задачи в БД'],
      ].forEach(([c,d]) => console.log(`  ${c.padEnd(14)} — ${d}`));
      console.log('\nПараметры: --count=50  --difficulty=medium  --url=http://localhost:3000');
      console.log('\nПримеры:');
      console.log('  node scripts/generate-tasks.js generate --count=20');
      console.log('  node scripts/generate-tasks.js export-json --count=100 --difficulty=hard');
      console.log('  node scripts/generate-tasks.js save --count=50 --url=http://localhost:3000');
  }

  console.log('\nГотово!\n');
}

function ask(q) {
  return new Promise(res => {
    process.stdout.write(q);
    process.stdin.setEncoding('utf-8');
    process.stdin.once('data', d => { res(d.toString().trim()); process.stdin.destroy(); });
  });
}

main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });

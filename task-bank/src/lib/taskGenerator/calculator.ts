/**
 * Калькулятор для автоматического расчета ответов
 * Поддерживает различные типы выражений и операций
 */

import * as math from 'mathjs';

export class TaskCalculator {
  /**
   * Вычислить математическое выражение
   * Примеры: "2 + 3 * 4", "sqrt(16)", "2^3"
   */
  static evaluate(expression: string): number {
    try {
      const result = math.evaluate(expression);
      return Number(result);
    } catch (error) {
      console.error(`Ошибка при вычислении: ${expression}`, error);
      throw new Error(`Не удалось вычислить выражение: ${expression}`);
    }
  }

  /**
   * Решить линейное уравнение: ax + b = 0
   * @returns x
   */
  static solveLinearEquation(a: number, b: number): number {
    if (a === 0) throw new Error('Коэффициент a не может быть 0');
    return -b / a;
  }

  /**
   * Решить квадратное уравнение: ax² + bx + c = 0
   * @returns массив корней или пустой массив
   */
  static solveQuadraticEquation(a: number, b: number, c: number): number[] {
    if (a === 0) {
      // Это линейное уравнение
      return [this.solveLinearEquation(b, c)];
    }

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return []; // Нет вещественных корней
    }

    if (discriminant === 0) {
      return [-b / (2 * a)];
    }

    const sqrt_d = Math.sqrt(discriminant);
    return [
      (-b + sqrt_d) / (2 * a),
      (-b - sqrt_d) / (2 * a)
    ];
  }

  /**
   * Процент от числа
   */
  static percent(value: number, percentValue: number): number {
    return (value * percentValue) / 100;
  }

  /**
   * Скидка
   */
  static discount(price: number, discountPercent: number): number {
    return price - this.percent(price, discountPercent);
  }

  /**
   * Увеличение на процент
   */
  static increase(value: number, percentValue: number): number {
    return value + this.percent(value, percentValue);
  }

  /**
   * Расстояние между двумя точками
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Площадь треугольника по трем сторонам (формула Герона)
   */
  static triangleAreaByHeron(a: number, b: number, c: number): number {
    const s = (a + b + c) / 2; // полупериметр
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return area;
  }

  /**
   * Площадь треугольника по основанию и высоте
   */
  static triangleArea(base: number, height: number): number {
    return (base * height) / 2;
  }

  /**
   * Площадь прямоугольника
   */
  static rectangleArea(width: number, height: number): number {
    return width * height;
  }

  /**
   * Площадь круга
   */
  static circleArea(radius: number): number {
    return Math.PI * radius * radius;
  }

  /**
   * Длина окружности
   */
  static circumference(radius: number): number {
    return 2 * Math.PI * radius;
  }

  /**
   * Округление до N знаков
   */
  static round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Скорость = расстояние / время
   */
  static speed(distance: number, time: number): number {
    return distance / time;
  }

  /**
   * Время = расстояние / скорость
   */
  static time(distance: number, speed: number): number {
    return distance / speed;
  }

  /**
   * Расстояние = скорость * время
   */
  static distanceBySpeedAndTime(speed: number, time: number): number {
    return speed * time;
  }

  /**
   * Работа = производительность * время
   */
  static work(productivity: number, time: number): number {
    return productivity * time;
  }

  /**
   * Производительность = работа / время
   */
  static productivity(work: number, time: number): number {
    return work / time;
  }

  /**
   * Средняя скорость
   */
  static averageSpeed(totalDistance: number, totalTime: number): number {
    return totalDistance / totalTime;
  }

  /**
   * Проверить, является ли число простым
   */
  static isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  /**
   * НОД (Наибольший общий делитель)
   */
  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * НОК (Наименьшее общее кратное)
   */
  static lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  /**
   * Сумма арифметической прогрессии
   * S = (a1 + an) * n / 2
   */
  static arithmeticSum(firstTerm: number, lastTerm: number, count: number): number {
    return ((firstTerm + lastTerm) * count) / 2;
  }

  /**
   * Сумма геометрической прогрессии
   * S = a1 * (1 - q^n) / (1 - q)
   */
  static geometricSum(firstTerm: number, ratio: number, count: number): number {
    if (ratio === 1) {
      return firstTerm * count;
    }
    return (firstTerm * (1 - Math.pow(ratio, count))) / (1 - ratio);
  }

  /**
   * Средний результат (среднее арифметическое)
   */
  static average(...values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Медиана
   */
  static median(...values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Вероятность
   */
  static probability(favorable: number, total: number): number {
    return favorable / total;
  }
}

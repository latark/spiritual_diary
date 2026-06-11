import type { Valence } from './valence';

/**
 * Тёплая строка о сдвиге силы эмоции после дыхания (показывается на завершении).
 * Не метрика и не оценка «получилось/нет»: если чувство не отступило — это не ошибка.
 * Для светлых эмоций дыхание усиливает свет, для тяжёлых — отпускает тяжесть.
 */
export function reliefMessage(
  valence: Valence,
  before: number,
  after: number | null,
): string | null {
  if (after === null) return null;

  if (valence === 'positive') {
    if (after > before) return 'Света стало больше. Ты дала ему расти.';
    if (after === before) return 'Свет с тобой. Он никуда не уходит.';
    return 'Даже тихий свет — это свет.';
  }

  const released = before - after;
  if (released >= 2) return 'Тяжесть отступила. Дыхание сделало своё.';
  if (released === 1) return 'Стало чуть легче. Этого довольно.';
  if (released === 0) return 'Чувство ещё с тобой — и это не ошибка.';
  return 'Чувство откликнулось сильнее. Ты услышала его — это важно.';
}

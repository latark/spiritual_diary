import { CHAKRAS, type ChakraId, type ChakraProfile } from '@/shared/content/chakras';

import { computeEnergyAt, type EnergyEntry } from './energy';

export type PeriodId = 'week' | 'month' | 'quarter' | 'year';

export interface PeriodDef {
  id: PeriodId;
  label: string;
  days: number;
  /** Сколько точек выборки внутри окна (узлы линии тренда). */
  samples: number;
}

export const PERIODS = [
  { id: 'week', label: 'Неделя', days: 7, samples: 8 },
  { id: 'month', label: 'Месяц', days: 30, samples: 7 },
  { id: 'quarter', label: '3 месяца', days: 90, samples: 7 },
  { id: 'year', label: 'Год', days: 365, samples: 13 },
] as const satisfies readonly PeriodDef[];

const DAY = 86_400_000;

/** Текущее время — вынесено в функцию, чтобы не вызывать Date.now() в теле компонента. */
export const nowMs = (): number => Date.now();

export interface EnergyWindow {
  from: number;
  to: number;
  /** Серия уровней по чакрам в порядке выборок (старое → новое). */
  series: Record<ChakraId, number[]>;
}

/**
 * Окно периода со смещением назад (offset: 0 — текущее, 1 — предыдущее, …) и серией уровней
 * каждой чакры по равномерным выборкам внутри окна. Уровни считаются той же механикой
 * (старт онбординга + влияние записей до момента выборки).
 */
export function computeWindow(
  initial: ChakraProfile,
  entries: EnergyEntry[],
  period: PeriodDef,
  offset: number,
  now: number,
): EnergyWindow {
  const span = period.days * DAY;
  const to = now - offset * span;
  const from = to - span;
  const n = period.samples;

  const stamps = Array.from({ length: n }, (_, i) => from + (i * span) / (n - 1));
  const profiles = stamps.map((t) => computeEnergyAt(initial, entries, t));

  const series = {} as Record<ChakraId, number[]>;
  for (const c of CHAKRAS) series[c.id] = profiles.map((p) => p[c.id]);
  return { from, to, series };
}

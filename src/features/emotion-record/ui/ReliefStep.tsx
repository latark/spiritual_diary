'use client';

import { useState } from 'react';

import { IntensityDots } from './IntensityDots';
import type { Valence } from '../model/valence';

/**
 * «Петля облегчения»: после дыхания — мягкая переоценка силы эмоции. Та же шкала огоньков,
 * что и в начале, чтобы сдвиг считывался телом. Переоценку можно пропустить. После выбора
 * запись сохраняется (сравнение intensity → intensity_after уходит в БД).
 */
export function ReliefStep({
  color,
  valence,
  onSubmit,
}: {
  color: string;
  valence: Valence;
  /** Переоценка силы (1..5) или null, если шаг пропустили. */
  onSubmit: (after: number | null) => void;
}) {
  const [level, setLevel] = useState<number | null>(null);
  const isPositive = valence === 'positive';

  return (
    <div className="animate-fade-up flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">
          {isPositive ? 'Сколько света сейчас?' : 'Прислушайся — как это сейчас?'}
        </h2>
        <p className="text-ink-muted mt-1 text-sm">то же чувство, после дыхания</p>
      </div>

      <IntensityDots color={color} value={level} onChange={setLevel} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
        >
          пропустить
        </button>
        <button
          type="button"
          onClick={() => level !== null && onSubmit(level)}
          disabled={level === null}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300 disabled:opacity-40 disabled:ring-transparent"
        >
          Сохранить в свет
        </button>
      </div>
    </div>
  );
}

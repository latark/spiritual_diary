'use client';

import { useState } from 'react';

import { IntensityDots } from './IntensityDots';

export function IntensityStep({
  color,
  onSubmit,
  onBack,
}: {
  color: string;
  onSubmit: (level: number) => void;
  onBack: () => void;
}) {
  const [level, setLevel] = useState<number | null>(null);

  return (
    <div className="animate-fade-up flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Выбери силу эмоции</h2>
        <p className="text-ink-muted mt-1 text-sm">насколько это сейчас в тебе?</p>
      </div>

      <IntensityDots color={color} value={level} onChange={setLevel} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
        >
          ← назад
        </button>
        <button
          type="button"
          onClick={() => level !== null && onSubmit(level)}
          disabled={level === null}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300 disabled:opacity-40 disabled:ring-transparent"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

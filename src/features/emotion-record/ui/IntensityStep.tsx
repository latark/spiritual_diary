'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

/** Поэтичные подписи к уровням (без цифр). */
const CAPTIONS = ['едва касается', 'тихо звучит', 'ощущается ясно', 'захватывает', 'переполняет'];

/** Диаметры огоньков (растут слева направо). */
const SIZES = [18, 25, 32, 40, 50];

function buzz(ms = 6): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ms);
  }
}

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
        <h2 className="font-display text-ink text-2xl">Насколько сильно?</h2>
        <p className="text-ink-muted mt-1 text-sm">коснись, насколько это сейчас в тебе</p>
      </div>

      <div className="flex h-20 items-end justify-center gap-3">
        {SIZES.map((size, i) => {
          const n = i + 1;
          const lit = level !== null && n <= level;
          const isTop = level === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Уровень ${n}`}
              onClick={() => {
                buzz();
                setLevel(n);
              }}
              className="flex items-end"
              style={{ height: SIZES[SIZES.length - 1], cursor: 'pointer' }}
            >
              <span
                className={cn(
                  'rounded-full transition-all duration-300',
                  isTop && 'animate-breathe',
                )}
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  opacity: lit ? 1 : 0.18,
                  boxShadow: lit ? `0 0 ${8 + i * 4}px ${color}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>

      <p className="font-display text-ink min-h-[1.5rem] text-lg">
        {level !== null ? CAPTIONS[level - 1] : ''}
      </p>

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

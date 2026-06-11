'use client';

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

/**
 * Ряд «огоньков» 1..5 с подписью — общая шкала силы эмоции. Используется и при записи
 * (IntensityStep), и при переоценке после дыхания (ReliefStep): один и тот же образ,
 * чтобы сдвиг считывался телом, а не цифрой.
 */
export function IntensityDots({
  color,
  value,
  onChange,
}: {
  color: string;
  value: number | null;
  onChange: (level: number) => void;
}) {
  return (
    <>
      <div className="flex h-20 items-end justify-center gap-3">
        {SIZES.map((size, i) => {
          const n = i + 1;
          const lit = value !== null && n <= value;
          const isTop = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Уровень ${n}`}
              onClick={() => {
                buzz();
                onChange(n);
              }}
              className="flex items-end"
              style={{ height: SIZES[SIZES.length - 1], cursor: 'pointer' }}
            >
              <span
                className={cn('rounded-full transition-all duration-300', isTop && 'animate-breathe')}
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
        {value !== null ? CAPTIONS[value - 1] : ''}
      </p>
    </>
  );
}

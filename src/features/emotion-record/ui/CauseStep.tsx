'use client';

import { useState } from 'react';

import { LIFE_SPHERES, LIFE_SPHERE_BY_ID, type LifeSphereId } from '@/shared/content/life-spheres';
import { cn } from '@/shared/lib/cn';

export interface CauseValue {
  sphereId: LifeSphereId | null;
  /** Уточнение — под-область сферы (из каталога, не свободный текст). '' = сфера в целом. */
  area: string;
}

export function CauseStep({
  onSubmit,
  onBack,
}: {
  onSubmit: (value: CauseValue) => void;
  onBack: () => void;
}) {
  const [sphereId, setSphereId] = useState<LifeSphereId | null>(null);
  const [area, setArea] = useState('');

  const areas = sphereId ? LIFE_SPHERE_BY_ID[sphereId].areas : [];

  return (
    <div className="animate-fade-up flex flex-col items-center gap-5">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Что вызвало это чувство?</h2>
        <p className="text-ink-muted mt-1 text-sm">выбери сферу жизни — и, если хочешь, уточни</p>
      </div>

      <div className="flex max-w-md flex-wrap justify-center gap-2">
        {LIFE_SPHERES.map((s) => {
          const selected = sphereId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSphereId(selected ? null : s.id);
                setArea('');
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm transition-shadow duration-200',
                selected
                  ? 'bg-gold text-canvas shadow-glow'
                  : 'bg-surface-raised text-ink hover:text-gold',
              )}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {sphereId && (
        <div className="animate-fade-up flex max-w-md flex-wrap justify-center gap-2">
          {areas.map((a) => {
            const selected = area === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setArea(selected ? '' : a)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs transition-shadow duration-200',
                  selected
                    ? 'bg-surface-raised text-ink ring-gold shadow-glow-soft ring-1'
                    : 'bg-surface-raised/60 text-ink-muted hover:text-ink',
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      )}

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
          onClick={() => sphereId && onSubmit({ sphereId, area })}
          disabled={sphereId === null}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300 disabled:opacity-40 disabled:ring-transparent"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

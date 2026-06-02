'use client';

import { useState } from 'react';

import { detectCrisis } from '@/shared/safety';
import { LIFE_SPHERES, type LifeSphereId } from '@/shared/content/life-spheres';
import { cn } from '@/shared/lib/cn';

export interface CauseValue {
  sphereId: LifeSphereId | null;
  custom: string;
}

export function CauseStep({
  onSubmit,
  onBack,
  onCrisis,
}: {
  onSubmit: (value: CauseValue) => void;
  onBack: () => void;
  onCrisis: () => void;
}) {
  const [sphereId, setSphereId] = useState<LifeSphereId | null>(null);
  const [custom, setCustom] = useState('');

  const canContinue = sphereId !== null || custom.trim().length > 0;

  function submit(): void {
    const trimmed = custom.trim();
    if (trimmed) {
      if (detectCrisis(trimmed).triggered) {
        onCrisis();
        return;
      }
      onSubmit({ sphereId: null, custom: trimmed });
      return;
    }
    if (sphereId) onSubmit({ sphereId, custom: '' });
  }

  return (
    <div className="animate-fade-up flex flex-col items-center gap-5">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Что вызвало это чувство?</h2>
        <p className="text-ink-muted mt-1 text-sm">выбери сферу жизни — или впиши свою причину</p>
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
                setCustom('');
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

      <div className="w-full max-w-md">
        <input
          type="text"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            if (e.target.value) setSphereId(null);
          }}
          placeholder="или своя причина…"
          maxLength={200}
          className="bg-surface-raised text-ink placeholder:text-ink-muted/60 focus:ring-gold/50 w-full rounded-lg px-4 py-3 text-sm focus:ring-1 focus:outline-none"
        />
      </div>

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
          onClick={submit}
          disabled={!canContinue}
          className="bg-gold text-canvas enabled:hover:shadow-glow h-11 rounded-lg px-6 font-medium transition-shadow duration-300 disabled:opacity-40"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

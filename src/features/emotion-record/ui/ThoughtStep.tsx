'use client';

import { useMemo, useState } from 'react';

import { BACKGROUND_THOUGHTS } from '@/shared/content/background-thoughts';
import type { LifeSphereId } from '@/shared/content/life-spheres';
import { detectCrisis } from '@/shared/safety';
import { cn } from '@/shared/lib/cn';

export interface ThoughtValue {
  thoughtId: number | null;
  custom: string;
}

export function ThoughtStep({
  familyId,
  sphereId,
  onSubmit,
  onBack,
  onCrisis,
}: {
  familyId: string;
  sphereId: LifeSphereId | null;
  onSubmit: (value: ThoughtValue) => void;
  onBack: () => void;
  onCrisis: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { primary, all } = useMemo(() => {
    const emotionFirst = (arr: typeof BACKGROUND_THOUGHTS) =>
      [...arr].sort(
        (a, b) =>
          Number(b.negativeEmotions.includes(familyId)) -
          Number(a.negativeEmotions.includes(familyId)),
      );
    const base = sphereId
      ? BACKGROUND_THOUGHTS.filter((t) => t.sphere === sphereId)
      : BACKGROUND_THOUGHTS.filter((t) => t.negativeEmotions.includes(familyId));
    return { primary: emotionFirst(base), all: emotionFirst(BACKGROUND_THOUGHTS) };
  }, [familyId, sphereId]);

  const list = showAll || primary.length === 0 ? all : primary;
  const canContinue = selectedId !== null || custom.trim().length > 0;

  function submit(): void {
    const trimmed = custom.trim();
    if (trimmed) {
      if (detectCrisis(trimmed).triggered) {
        onCrisis();
        return;
      }
      onSubmit({ thoughtId: null, custom: trimmed });
      return;
    }
    onSubmit({ thoughtId: selectedId, custom: '' });
  }

  return (
    <div className="animate-fade-up flex w-full flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Какая мысль сейчас фоном?</h2>
        <p className="text-ink-muted mt-1 text-sm">
          часто за чувством стоит привычная установка — выбери близкую
        </p>
      </div>

      <div className="max-h-[46vh] w-full max-w-md space-y-2 overflow-y-auto pr-1">
        {list.map((t) => {
          const selected = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedId(selected ? null : t.id);
                setCustom('');
              }}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-left text-sm leading-snug transition-shadow duration-200',
                selected
                  ? 'bg-surface-raised text-ink shadow-glow ring-gold ring-1'
                  : 'bg-surface-raised/60 text-ink-muted hover:text-ink',
              )}
            >
              {t.negative}
            </button>
          );
        })}
      </div>

      {!showAll && primary.length > 0 && primary.length < all.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-ink-muted hover:text-gold text-sm underline-offset-4 transition-colors duration-200"
        >
          показать все установки
        </button>
      )}

      <div className="w-full max-w-md">
        <input
          type="text"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            if (e.target.value) setSelectedId(null);
          }}
          placeholder="или своя мысль…"
          maxLength={300}
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
          onClick={() => onSubmit({ thoughtId: null, custom: '' })}
          className="text-ink-muted hover:text-gold rounded-full px-3 py-2 text-sm transition-colors duration-200"
        >
          пропустить
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

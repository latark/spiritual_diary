'use client';

import { useMemo, useRef, useState } from 'react';

import {
  THOUGHTS_BY_SHADE,
  THOUGHTS_BY_SPHERE,
  thoughtsByFamily,
  type BackgroundThought,
} from '@/shared/content/background-thoughts';
import type { LifeSphereId } from '@/shared/content/life-spheres';
import { detectCrisis } from '@/shared/safety';
import { cn } from '@/shared/lib/cn';

import { checkCrisisAction } from '../model/crisis-check-action';
import type { Valence } from '../model/valence';

export interface ThoughtValue {
  thoughtId: number | null;
  custom: string;
}

function dedup(list: BackgroundThought[]): BackgroundThought[] {
  const seen = new Set<number>();
  return list.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

const ALL_SPHERE_THOUGHTS = [...THOUGHTS_BY_SPHERE.values()].flat();

export function ThoughtStep({
  valence,
  familyId,
  shadeId,
  sphereId,
  onSubmit,
  onBack,
  onCrisis,
}: {
  valence: Valence;
  familyId: string;
  shadeId: string;
  sphereId: LifeSphereId | null;
  onSubmit: (value: ThoughtValue) => void;
  onBack: () => void;
  onCrisis: () => void;
}) {
  const isPositive = valence === 'positive';
  const label = (t: BackgroundThought) => (isPositive ? t.positive : t.negative);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [checking, setChecking] = useState(false);
  const submitting = useRef(false);

  const { primary, all } = useMemo(() => {
    const shade = THOUGHTS_BY_SHADE.get(shadeId) ?? [];
    const family = thoughtsByFamily(familyId);
    const sphere = sphereId ? (THOUGHTS_BY_SPHERE.get(sphereId) ?? []) : [];

    // По оттенку показываем 2 его мысли; если у оттенка нет (центры/«Отвращение») —
    // фолбэк на семью. Плюс 2 мысли выбранной сферы. «Показать все» — вся семья + сферы.
    const base = shade.length ? shade : family;
    return {
      primary: dedup([...base, ...sphere]),
      all: dedup([...family, ...ALL_SPHERE_THOUGHTS]),
    };
  }, [shadeId, familyId, sphereId]);

  const list = showAll || primary.length === 0 ? all : primary;
  const canContinue = selectedId !== null || custom.trim().length > 0;

  async function submit(): Promise<void> {
    if (submitting.current) return;
    const trimmed = custom.trim();
    if (trimmed) {
      if (detectCrisis(trimmed).triggered) {
        // Флаг куратору — safety-сигнал (§6): дожидаемся записи, не fire-and-forget.
        // На кризисном пути пользователь не доходит до save-action, поэтому гарантия здесь.
        await checkCrisisAction(trimmed, 'record_thought');
        onCrisis();
        return;
      }
      submitting.current = true;
      setChecking(true);
      try {
        const result = await checkCrisisAction(trimmed, 'record_thought');
        if (result.crisis) {
          onCrisis();
          return;
        }
        onSubmit({ thoughtId: null, custom: trimmed });
      } finally {
        submitting.current = false;
        setChecking(false);
      }
      return;
    }
    onSubmit({ thoughtId: selectedId, custom: '' });
  }

  return (
    <div className="animate-fade-up flex w-full flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">
          {isPositive ? 'Какая светлая мысль за этим стоит?' : 'Какая мысль сейчас фоном?'}
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          {isPositive
            ? 'выбери близкое убеждение — и дай ему окрепнуть'
            : 'часто за чувством стоит привычная мысль — выбери близкую'}
        </p>
      </div>

      <div
        className="max-h-[46vh] w-full max-w-lg space-y-2 overflow-y-auto px-5 py-5"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 20px, #000 calc(100% - 20px), transparent)',
          maskImage:
            'linear-gradient(to bottom, transparent, #000 20px, #000 calc(100% - 20px), transparent)',
        }}
      >
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
              {label(t)}
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
          показать больше
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
          placeholder={isPositive ? 'или свои слова…' : 'или своя мысль…'}
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
          disabled={!canContinue || checking}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300 disabled:opacity-40 disabled:ring-transparent"
        >
          {checking ? '…' : 'Далее'}
        </button>
      </div>
    </div>
  );
}

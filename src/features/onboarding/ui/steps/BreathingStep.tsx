'use client';

import { useEffect, useState } from 'react';

import { ContinueButton } from '../ContinueButton';

const DURATION_SEC = 60;

export function BreathingStep({ onFinish }: { onFinish: () => void }) {
  const [remaining, setRemaining] = useState(DURATION_SEC);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const done = remaining <= 0;

  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">
      <div>
        <h2 className="font-display text-ink text-2xl">Настройка канала</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Сделай несколько спокойных вдохов и выдохов вместе с кругом.
        </p>
      </div>

      <div className="flex h-48 items-center justify-center">
        <div className="animate-breathe from-gold-soft to-violet shadow-glow size-32 rounded-full bg-gradient-to-br" />
      </div>

      <p className="font-display text-ink-muted text-xl tabular-nums">
        {done ? 'Готово' : `0:${remaining.toString().padStart(2, '0')}`}
      </p>

      <div className="w-full">
        <ContinueButton onClick={onFinish}>
          {done ? 'Войти в дневник' : 'Пропустить и войти'}
        </ContinueButton>
      </div>
    </div>
  );
}

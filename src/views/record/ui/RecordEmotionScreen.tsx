'use client';

import { useState } from 'react';

import { EmotionWheel, type SelectedEmotion } from '@/features/emotion-wheel';

export function RecordEmotionScreen() {
  const [chosen, setChosen] = useState<SelectedEmotion | null>(null);

  if (chosen) {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-5 pt-10 text-center">
        <p className="text-ink-muted">Ты отметила</p>
        <div className="flex items-center gap-3">
          <span
            className="inline-block size-5 rounded-full"
            style={{ backgroundColor: chosen.color, boxShadow: `0 0 16px -2px ${chosen.color}` }}
          />
          <span className="font-display text-ink text-3xl">{chosen.name}</span>
        </div>
        <p className="text-ink-muted max-w-sm text-sm">
          Дальнейшие шаги записи — интенсивность, причина, ощущения в теле, дыхание — появятся здесь
          в следующей фазе.
        </p>
        <button
          type="button"
          onClick={() => setChosen(null)}
          className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
        >
          ← выбрать заново
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <EmotionWheel onSelect={setChosen} />
    </div>
  );
}

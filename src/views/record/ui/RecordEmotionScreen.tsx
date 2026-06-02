'use client';

import { useState } from 'react';

import { BodyMap, familyValence } from '@/features/emotion-record';
import { EmotionWheel, type SelectedEmotion } from '@/features/emotion-wheel';

export function RecordEmotionScreen() {
  const [chosen, setChosen] = useState<SelectedEmotion | null>(null);
  const [bodyZones, setBodyZones] = useState<string[]>([]);

  function reset(): void {
    setChosen(null);
    setBodyZones([]);
  }

  if (chosen) {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-5 pt-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block size-4 rounded-full"
              style={{ backgroundColor: chosen.color, boxShadow: `0 0 14px -2px ${chosen.color}` }}
            />
            <span className="font-display text-ink text-2xl">{chosen.name}</span>
          </div>
          <h2 className="font-display text-ink mt-2 text-xl">Где это откликается в теле?</h2>
          <p className="text-ink-muted text-sm">можно выбрать несколько мест</p>
        </div>

        <BodyMap
          valence={familyValence(chosen.familyId)}
          value={bodyZones}
          onChange={setBodyZones}
        />

        <button
          type="button"
          onClick={reset}
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

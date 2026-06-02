'use client';

import { useState } from 'react';

import { RecordSteps, type RecordEmotion } from '@/features/emotion-record';

const MOCK: Record<'negative' | 'positive', RecordEmotion> = {
  negative: {
    familyId: 'anger',
    familyName: 'Гнев',
    shadeId: 'anger_4',
    name: 'Зависть',
    color: '#a9686a',
  },
  positive: {
    familyId: 'joy',
    familyName: 'Радость',
    shadeId: 'joy_3',
    name: 'Воодушевление',
    color: '#c5aa77',
  },
};

export default function DevFlowPage() {
  const [kind, setKind] = useState<'negative' | 'positive'>('negative');
  const [run, setRun] = useState(0);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-5 py-8">
      <div className="text-center">
        <h1 className="font-display text-ink text-2xl">Поток записи · стенд</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Причина → (мысль для негатива) → тело. Без колеса и логина.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setKind('negative');
            setRun((n) => n + 1);
          }}
          className="rounded-lg px-4 py-2 text-sm"
          style={{
            backgroundColor: kind === 'negative' ? '#D4AF37' : 'transparent',
            color: kind === 'negative' ? '#0F0B1F' : '#b0a8c5',
            outline: kind === 'negative' ? 'none' : '1px solid rgba(176,168,197,0.3)',
          }}
        >
          негатив (Гнев·Зависть)
        </button>
        <button
          type="button"
          onClick={() => {
            setKind('positive');
            setRun((n) => n + 1);
          }}
          className="rounded-lg px-4 py-2 text-sm"
          style={{
            backgroundColor: kind === 'positive' ? '#D4AF37' : 'transparent',
            color: kind === 'positive' ? '#0F0B1F' : '#b0a8c5',
            outline: kind === 'positive' ? 'none' : '1px solid rgba(176,168,197,0.3)',
          }}
        >
          позитив (Радость)
        </button>
      </div>

      <RecordSteps
        key={`${kind}-${run}`}
        emotion={MOCK[kind]}
        onReset={() => setRun((n) => n + 1)}
      />
    </div>
  );
}

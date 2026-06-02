'use client';

import { useState } from 'react';

import { BodyMap, type Valence } from '@/features/emotion-record';

export default function DevBodyPage() {
  const [valence, setValence] = useState<Valence>('negative');
  const [zones, setZones] = useState<string[]>([]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 py-8">
      <div className="text-center">
        <h1 className="font-display text-ink text-2xl">Локализация в теле · стенд</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Тапай по зонам тела. Маркер зависит от валентности эмоции.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setValence('positive')}
          className="rounded-lg px-4 py-2 text-sm"
          style={{
            backgroundColor: valence === 'positive' ? '#D4AF37' : 'transparent',
            color: valence === 'positive' ? '#0F0B1F' : '#b0a8c5',
            outline: valence === 'positive' ? 'none' : '1px solid rgba(176,168,197,0.3)',
          }}
        >
          позитив · светлячок
        </button>
        <button
          type="button"
          onClick={() => setValence('negative')}
          className="rounded-lg px-4 py-2 text-sm"
          style={{
            backgroundColor: valence === 'negative' ? '#D4AF37' : 'transparent',
            color: valence === 'negative' ? '#0F0B1F' : '#b0a8c5',
            outline: valence === 'negative' ? 'none' : '1px solid rgba(176,168,197,0.3)',
          }}
        >
          негатив · колючка
        </button>
      </div>

      <BodyMap valence={valence} value={zones} onChange={setZones} />

      <button
        type="button"
        onClick={() => setZones([])}
        className="bg-surface-raised text-ink rounded-lg px-4 py-2 text-sm"
      >
        Сбросить
      </button>

      <pre className="bg-surface text-ink-muted w-full overflow-x-auto rounded-lg p-3 text-xs">
        {JSON.stringify(zones)}
      </pre>
    </div>
  );
}

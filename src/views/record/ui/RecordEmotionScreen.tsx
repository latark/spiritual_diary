'use client';

import { useState } from 'react';

import { RecordSteps } from '@/features/emotion-record';
import { EmotionWheel, type SelectedEmotion } from '@/features/emotion-wheel';

export function RecordEmotionScreen() {
  const [chosen, setChosen] = useState<SelectedEmotion | null>(null);

  if (chosen) {
    return <RecordSteps emotion={chosen} onReset={() => setChosen(null)} />;
  }

  return (
    <div className="pt-4">
      <EmotionWheel onSelect={setChosen} />
    </div>
  );
}

'use client';

import { useState } from 'react';

import { ReflectionOverlay, causeLabel, thoughtLabel } from '@/entities/emotion-entry';
import { cn } from '@/shared/lib/cn';
import { EmotionDot } from '@/shared/ui/EmotionDot';
import { IntensityMeter } from '@/shared/ui/IntensityMeter';

import { MetaLine } from './MetaLine';
import { recalledWhen } from '../model/recalled-when';
import type { ReturnMoment } from '../model/types';

export function ReturnMomentCard({ moment }: { moment: ReturnMoment }) {
  const positive = moment.valence === 'positive';
  const cause = causeLabel(moment);
  const thought = thoughtLabel(moment);

  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div className="bg-surface-raised animate-fade-up rounded-xl p-4">
      <div className="flex items-center gap-2.5">
        <EmotionDot color={moment.emotionColor} positive={positive} />
        <span className="font-display text-ink text-lg">{moment.emotionName}</span>
        <span className="text-ink-muted/70 ml-auto text-xs">{recalledWhen(moment.createdAt)}</span>
      </div>

      <div className="mt-2.5">
        <IntensityMeter level={moment.intensity} color={moment.emotionColor} />
      </div>

      {(cause || thought) && (
        <div className="mt-3 space-y-1">
          {cause && <MetaLine lead="причина —">{cause}</MetaLine>}
          {thought && <MetaLine lead="мысль —">«{thought}»</MetaLine>}
        </div>
      )}

      {saved ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-ink/90 text-sm leading-relaxed whitespace-pre-line">{saved}</p>
          <p className="text-gold/80 text-xs">Сохранено в твоё световое тело</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'mt-3 text-left text-sm transition-colors duration-200',
            'text-gold/70 hover:text-gold',
          )}
        >
          осмыслить
        </button>
      )}

      {open && (
        <ReflectionOverlay
          entry={moment}
          onSaved={(text) => {
            setSaved(text);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

import { ReflectionOverlay, causeLabel, thoughtLabel } from '@/entities/emotion-entry';
import { cn } from '@/shared/lib/cn';

import { recalledWhen } from '../model/recalled-when';
import type { ReturnMoment } from '../model/types';

function MetaLine({ lead, children }: { lead: string; children: React.ReactNode }) {
  return (
    <p className="text-ink-muted text-sm leading-relaxed">
      <span className="text-ink-muted/45">{lead} </span>
      {children}
    </p>
  );
}

function EmotionDot({ color, positive }: { color: string; positive: boolean }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-full"
      style={{
        backgroundColor: color,
        // светлячок (позитив) — тёплое свечение; колючка (негатив) — матовая точка с тёмным ядром.
        boxShadow: positive ? `0 0 12px -1px ${color}` : 'inset 0 0 0 2px rgba(15, 11, 31, 0.45)',
      }}
    />
  );
}

function IntensityDots({ level, color }: { level: number; color: string }) {
  return (
    <span className="flex items-center gap-1" aria-label={`сила ${level} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const lit = n <= level;
        return (
          <span
            key={n}
            className="size-1.5 rounded-full transition-opacity duration-300"
            style={{
              backgroundColor: color,
              opacity: lit ? 1 : 0.16,
              boxShadow: lit ? `0 0 6px -1px ${color}` : 'none',
            }}
          />
        );
      })}
    </span>
  );
}

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
        <IntensityDots level={moment.intensity} color={moment.emotionColor} />
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

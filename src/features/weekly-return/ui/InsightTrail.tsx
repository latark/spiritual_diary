'use client';

import { useState } from 'react';

import { causeLabel, thoughtLabel } from '@/entities/emotion-entry';
import { EmotionDot } from '@/shared/ui/EmotionDot';

import { MetaLine } from './MetaLine';
import { recalledWhen } from '../model/recalled-when';
import type { ReturnMoment } from '../model/types';

/** Сколько осознаний показываем сразу; «показать ещё» открывает столько же. */
const PAGE = 4;

function InsightCard({ moment }: { moment: ReturnMoment }) {
  const positive = moment.valence === 'positive';
  const cause = causeLabel(moment);
  const thought = thoughtLabel(moment);
  return (
    <div className="bg-surface-raised animate-fade-up rounded-xl p-4">
      <div className="flex items-center gap-2.5">
        <EmotionDot color={moment.emotionColor} positive={positive} size="sm" />
        <span className="font-display text-ink text-base">{moment.emotionName}</span>
        <span className="text-ink-muted/70 ml-auto text-xs">{recalledWhen(moment.createdAt)}</span>
      </div>

      {(cause || thought) && (
        <div className="mt-2.5 space-y-1">
          {cause && <MetaLine lead="причина —">{cause}</MetaLine>}
          {thought && <MetaLine lead="мысль —">«{thought}»</MetaLine>}
        </div>
      )}

      <p className="text-ink/90 mt-2.5 text-sm leading-relaxed whitespace-pre-line">
        {moment.awareness}
      </p>
    </div>
  );
}

export function InsightTrail({ insights }: { insights: ReturnMoment[] }) {
  const [visible, setVisible] = useState(PAGE);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-ink text-2xl">Осознания</h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          Здесь остаётся то, что ты поняла о себе. Каждый инсайт — это ещё один шаг к осознанности
        </p>
      </header>

      {insights.length === 0 ? (
        <p className="text-ink-muted/80 text-sm leading-relaxed">
          Пока пусто. Когда ты вернёшься к чувству и запишешь осознание — оно засветится здесь.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {insights.slice(0, visible).map((moment) => (
              <InsightCard key={moment.id} moment={moment} />
            ))}
          </div>
          {visible < insights.length && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="text-ink-muted hover:text-gold self-center text-sm underline-offset-4 transition-colors duration-200"
            >
              показать ещё
            </button>
          )}
        </>
      )}
    </section>
  );
}

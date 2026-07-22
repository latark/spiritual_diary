'use client';

import type { LatestWeekly } from '../model/types';

/**
 * «Послание проводника» — герой «Пути». Показывает последнее недельное послание голосом тотема
 * (ready) либо мягкое состояние (мало записей / послание в пути). Safe_fallback и error не
 * раскрываем — тёплая нейтральная строка вместо текста (§6: подавлённый ИИ-ответ не показываем).
 */
export function WeeklyMessageCard({ analysis }: { analysis: LatestWeekly | null }) {
  const m = analysis?.status === 'ready' ? analysis.message : null;

  return (
    <section className="bg-surface/40 ring-gold/12 animate-fade-up flex flex-col gap-4 rounded-2xl px-6 py-7 ring-1">
      <header className="flex items-center gap-2.5">
        <span className="bg-gold-soft animate-breathe shadow-glow-soft size-2 rounded-full" />
        <h2 className="font-display text-ink text-2xl">Послание проводника</h2>
      </header>

      {analysis === null ? (
        <p className="text-ink-muted text-sm leading-relaxed">
          Здесь зазвучит голос твоего проводника. Он придёт, когда в неделе наберётся достаточно
          записей.
        </p>
      ) : m ? (
        <div className="flex flex-col gap-3">
          <p className="font-display text-ink text-xl leading-snug">{m.greeting}</p>
          <p className="text-ink/90 leading-relaxed">{m.pattern}</p>
          <p className="text-ink/90 leading-relaxed">{m.softening}</p>
          <p className="text-gold/90 leading-relaxed">{m.invitation}</p>
        </div>
      ) : analysis.status === 'skipped_low_data' ? (
        <p className="text-ink-muted text-sm leading-relaxed">
          На этой неделе записей совсем мало — побудем в тишине. Голос вернётся, когда ты заглянешь
          чаще.
        </p>
      ) : (
        <p className="text-ink-muted text-sm leading-relaxed">
          Послание ещё в пути… вернёмся к нему чуть позже.
        </p>
      )}
    </section>
  );
}

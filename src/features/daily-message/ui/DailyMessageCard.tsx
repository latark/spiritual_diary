'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ROUTES } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/cn';

import type { DailyMessage } from '../model/types';

/**
 * Карта «послания дня». Если у пары есть тёмная сторона — карта переворачивается
 * (знакомая мысль → её свет). На светлой стороне — приглашение пронаблюдать сегодня
 * созвучную эмоцию. Наблюдение не собирается формой: заметишь — запишешь обычным потоком.
 */
export function DailyMessageCard({ message }: { message: DailyMessage }) {
  const hasShadow = message.attitude.negative !== null;
  const [flipped, setFlipped] = useState(!hasShadow);

  const light = (
    <div className="bg-surface flex h-full flex-col justify-between gap-6 rounded-[2rem] p-6 text-center shadow-[var(--shadow-glow-soft)]">
      <p className="text-ink-muted/70 font-sans text-xs tracking-wide">{message.sphere.name}</p>

      <p className="font-display text-ink text-xl leading-snug text-balance">
        {message.attitude.positive}
      </p>

      <div className="flex flex-col items-center gap-2">
        <p className="text-ink-muted font-sans text-sm">Сегодня загляни в это чувство</p>
        <span className="inline-flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: message.recommended.color }}
            aria-hidden
          />
          <span className="font-display text-gold text-xl">{message.recommended.name}</span>
        </span>
        {message.recommended.gift ? (
          <p className="text-ink-muted/80 mt-1 font-sans text-sm leading-relaxed text-balance">
            {message.recommended.gift}
          </p>
        ) : null}
      </div>

      <Link
        href={ROUTES.record}
        className="text-ink-muted/60 hover:text-gold font-sans text-xs underline underline-offset-4 transition-colors duration-300"
      >
        заметишь его — запиши
      </Link>
    </div>
  );

  // Размер карты совпадает с рамкой тела света (300×450 / 330×495 = соотношение 2/3).
  // Явные ширина и высота, а не aspect+w-full: в гриде с justify-self-end последний
  // схлопывается в ноль (нет опорной ширины для w-full).
  const frame = 'mx-auto h-[450px] w-[300px] sm:h-[495px] sm:w-[330px]';

  if (!hasShadow) {
    return <div className={frame}>{light}</div>;
  }

  return (
    <div className={frame}>
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={flipped ? 'Перевернуть к знакомой мысли' : 'Перевернуть к свету'}
        className={cn(
          'flip-card block h-full w-full cursor-pointer text-left',
          flipped && 'is-flipped',
        )}
      >
        <div className="flip-card-inner relative h-full w-full">
          {/* Тёмная сторона — знакомая мысль */}
          <div className="flip-face absolute inset-0">
            <div className="bg-surface-raised flex h-full flex-col gap-6 rounded-[2rem] p-6 text-center">
              <p className="text-ink-muted/60 font-sans text-xs tracking-wide">Знакомая мысль…</p>
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <p className="font-display text-ink/85 text-xl leading-snug text-balance">
                  {message.attitude.negative}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-gold/80 font-sans text-sm tracking-wide">
                    коснись и увидишь свет
                  </p>
                  <ArrowRight className="text-gold/70 size-5" strokeWidth={1.5} aria-hidden />
                </div>
              </div>
            </div>
          </div>

          {/* Светлая сторона — переустановка + эмоция дня */}
          <div className="flip-face flip-face-back">{light}</div>
        </div>
      </button>
    </div>
  );
}

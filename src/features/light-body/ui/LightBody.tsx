'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

/* Стадии тела света — растровые арты; нужен сырой <img> для mix-blend-mode —
   next/image здесь неуместен. */
/* eslint-disable @next/next/no-img-element */

const STAGE_COUNT = 13;
// Пока открыт переход только с 1-й фазы на 2-ю.
const MAX_UNLOCKED = 2;

const src = (n: number) => `/light-body/stage-${n}.png`;

const maskStyle = {
  WebkitMaskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
  maskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
} as const;

/**
 * Тело света на главной. Картинки стадий со своим тёмным фоном — интегрируем через
 * mix-blend-mode: screen (тёмное растворяется, остаётся только свечение поверх космоса),
 * мягкая маска краёв, светящаяся рамка, аура и тихое парение.
 * Смена фазы — без анимации перехода (пока доступен переход с 1-й на 2-ю).
 */
export function LightBody({ initialStage = 1 }: { initialStage?: number }) {
  const [stage, setStage] = useState(initialStage);
  const canAdvance = stage < MAX_UNLOCKED;

  const advance = () => {
    if (canAdvance) setStage((s) => Math.min(STAGE_COUNT, s + 1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Твоё тело света</h2>
        <p className="text-ink-muted mt-0.5 text-sm">
          фаза {stage} <span className="text-ink-muted/50">из {STAGE_COUNT}</span>
        </p>
      </div>

      {/* Сцена */}
      <div className="relative mt-3 aspect-[2/3] w-full max-w-[300px] select-none sm:max-w-[330px]">
        {/* Аура за телом */}
        <div
          aria-hidden
          className="animate-aura-pulse pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(42% 38% at 50% 44%, rgba(155,126,189,0.30), transparent 70%), radial-gradient(30% 26% at 50% 60%, rgba(212,175,55,0.16), transparent 72%)',
          }}
        />

        {/* Парящий слой — в статичном контейнере с тем же скруглением, что и рамка,
            чтобы углы картинки обрезались одинаково с рамкой (контейнер статичен — не «едет» при парении). */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="animate-light-float absolute inset-0">
            <img
              src={src(stage)}
              alt="Тело света"
              draggable={false}
              className="absolute inset-0 size-full object-contain"
              style={{ mixBlendMode: 'screen', ...maskStyle }}
            />
          </div>
        </div>

        {/* Тонкая мягко светящаяся рамка */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem]"
          style={{
            boxShadow:
              '0 0 0 1px rgba(231,207,122,0.22), 0 0 26px -6px rgba(231,207,122,0.30), inset 0 0 36px -14px rgba(155,126,189,0.40)',
          }}
        />
      </div>

      {/* Управление фазой */}
      <div className="mt-5 flex h-12 items-center">
        {canAdvance ? (
          <button
            type="button"
            onClick={advance}
            className="group ring-gold/40 text-gold-soft hover:ring-gold/70 hover:shadow-glow hover:text-gold relative inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium ring-1 transition-all duration-300"
          >
            <Sparkles className="size-4" strokeWidth={1.75} />
            Перейти на следующую фазу
          </button>
        ) : (
          <p className="text-ink-muted/70 text-sm">Следующие фазы откроются позже</p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

import { vitality as computeVitality } from '@/entities/light-body';
import { cn } from '@/shared/lib/cn';

/* Стадии тела света — растровые арты; нужен сырой <img> для mix-blend-mode —
   next/image здесь неуместен. */
/* eslint-disable @next/next/no-img-element */

const STAGE_COUNT = 13;
// Пока открыт переход только с 1-й фазы на 2-ю.
const MAX_UNLOCKED = 2;
// Длительность анимации перехода — синхронно с --animate-body-fade-out в globals.css.
const TRANSITION_MS = 1500;

const src = (n: number) => `/light-body/stage-${n}.png`;

const maskStyle = {
  WebkitMaskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
  maskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
} as const;

const bodyImgClass = 'absolute inset-0 size-full object-contain';

// Пресеты витальности для предпросмотра (preview): дни простоя → яркость считает computeVitality.
const VITALITY_PRESETS = [
  { label: 'полная', days: 0 },
  { label: '2 дня', days: 2 },
  { label: '3 дня', days: 3 },
  { label: '5 дней', days: 5 },
  { label: 'неделя', days: 7 },
  { label: 'покой', days: 30 },
] as const;

/**
 * Тело света на главной. Картинки стадий со своим тёмным фоном — интегрируем через
 * mix-blend-mode: screen (тёмное растворяется, остаётся только свечение поверх космоса),
 * мягкая маска краёв, светящаяся рамка, аура и тихое парение.
 *
 * Переход на новую фазу запускается кнопкой-артом «Совершить переход»: старое тело тает,
 * новое проступает поверх, и оба «дышат» с нарастающей амплитудой — в конце остаётся новое.
 */
export function LightBody({
  initialStage = 1,
  preview = false,
  vitality = 1,
}: {
  initialStage?: number;
  /** Свободный просмотр всех стадий (для тестирования арта), без логики разблокировки. */
  preview?: boolean;
  /** Яркость «прямо сейчас» 0..1 (свежесть последней записи). 1 — полная, ниже — покой. */
  vitality?: number;
}) {
  const [stage, setStage] = useState(initialStage);
  // Предпросмотр витальности: индекс выбранного пресета или null (реальное значение из props).
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const previewPreset = preview && previewIdx !== null ? VITALITY_PRESETS[previewIdx] : null;
  const effectiveVitality = previewPreset ? computeVitality(previewPreset.days) : vitality;

  // Витальность гасит свет, не трогая саму фазу: тело, аура и рамка тускнеют, но не исчезают.
  // Полы факторов держат тело различимым даже в «покое»; при первой записи vitality вернётся к 1.
  const bodyFactor = 0.4 + 0.6 * effectiveVitality;
  const auraFactor = 0.3 + 0.7 * effectiveVitality;
  const shadowFactor = 0.45 + 0.55 * effectiveVitality;
  // Во время перехода держим уходящее тело — отрисовываем оба слоя.
  const [fromStage, setFromStage] = useState<number | null>(null);
  const transitioning = fromStage !== null;

  const lastStage = preview ? STAGE_COUNT : MAX_UNLOCKED;
  const canAdvance = stage < lastStage;

  // Снимаем переход по таймеру (а не по animationend) — чтобы экран не мог «зависнуть»,
  // даже если CSS-анимация по какой-то причине не проиграется.
  useEffect(() => {
    if (fromStage === null) return;
    const t = setTimeout(() => setFromStage(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [fromStage]);

  const advance = () => {
    if (transitioning || !canAdvance) return;
    setFromStage(stage);
    setStage((s) => Math.min(STAGE_COUNT, s + 1));
  };

  // Откат на шаг для повторного проигрывания перехода (только в режиме предпросмотра).
  const goBack = () => {
    setFromStage(null);
    setStage((s) => Math.max(1, s - 1));
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
        {/* Аура за телом. Внешний слой держит витальность (множит пульс), внутренний — дышит. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ opacity: auraFactor }}
        >
          <div
            className="animate-aura-pulse absolute inset-0"
            style={{
              background:
                'radial-gradient(42% 38% at 50% 44%, rgba(155,126,189,0.30), transparent 70%), radial-gradient(30% 26% at 50% 60%, rgba(212,175,55,0.16), transparent 72%)',
            }}
          />
        </div>

        {/* Парящий слой — статичный контейнер с тем же скруглением, что и рамка, чтобы
            углы картинки обрезались одинаково. Переход — плавное перетекание: новое тело
            уже отрисовано снизу, старое гаснет поверх него.
            screen + маска — на общей обёртке (isolation: isolate), поэтому тела сначала
            кросс-фейдятся между собой обычным наложением (без сложения яркостей), и лишь
            результат один раз «скринится» на космос — никакой вспышки-пересвета. */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="animate-light-float absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                mixBlendMode: 'screen',
                isolation: 'isolate',
                opacity: bodyFactor,
                ...maskStyle,
              }}
            >
              <img
                key={`to-${stage}`}
                src={src(stage)}
                alt="Тело света"
                draggable={false}
                className={bodyImgClass}
              />
              {transitioning && (
                <img
                  key={`from-${fromStage}`}
                  src={src(fromStage)}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className={cn(bodyImgClass, 'animate-body-fade-out')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Тонкая мягко светящаяся рамка — тоже тускнеет с витальностью */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] transition-[box-shadow] duration-700"
          style={{
            boxShadow: `0 0 0 1px rgba(231,207,122,${0.22 * shadowFactor}), 0 0 26px -6px rgba(231,207,122,${0.3 * shadowFactor}), inset 0 0 36px -14px rgba(155,126,189,${0.4 * shadowFactor})`,
          }}
        />

        {/* Кнопка-арт «Совершить переход» — прямо посреди светового тела. */}
        {canAdvance && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={advance}
              disabled={transitioning}
              aria-label="Совершить переход на следующую фазу"
              className="group pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-[1.03] disabled:cursor-default disabled:opacity-60"
            >
              <img
                src="/light-body/button-body.png"
                alt="Совершить переход"
                draggable={false}
                className="h-auto w-[400px] max-w-[92vw] drop-shadow-[0_0_18px_rgba(212,175,55,0.0)] transition-[filter] duration-300 group-hover:drop-shadow-[0_0_22px_rgba(212,175,55,0.35)] sm:w-[460px]"
              />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-6 flex-col items-center gap-3">
        {!canAdvance && (
          <p className="text-ink-muted/70 text-sm">
            {preview ? 'Это последняя фаза' : 'Следующие фазы откроются позже'}
          </p>
        )}

        {/* Предпросмотр: откат на шаг, чтобы переиграть переход */}
        {preview && stage > 1 && (
          <button
            type="button"
            onClick={goBack}
            disabled={transitioning}
            className="text-ink-muted/70 hover:text-gold inline-flex items-center gap-1 text-xs transition-colors duration-200 disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.75} />
            на шаг назад
          </button>
        )}

        {/* Предпросмотр: пресеты витальности — как тело тускнеет без записей (temp, для проверки) */}
        {preview && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-ink-muted/50 text-xs">яркость</span>
            {VITALITY_PRESETS.map((p, i) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setPreviewIdx(i)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors duration-200',
                  previewIdx === i
                    ? 'border-gold/50 text-gold'
                    : 'border-ink-muted/20 text-ink-muted/70 hover:text-ink',
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPreviewIdx(null)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors duration-200',
                previewIdx === null
                  ? 'border-gold/50 text-gold'
                  : 'border-ink-muted/20 text-ink-muted/70 hover:text-ink',
              )}
            >
              авто
            </button>
            <span className="text-ink-muted/40 text-xs tabular-nums">
              {Math.round(effectiveVitality * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

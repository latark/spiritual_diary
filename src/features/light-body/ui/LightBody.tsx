'use client';

import { useEffect, useState } from 'react';

import { STAGE_COUNT } from '@/entities/light-body';
import { cn } from '@/shared/lib/cn';
import { Hint } from '@/shared/ui/Hint';

import { claimLightStageAction } from '../model/claim-stage-action';

/* Стадии тела света — растровые арты; нужен сырой <img> для mix-blend-mode —
   next/image здесь неуместен. */
/* eslint-disable @next/next/no-img-element */

// Тайминги церемонии перехода. Кнопка мягко гаснет (FADE), затем небольшая пауза (HOLD),
// и только потом начинается кросс-фейд тел (TRANSITION). TRANSITION синхронен с
// --animate-body-fade-out в globals.css.
const BUTTON_FADE_MS = 450;
const HOLD_MS = 300;
const TRANSITION_MS = 1500;

const src = (n: number) => `/light-body/stage-${n}.png`;

const maskStyle = {
  WebkitMaskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
  maskImage: 'radial-gradient(72% 80% at 50% 46%, #000 58%, transparent 100%)',
} as const;

const bodyImgClass = 'absolute inset-0 size-full object-contain';

type Phase = 'idle' | 'fading' | 'transitioning';

/**
 * Тело света на главной. Картинки стадий со своим тёмным фоном — интегрируем через
 * mix-blend-mode: screen (тёмное растворяется, остаётся только свечение поверх космоса),
 * мягкая маска краёв, светящаяся рамка, аура и тихое парение.
 *
 * Фаза необратима и присваивается ТОЛЬКО кнопкой «Совершить переход»: она появляется, когда
 * заработанная фаза (`readyStage`) обгоняет показанную (`stage`/`shownStage`). По нажатию
 * кнопка мягко гаснет, после паузы старое тело тает, новое проступает — и кнопка вернётся лишь
 * когда созреет следующий переход. Витальность (`vitality`) гасит свет обратимо; вызревание
 * (`ripeness`) перед следующим переходом чуть сгущает золото — «что-то назревает».
 */
export function LightBody({
  stage,
  readyStage,
  vitality = 1,
  ripeness = 0,
}: {
  /** Подтверждённая (показанная) фаза 1..13. */
  stage: number;
  /** Заработанная по активным дням фаза 1..13. readyStage > stage → доступен переход. */
  readyStage: number;
  /** Яркость «прямо сейчас» 0..1 (свежесть последней записи). 1 — полная, ниже — покой. */
  vitality?: number;
  /** Вызревание следующего перехода 0..1 (когда переход ещё не доступен). */
  ripeness?: number;
}) {
  const [shownStage, setShownStage] = useState(stage);
  const [fromStage, setFromStage] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  const canAdvance = readyStage > shownStage;
  const transitioning = fromStage !== null;

  // Запуск кросс-фейда: после того как кнопка погасла (FADE) и выдержали паузу (HOLD).
  useEffect(() => {
    if (phase !== 'fading') return;
    const t = setTimeout(() => {
      setFromStage(shownStage);
      setShownStage(readyStage);
      setPhase('transitioning');
    }, BUTTON_FADE_MS + HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, shownStage, readyStage]);

  // Снятие уходящего тела по таймеру (не по animationend) — чтобы экран не «завис».
  useEffect(() => {
    if (phase !== 'transitioning') return;
    const t = setTimeout(() => {
      setFromStage(null);
      setPhase('idle');
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  function advance(): void {
    if (phase !== 'idle' || !canAdvance) return;
    setPhase('fading');
    // Подтверждаем фазу на сервере; revalidatePath('/') освежит props позже. Визуал ведём локально.
    void claimLightStageAction();
  }

  // Витальность гасит свет, не трогая фазу. Вызревание (только когда перехода ещё нет) чуть
  // добавляет золота. Полы факторов держат тело различимым даже в «покое».
  const ripe = canAdvance ? 0 : ripeness;
  const bodyFactor = 0.4 + 0.6 * vitality;
  const auraFactor = Math.min(1, 0.3 + 0.7 * vitality + 0.12 * ripe);
  const shadowFactor = Math.min(1, 0.45 + 0.55 * vitality + 0.15 * ripe);

  return (
    <div className="flex flex-col items-center">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">
          Твоё тело света
          <Hint srLabel="О теле света">
            Оно растёт из твоих записей: каждое прожитое чувство добавляет ему света. С днями
            практики оно проходит фазы — от первой искры к сиянию.
          </Hint>
        </h2>
        <p className="text-ink-muted mt-0.5 text-sm">
          фаза {shownStage} <span className="text-ink-muted/50">из {STAGE_COUNT}</span>
        </p>
      </div>

      {/* Сцена */}
      <div className="relative mt-3 aspect-[2/3] w-full max-w-[300px] select-none sm:max-w-[330px]">
        {/* Аура за телом. Витальность множит, вызревание чуть добавляет золота. */}
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

        {/* Парящий слой. Переход — плавное перетекание: новое тело отрисовано снизу, старое
            гаснет поверх. screen + маска на общей обёртке (isolation: isolate), поэтому тела
            кросс-фейдятся между собой без сложения яркостей, и лишь результат «скринится» на космос. */}
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
                key={`to-${shownStage}`}
                src={src(shownStage)}
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

        {/* Тонкая мягко светящаяся рамка — тускнеет с витальностью, чуть ярче при вызревании */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] transition-[box-shadow] duration-700"
          style={{
            boxShadow: `0 0 0 1px rgba(231,207,122,${0.22 * shadowFactor}), 0 0 26px -6px rgba(231,207,122,${0.3 * shadowFactor}), inset 0 0 36px -14px rgba(155,126,189,${0.4 * shadowFactor})`,
          }}
        />

        {/* Кнопка-арт «Совершить переход» — видна только когда переход доступен. По нажатию
            мягко гаснет (opacity → 0), затем запускается кросс-фейд. */}
        {canAdvance && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={advance}
              disabled={phase !== 'idle'}
              aria-label="Совершить переход на следующую фазу"
              className={cn(
                'group cursor-pointer transition-opacity ease-out',
                phase === 'fading'
                  ? 'pointer-events-none opacity-0'
                  : 'pointer-events-auto opacity-100 hover:scale-[1.03]',
              )}
              style={{ transitionDuration: `${BUTTON_FADE_MS}ms` }}
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
    </div>
  );
}

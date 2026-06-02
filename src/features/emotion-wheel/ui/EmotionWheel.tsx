'use client';

import { useState, type CSSProperties, type KeyboardEvent } from 'react';

import { EMOTION_FAMILIES, type EmotionFamily, type EmotionShade } from '@/shared/content/emotions';
import { cn } from '@/shared/lib/cn';

import { FAMILY_CENTER, FAMILY_POS, OVERVIEW_POS, type Pt } from '../model/label-positions';
import type { SelectedEmotion } from '../model/types';

// Порядок семей на главном колесе по часовой с верхнего лепестка.
const OVERVIEW_ORDER = [
  'joy',
  'love',
  'peace',
  'interest',
  'surprise',
  'fear',
  'sadness',
  'shame',
  'disgust',
  'anger',
] as const;

// Короткие подписи семей (на арте текста нет — накладываем кодом).
const SHORT: Record<string, string> = {
  joy: 'Радость',
  love: 'Любовь',
  peace: 'Покой',
  interest: 'Интерес',
  surprise: 'Удивление',
  fear: 'Страх',
  sadness: 'Печаль',
  shame: 'Стыд',
  disgust: 'Отвращение',
  anger: 'Гнев',
};

// Приглушение дочерних артов: базовое + усиленное для самых ярких/неоновых.
const DIM_DEFAULT = 'brightness-[0.85] saturate-[0.8]';
const FAMILY_DIM: Record<string, string> = {
  love: 'brightness-[0.78] saturate-[0.72]',
  fear: 'brightness-[0.78] saturate-[0.72]',
  shame: 'brightness-[0.78] saturate-[0.72]',
  disgust: 'brightness-[0.78] saturate-[0.72]',
  anger: 'brightness-[0.78] saturate-[0.72]',
};

/** Стиль позиции по откалиброванной точке (центр подписи), % от размера колеса. */
function posStyle(pt: Pt | undefined): CSSProperties {
  const p = pt ?? { x: 50, y: 50 };
  return { left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' };
}

function buzz(ms = 8): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ms);
  }
}

function onActivateKey(e: KeyboardEvent, fn: () => void): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

// Подписи оттенков (дочерние) — просто белый текст без тени; hover — лёгкое увеличение + золотое свечение.
const LABEL_SHADE =
  'relative font-sans font-medium leading-tight text-white transition-transform duration-200 ' +
  'group-hover:scale-[1.06] group-hover:[text-shadow:0_0_12px_rgba(231,207,122,0.65)]';

// Подписи семей на главном колесе — как изначально: без тени на тексте.
const LABEL_OVERVIEW =
  'relative font-sans font-medium leading-tight text-ink transition-transform duration-200 ' +
  'group-hover:scale-[1.06] group-hover:text-white';

/** Мягкое радиальное свечение за подписью (вместо прямоугольной подложки). */
function HoverGlow({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 h-9 w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200',
        on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}
      style={{ background: 'radial-gradient(closest-side, rgba(231,207,122,0.28), transparent)' }}
    />
  );
}

export function EmotionWheel({ onSelect }: { onSelect: (e: SelectedEmotion) => void }) {
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [shade, setShade] = useState<EmotionShade | null>(null);

  const byId = (id: string) => EMOTION_FAMILIES.find((f) => f.id === id);

  function selectFamily(f: EmotionFamily): void {
    buzz(10);
    setShade(null);
    setFamily(f);
  }

  function back(): void {
    buzz(6);
    setShade(null);
    setFamily(null);
  }

  function commit(s: EmotionShade): void {
    if (!family) return;
    onSelect({
      familyId: family.id,
      familyName: family.name,
      shadeId: s.id,
      name: s.name,
      color: s.color,
    });
  }

  const title = family
    ? `«${SHORT[family.id] ?? family.name}» — какой оттенок ближе?`
    : 'Что ты сейчас чувствуешь?';
  const subtitle = family ? 'нажми на оттенок' : 'выбери, чтобы осознать и трансформировать';
  const familyCenter = family ? (FAMILY_CENTER[family.id] ?? { x: 50, y: 50 }) : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="px-4 text-center">
        <h1 className="font-display text-ink text-2xl">{title}</h1>
        <p className="text-ink-muted mt-0.5 text-sm">{subtitle}</p>
      </div>

      <div className="relative -mx-4 aspect-square w-full max-w-[600px] select-none [-webkit-touch-callout:none] sm:mx-0">
        {/* Анимируемый слой: при смене семья/общее колесо переигрывается плавное появление. */}
        <div key={family?.id ?? 'overview'} className="animate-wheel-in absolute inset-0">
          {/* Арт колеса — CSS-фон (не <img>): нельзя сохранить/перетащить/выделить, воспринимается как фон. */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat select-none',
              // Дочерние цветы ярче/неоновее — приглушаем, чтобы не били в глаза.
              family && (FAMILY_DIM[family.id] ?? DIM_DEFAULT),
            )}
            style={{
              backgroundImage: `url(${family ? `/wheel-v6/family/${family.id}.png` : '/wheel-v6/main.png'})`,
            }}
          />

          {/* Подписи семей (общее колесо) */}
          {!family &&
            OVERVIEW_ORDER.map((id) => {
              const f = byId(id);
              if (!f) return null;
              const pos = posStyle(OVERVIEW_POS[id]);
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={SHORT[id] ?? f.name}
                  onClick={() => selectFamily(f)}
                  onKeyDown={(e) => onActivateKey(e, () => selectFamily(f))}
                  style={pos}
                  className="group absolute flex w-[26%] items-center justify-center"
                >
                  <HoverGlow />
                  <span className={cn(LABEL_OVERVIEW, 'text-[13px] sm:text-[15px]')}>
                    {SHORT[id] ?? f.name}
                  </span>
                </button>
              );
            })}

          {/* Подписи оттенков (экран семьи) */}
          {family &&
            family.shades.map((s) => {
              const pos = posStyle(FAMILY_POS[family.id]?.[s.id]);
              const isSel = shade?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.name}
                  onClick={() => {
                    buzz(8);
                    setShade(s);
                  }}
                  onKeyDown={(e) =>
                    onActivateKey(e, () => {
                      buzz(8);
                      setShade(s);
                    })
                  }
                  style={pos}
                  className="group absolute inline-flex items-center justify-center whitespace-nowrap"
                >
                  <span
                    className={cn(LABEL_SHADE, 'text-[12px] sm:text-sm', isSel && 'text-gold-soft')}
                  >
                    {s.name}
                  </span>
                </button>
              );
            })}

          {/* Заголовок семьи в центре — белый жирноватый текст с тонкой чёрной обводкой + яркий ореол в тон арта. */}
          {family && (
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${familyCenter?.x ?? 50}%`, top: `${familyCenter?.y ?? 50}%` }}
            >
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 h-[175%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
                style={{
                  background: `radial-gradient(ellipse, ${family.color} 0%, transparent 72%)`,
                  opacity: 0.9,
                  filter: 'blur(5px)',
                }}
              />
              <span
                className="relative ps-[0.1em] font-sans text-[13px] font-semibold tracking-[0.1em] whitespace-nowrap text-white uppercase sm:text-[15px]"
                style={{ WebkitTextStroke: '0.6px rgba(0,0,0,0.92)', paintOrder: 'stroke' }}
              >
                {SHORT[family.id] ?? family.name}
              </span>
            </span>
          )}
        </div>

        {/* Декоративная круглая рамка (статична, не анимируется при смене) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 55px rgba(231,207,122,0.12), inset 0 0 70px rgba(155,126,189,0.12)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            padding: '1.5px',
            background:
              'conic-gradient(from 210deg, rgba(231,207,122,0.75), rgba(155,126,189,0.55), rgba(216,107,138,0.5), rgba(109,169,216,0.6), rgba(231,207,122,0.75))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{ inset: '5.5%', border: '1px solid rgba(231,207,122,0.10)' }}
        />

        {/* Описание выбранного оттенка — в центре колеса (не нужно тянуться вниз). */}
        {family && shade && (
          <div className="absolute top-1/2 left-1/2 z-20 w-[66%] max-w-[300px] -translate-x-1/2 -translate-y-1/2">
            <div className="bg-canvas/90 ring-gold/25 animate-fade-up shadow-glow-soft rounded-2xl p-4 text-center ring-1 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-block size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: shade.color }}
                />
                <span className="font-display text-ink text-xl">{shade.name}</span>
              </div>
              <p className="text-ink-muted mt-1.5 text-[13px] leading-relaxed">
                {shade.description}
              </p>
              <button
                type="button"
                onClick={() => commit(shade)}
                className="bg-gold text-canvas hover:shadow-glow mt-3 h-10 w-full rounded-lg font-medium transition-shadow duration-300"
              >
                Это оно
              </button>
              <button
                type="button"
                onClick={() => setShade(null)}
                className="text-ink-muted hover:text-ink mt-2 text-xs transition-colors"
              >
                другой оттенок
              </button>
            </div>
          </div>
        )}
      </div>

      {/* «Назад» — снизу, чтобы не тянуться к верху */}
      {family && (
        <button
          type="button"
          onClick={back}
          className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
        >
          ← все эмоции
        </button>
      )}
    </div>
  );
}

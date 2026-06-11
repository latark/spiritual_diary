'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { EMOTION_FAMILIES, type EmotionFamily, type EmotionShade } from '@/shared/content/emotions';
import { cn } from '@/shared/lib/cn';

import { FAMILY_CENTER, FAMILY_POS, OVERVIEW_POS, type Pt } from '../model/label-positions';
import { FAMILY_SHAPES, OVERVIEW_SHAPES, type PetalShape } from '../model/petal-shapes';
import type { SelectedEmotion } from '../model/types';

/** Точки полигона → строка для атрибута points SVG. */
function toPoints(shape: PetalShape): string {
  return shape.map((p) => `${p.x},${p.y}`).join(' ');
}

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

/**
 * Лепесток на наведении загорается изнутри. Свечение — отдельный полигон, залитый
 * радиальным градиентом семьи (`petal-glow-<familyId>`): ярко в сердцевине, мягко гаснет
 * к краям и кончику, так что свет не лежит ровной «наклейкой», а распускается из центра.
 * `mix-blend-screen` подсвечивает арт к тону семьи, `feGaussianBlur` добавляет рассеяния.
 * Клик ловит второй, неразмытый прозрачный полигон поверх — чтобы блюр не плыл по hit-target.
 */
function PetalHotspot({
  shape,
  familyId,
  active,
  glow = 0.85,
  onSelect,
  onHover,
}: {
  shape: PetalShape;
  familyId: string;
  active: boolean;
  /** Яркость свечения на наведении (главное колесо тусклее дочерних). */
  glow?: number;
  onSelect: () => void;
  onHover: (on: boolean) => void;
}) {
  const pts = toPoints(shape);
  return (
    <>
      <polygon
        points={pts}
        fill={`url(#petal-glow-${familyId})`}
        aria-hidden
        className="pointer-events-none mix-blend-screen transition-opacity duration-300"
        style={{ opacity: active ? glow : 0, filter: 'url(#petal-blur)' }}
      />
      <polygon
        points={pts}
        className="pointer-events-auto cursor-pointer fill-transparent"
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      />
    </>
  );
}

export function EmotionWheel({ onSelect }: { onSelect: (e: SelectedEmotion) => void }) {
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [shade, setShade] = useState<EmotionShade | null>(null);
  // Подсветка подписи лепестка: ведётся и из подписи, и из полигона-лепестка.
  const [hovered, setHovered] = useState<string | null>(null);
  // Жёсткая привязка подписей к арту: показываем их только когда fade-in арта (wheel-in)
  // дошёл до конца — арт точно отрисован. Без таймера-угадайки (подписи не обгоняют картинку).
  const [paintedSrc, setPaintedSrc] = useState<string | null>(null);

  // Подписи не должны появляться раньше арта: предзагружаем все картинки колеса,
  // а слой (арт + подписи) показываем только когда нужная картинка готова.
  const [readySrcs, setReadySrcs] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    const list = [
      '/wheel-v6/main.png',
      ...EMOTION_FAMILIES.map((f) => `/wheel-v6/family/${f.id}.png`),
    ];
    let alive = true;
    const mark = (s: string) => {
      if (alive) setReadySrcs((prev) => (prev.has(s) ? prev : new Set(prev).add(s)));
    };
    for (const s of list) {
      const img = new Image();
      img.decoding = 'async';
      img.src = s;
      // decode() гарантирует готовность битмапа к отрисовке — фон не «доедет» позже подписей.
      img
        .decode()
        .then(() => mark(s))
        .catch(() => mark(s));
    }
    return () => {
      alive = false;
    };
  }, []);

  const byId = (id: string) => EMOTION_FAMILIES.find((f) => f.id === id);

  function selectFamily(f: EmotionFamily): void {
    buzz(10);
    setShade(null);
    setHovered(null);
    setFamily(f);
  }

  function pickShade(s: EmotionShade): void {
    buzz(8);
    setShade(s);
  }

  function back(): void {
    buzz(6);
    setShade(null);
    setHovered(null);
    setFamily(null);
  }

  // Карточку описания закрываем по Escape и по клику в любую точку вне неё — слушатель на
  // документе ловит клики и за пределами колеса (оверлей внутри круга остаётся для двухшага).
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!shade) return;
    function onKeyDown(e: globalThis.KeyboardEvent): void {
      if (e.key === 'Escape') setShade(null);
    }
    function onPointerDown(e: globalThis.PointerEvent): void {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setShade(null);
    }
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [shade]);

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
  const artSrc = family ? `/wheel-v6/family/${family.id}.png` : '/wheel-v6/main.png';
  const ready = readySrcs.has(artSrc);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="px-4 text-center">
        <h1 className="font-display text-ink text-2xl">{title}</h1>
        <p className="text-ink-muted mt-0.5 text-sm">{subtitle}</p>
      </div>

      <div className="relative -mx-4 aspect-square w-full max-w-[600px] select-none [-webkit-touch-callout:none] sm:mx-0">
        {/* Анимируемый слой: при смене семья/общее колесо переигрывается плавное появление. */}
        <div
          key={(family?.id ?? 'overview') + (ready ? '' : '-loading')}
          className="absolute inset-0"
        >
          {!ready && (
            // Пока арт не загружен — мягкая пульсация; подписи не показываем (иначе диссонанс).
            <div className="absolute inset-0 grid place-items-center">
              <div
                aria-hidden
                className="animate-breathe size-1/3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(231,207,122,0.16), transparent 70%)',
                }}
              />
            </div>
          )}
          {ready && (
            <>
              {/* Арт колеса — CSS-фон (не <img>): нельзя сохранить/перетащить/выделить, воспринимается как фон. */}
              <div
                aria-hidden
                onAnimationEnd={() => setPaintedSrc(artSrc)}
                className={cn(
                  'animate-wheel-in pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat select-none',
                  // Дочерние цветы ярче/неоновее — приглушаем, чтобы не били в глаза.
                  family && (FAMILY_DIM[family.id] ?? DIM_DEFAULT),
                )}
                style={{ backgroundImage: `url(${artSrc})` }}
              />

              {/* Подписи — только после того, как арт отрисовался (wheel-in арта завершился). */}
              {paintedSrc === artSrc && (
                <div className="animate-wheel-in absolute inset-0">
                  {/* Кликабельные контуры лепестков (точные полигоны). Лежат под подписями:
                    по тексту срабатывает подпись, по телу лепестка — полигон. На наведении
                    подсвечивается сам лепесток своим цветом (PetalHotspot), не подпись. */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden
                  >
                    <defs>
                      {/* По градиенту на семью: свет ярче в сердцевине лепестка (objectBoundingBox
                        → центр каждого полигона) и тает к краям — мягкая виньетка вместо заливки. */}
                      {EMOTION_FAMILIES.map((f) => (
                        <radialGradient
                          key={f.id}
                          id={`petal-glow-${f.id}`}
                          cx="0.5"
                          cy="0.5"
                          r="0.5"
                        >
                          <stop offset="0%" stopColor={f.color} stopOpacity="0.95" />
                          <stop offset="55%" stopColor={f.color} stopOpacity="0.45" />
                          <stop offset="100%" stopColor={f.color} stopOpacity="0" />
                        </radialGradient>
                      ))}
                      {/* Большая область, чтобы блюр свечения не обрезался по краям лепестка. */}
                      <filter id="petal-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.2" />
                      </filter>
                    </defs>
                    {!family &&
                      OVERVIEW_ORDER.map((id) => {
                        const shape = OVERVIEW_SHAPES[id];
                        const f = byId(id);
                        if (!shape?.length || !f) return null;
                        return (
                          <PetalHotspot
                            key={id}
                            shape={shape}
                            familyId={id}
                            glow={0.5}
                            active={hovered === id}
                            onSelect={() => selectFamily(f)}
                            onHover={(on) => setHovered(on ? id : null)}
                          />
                        );
                      })}
                    {family &&
                      family.shades.map((s) => {
                        const shape = FAMILY_SHAPES[family.id]?.[s.id];
                        if (!shape?.length) return null;
                        return (
                          <PetalHotspot
                            key={s.id}
                            shape={shape}
                            familyId={family.id}
                            active={hovered === s.id}
                            onSelect={() => pickShade(s)}
                            onHover={(on) => setHovered(on ? s.id : null)}
                          />
                        );
                      })}
                  </svg>

                  {/* Подписи семей (общее колесо) */}
                  {!family &&
                    OVERVIEW_ORDER.map((id) => {
                      const f = byId(id);
                      if (!f) return null;
                      const pos = posStyle(OVERVIEW_POS[id]);
                      const active = hovered === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-label={SHORT[id] ?? f.name}
                          onClick={() => selectFamily(f)}
                          onKeyDown={(e) => onActivateKey(e, () => selectFamily(f))}
                          onMouseEnter={() => setHovered(id)}
                          onMouseLeave={() => setHovered(null)}
                          style={pos}
                          className="group absolute flex w-[26%] items-center justify-center py-5"
                        >
                          <span
                            className={cn(
                              LABEL_OVERVIEW,
                              'text-[13px] sm:text-[15px]',
                              active && 'scale-[1.06] text-white',
                            )}
                          >
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
                      const isHover = hovered === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          aria-label={s.name}
                          onClick={() => pickShade(s)}
                          onKeyDown={(e) => onActivateKey(e, () => pickShade(s))}
                          onMouseEnter={() => setHovered(s.id)}
                          onMouseLeave={() => setHovered(null)}
                          style={pos}
                          className="group absolute inline-flex items-center justify-center px-4 py-3.5 whitespace-nowrap"
                        >
                          <span
                            className={cn(
                              LABEL_SHADE,
                              'text-[12px] sm:text-sm',
                              isSel && 'text-gold-soft',
                              isHover &&
                                'scale-[1.06] [text-shadow:0_0_12px_rgba(231,207,122,0.65)]',
                            )}
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
                      style={{
                        left: `${familyCenter?.x ?? 50}%`,
                        top: `${familyCenter?.y ?? 50}%`,
                      }}
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
              )}
            </>
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

        {/* Клик/тап мимо карточки закрывает её. Слой выше подписей (z-10), но ниже карточки (z-20):
            первый клик по другому оттенку только закрывает, выбор нового — вторым кликом. */}
        {family && shade && (
          <div aria-hidden onClick={() => setShade(null)} className="absolute inset-0 z-10" />
        )}

        {/* Описание выбранного оттенка — в центре колеса (не нужно тянуться вниз). */}
        {family && shade && (
          <div
            ref={cardRef}
            className="absolute top-1/2 left-1/2 z-20 w-[66%] max-w-[300px] -translate-x-1/2 -translate-y-1/2"
          >
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
              <button type="button" onClick={() => commit(shade)} className="btn-gold mt-3 h-10">
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

'use client';

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { EMOTION_FAMILIES, type EmotionFamily, type EmotionShade } from '@/shared/content/emotions';
import { cn } from '@/shared/lib/cn';

import {
  petalAngle,
  petalPath,
  pointAt,
  radialLabelRotation,
  readableText,
} from '../model/geometry';
import type { SelectedEmotion } from '../model/types';

const VIEW = 360;
const C = 180;
const CENTER_R = 42; // чёткая сердцевина-круг, один размер в обоих видах
const INNER = 52; // лепестки начинаются с зазором от сердцевины
const OUTER = 150;
const FAM_LABEL_R = 102;
const CHILD_LABEL_R = 100;

/** Переход «свет и растворение»: растворение (0.55s) + рост из размытия (задержка 0.3s + 0.6s). */
const TRANSITION_MS = 920;

const SHORT: Record<string, string> = {
  joy: 'Радость',
  love: 'Любовь',
  peace: 'Покой',
  interest: 'Интерес',
  surprise: 'Удивление',
  fear: 'Страх',
  sadness: 'Печаль',
  shame: 'Стыд·вина',
  disgust: 'Отвращение',
  anger: 'Гнев',
};

/** Золотые частицы света, дрейфующие к сердцевине во время перехода (детерминированы — SSR-safe). */
const MOTES = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2 + (((i * 37) % 10) - 5) / 60;
  const r = 94 + ((i * 53) % 30);
  return {
    dx: Math.round(r * Math.cos(ang) * 10) / 10,
    dy: Math.round(r * Math.sin(ang) * 10) / 10,
    rad: 1.5 + ((i * 17) % 3) * 0.5,
    delay: ((i * 29) % 5) * 0.035,
  };
});

type Phase = 'overview' | 'toFamily' | 'family' | 'toOverview';

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

/** Подписи проявляются чуть позже формы (из лёгкого размытия), исчезают быстро. */
function labelStyle(visible: boolean): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    filter: visible ? 'blur(0)' : 'blur(3px)',
    transition: visible
      ? 'opacity 0.4s ease 0.45s, filter 0.4s ease 0.45s'
      : 'opacity 0.18s ease, filter 0.18s ease',
    pointerEvents: 'none',
  };
}

export function EmotionWheel({ onSelect }: { onSelect: (e: SelectedEmotion) => void }) {
  const [phase, setPhase] = useState<Phase>('overview');
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [shade, setShade] = useState<EmotionShade | null>(null);
  const [centerColor, setCenterColor] = useState<string | null>(null);
  const [centerLabel, setCenterLabel] = useState('');
  const [transitionId, setTransitionId] = useState(0);

  useEffect(() => {
    if (phase === 'toFamily') {
      const t = setTimeout(() => setPhase('family'), TRANSITION_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'toOverview') {
      const t = setTimeout(() => {
        setFamily(null);
        setShade(null);
        setPhase('overview');
      }, TRANSITION_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  function selectFamily(f: EmotionFamily): void {
    if (phase !== 'overview') return;
    buzz(10);
    setFamily(f);
    setShade(null);
    setCenterColor(f.color);
    setCenterLabel(SHORT[f.id] ?? f.name);
    setTransitionId((n) => n + 1);
    setPhase('toFamily');
  }

  function back(): void {
    if (phase !== 'family') return;
    buzz(6);
    setTransitionId((n) => n + 1);
    setPhase('toOverview');
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

  const overviewMounted = phase !== 'family';
  const familyMounted = phase !== 'overview';
  const transitioning = phase === 'toFamily' || phase === 'toOverview';
  const centerFilled = phase === 'toFamily' || phase === 'family';
  const familyPetals = family;

  const overviewClass =
    phase === 'toFamily' ? 'petal-dissolve' : phase === 'toOverview' ? 'petal-materialize' : '';
  const familyClass =
    phase === 'toFamily' ? 'petal-materialize' : phase === 'toOverview' ? 'petal-dissolve' : '';

  const familyHeader = (phase === 'toFamily' || phase === 'family') && family;
  const title = familyHeader
    ? `«${SHORT[family.id] ?? family.name}» — какой оттенок ближе?`
    : 'Что ты сейчас чувствуешь?';
  const subtitle = familyHeader
    ? 'нажми, чтобы прочитать и выбрать'
    : 'нажми на подходящий лепесток';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex min-h-[2.75rem] w-full max-w-md items-center gap-2">
        {phase === 'family' && (
          <button
            type="button"
            onClick={back}
            className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
          >
            ← все эмоции
          </button>
        )}
      </div>

      <div className="text-center">
        <h1 className="font-display text-ink text-2xl">{title}</h1>
        <p className="text-ink-muted mt-0.5 text-sm">{subtitle}</p>
      </div>

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width="100%"
        role="img"
        aria-label="Цветок эмоций"
        style={{ maxWidth: 440, display: 'block', overflow: 'visible' }}
      >
        {/* Вспышка ядра: оно «впитывает свет» в момент перехода */}
        {transitioning && (
          <circle
            key={`ignite-${transitionId}`}
            cx={C}
            cy={C}
            r={66}
            fill="#e7cf7a"
            style={{
              filter: 'blur(16px)',
              animation: 'core-ignite 0.85s ease-out both',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Лепестки семей (растворяются / сгущаются; подписи — отдельным слоем) */}
        {overviewMounted && (
          <g className={overviewClass}>
            {EMOTION_FAMILIES.map((f, i) => {
              const ang = petalAngle(i, EMOTION_FAMILIES.length);
              const d = petalPath(C, C, ang, INNER, OUTER, (2 * Math.PI) / EMOTION_FAMILIES.length);
              return (
                <g
                  key={f.id}
                  className="petal-group"
                  role="button"
                  tabIndex={0}
                  aria-label={f.name}
                  onClick={() => selectFamily(f)}
                  onKeyDown={(e) => onActivateKey(e, () => selectFamily(f))}
                >
                  <path
                    className="petal"
                    d={d}
                    fill={f.color}
                    stroke="rgba(231,207,122,0.30)"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Лепестки оттенков выбранной семьи */}
        {familyMounted && familyPetals && (
          <g className={familyClass}>
            {familyPetals.shades.map((s, i) => {
              const ang = petalAngle(i, familyPetals.shades.length);
              const d = petalPath(
                C,
                C,
                ang,
                INNER,
                OUTER,
                (2 * Math.PI) / familyPetals.shades.length,
              );
              const isSel = shade?.id === s.id;
              return (
                <g
                  key={s.id}
                  className="petal-group"
                  role="button"
                  tabIndex={0}
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
                >
                  <path
                    className="petal"
                    d={d}
                    fill={s.color}
                    stroke={isSel ? '#D4AF37' : 'rgba(231,207,122,0.30)'}
                    strokeWidth={isSel ? 3 : 1}
                    style={
                      isSel ? { filter: 'drop-shadow(0 0 7px rgba(212,175,55,0.75))' } : undefined
                    }
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Золотые частицы света, дрейфующие в сердцевину */}
        {transitioning && (
          <g key={`motes-${transitionId}`} style={{ pointerEvents: 'none' }}>
            {MOTES.map((m, i) => {
              const st: Record<string, string> = {
                '--dx': `${m.dx}px`,
                '--dy': `${m.dy}px`,
                animation: `mote 0.75s ease-out ${m.delay}s both`,
              };
              return (
                <circle
                  key={i}
                  cx={C}
                  cy={C}
                  r={m.rad}
                  fill="#e7cf7a"
                  style={st as CSSProperties}
                />
              );
            })}
          </g>
        )}

        {/* Чёткая сердцевина-круг (всегда). Пустая — контур; затем плавно наливается цветом. */}
        <circle
          cx={C}
          cy={C}
          r={CENTER_R}
          fill="none"
          stroke="#e7cf7a"
          strokeOpacity={0.55}
          strokeWidth={2}
          style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.18))' }}
        />
        {centerColor && (
          <circle
            cx={C}
            cy={C}
            r={CENTER_R}
            fill={centerColor}
            stroke="#e7cf7a"
            strokeOpacity={0.6}
            strokeWidth={2}
            opacity={centerFilled ? 1 : 0}
            style={{
              transition: 'opacity 0.6s ease 0.1s',
              filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.32))',
            }}
          />
        )}

        {/* Слой подписей: статичные позиции, проявляются чуть позже лепестков */}
        {overviewMounted &&
          EMOTION_FAMILIES.map((f, i) => {
            const ang = petalAngle(i, EMOTION_FAMILIES.length);
            const lp = pointAt(C, C, ang, FAM_LABEL_R);
            return (
              <text
                key={`l-${f.id}`}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={500}
                fill={readableText(f.color)}
                transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                style={labelStyle(phase === 'overview')}
              >
                {SHORT[f.id] ?? f.name}
              </text>
            );
          })}

        {familyMounted &&
          familyPetals &&
          familyPetals.shades.map((s, i) => {
            const ang = petalAngle(i, familyPetals.shades.length);
            const lp = pointAt(C, C, ang, CHILD_LABEL_R);
            return (
              <text
                key={`l-${s.id}`}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={500}
                fill={readableText(s.color)}
                transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                style={labelStyle(phase === 'family')}
              >
                {s.name}
              </text>
            );
          })}

        {/* Подпись семьи в сердцевине — после заливки */}
        {centerColor && (
          <text
            x={C}
            y={C}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={500}
            fill={readableText(centerColor)}
            style={labelStyle(phase === 'family')}
          >
            {centerLabel}
          </text>
        )}
      </svg>

      {phase === 'family' && shade && (
        <div className="animate-fade-up bg-surface-raised w-full max-w-md rounded-lg p-4">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: shade.color }}
            />
            <span className="font-display text-ink text-xl">{shade.name}</span>
          </div>
          <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">{shade.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => commit(shade)}
              className={cn(
                'bg-gold text-canvas h-11 rounded-lg px-6 font-medium',
                'hover:shadow-glow transition-shadow duration-300',
              )}
            >
              Это оно
            </button>
            <span className="text-ink-muted text-xs">или выбери другой оттенок</span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';

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
const INNER = 46; // лепестки начинаются от края центрального круга → открытое ядро
const OUTER = 150;
const FAM_LABEL_R = 98;
const CHILD_LABEL_R = 96;
const CENTER_R = 46; // один размер центра и в общем виде, и в раскрытом

/** Длительность перехода уровней (мс). Чуть больше .fl-grow в globals.css. */
const TRANSITION_MS = 1040;

/** Короткие подписи семей для лепестков (полные имена слишком длинные). */
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

export function EmotionWheel({ onSelect }: { onSelect: (e: SelectedEmotion) => void }) {
  const [phase, setPhase] = useState<Phase>('overview');
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [shade, setShade] = useState<EmotionShade | null>(null);
  // Цвет/подпись центра живут отдельно от петель: центр статичен, меняется только прозрачность.
  // Значения сохраняются и во время угасания (не обнуляем на возврате).
  const [centerColor, setCenterColor] = useState<string | null>(null);
  const [centerLabel, setCenterLabel] = useState('');

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
    setPhase('toFamily');
  }

  function back(): void {
    if (phase !== 'family') return;
    buzz(6);
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
  const centerFilled = phase === 'toFamily' || phase === 'family';

  const familyHeader = (phase === 'toFamily' || phase === 'family') && family;
  const title = familyHeader
    ? `«${SHORT[family.id] ?? family.name}» — какой оттенок ближе?`
    : 'Что ты сейчас чувствуешь?';
  const subtitle = familyHeader
    ? 'нажми, чтобы прочитать и выбрать'
    : 'нажми на подходящий лепесток';

  const centerTransition = 'opacity 0.7s cubic-bezier(0.37, 0, 0.63, 1)';

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
        {/* Уровень семей */}
        {overviewMounted && (
          <g className={phase === 'toFamily' ? 'fl-fall' : 'fl-grow'}>
            {EMOTION_FAMILIES.map((f, i) => {
              const ang = petalAngle(i, EMOTION_FAMILIES.length);
              const d = petalPath(C, C, ang, INNER, OUTER, (2 * Math.PI) / EMOTION_FAMILIES.length);
              const lp = pointAt(C, C, ang, FAM_LABEL_R);
              const label = SHORT[f.id] ?? f.name;
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
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={500}
                    fill={readableText(f.color)}
                    transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Уровень оттенков выбранной семьи */}
        {familyMounted && family && (
          <g className={phase === 'toOverview' ? 'fl-fall' : 'fl-grow'}>
            {family.shades.map((s, i) => {
              const ang = petalAngle(i, family.shades.length);
              const d = petalPath(C, C, ang, INNER, OUTER, (2 * Math.PI) / family.shades.length);
              const lp = pointAt(C, C, ang, CHILD_LABEL_R);
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
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={500}
                    fill={readableText(s.color)}
                    transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {s.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Статичный центр: пустое ядро + плавная заливка цветом/подписью семьи */}
        <circle
          cx={C}
          cy={C}
          r={CENTER_R}
          fill="none"
          stroke="rgba(231,207,122,0.28)"
          strokeWidth={1}
          style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.18))' }}
        />
        {centerColor && (
          <>
            <circle
              cx={C}
              cy={C}
              r={CENTER_R}
              fill={centerColor}
              stroke="rgba(231,207,122,0.5)"
              strokeWidth={1.5}
              opacity={centerFilled ? 1 : 0}
              style={{
                transition: centerTransition,
                filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.35))',
              }}
            />
            <text
              x={C}
              y={C}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={500}
              fill={readableText(centerColor)}
              opacity={centerFilled ? 1 : 0}
              style={{ transition: centerTransition, pointerEvents: 'none' }}
            >
              {centerLabel}
            </text>
          </>
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

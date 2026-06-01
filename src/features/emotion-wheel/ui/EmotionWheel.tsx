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
const INNER = 32;
const OUTER = 150;
const FAM_LABEL_R = 96;
const CHILD_LABEL_R = 92;
const HUB_R = 26;
const FAM_CIRCLE_R = 46;

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

type Phase = 'overview' | 'leaving' | 'family' | 'returning';

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

  useEffect(() => {
    if (phase === 'leaving') {
      const t = setTimeout(() => setPhase('family'), 470);
      return () => clearTimeout(t);
    }
    if (phase === 'returning') {
      const t = setTimeout(() => {
        setFamily(null);
        setShade(null);
        setPhase('overview');
      }, 450);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  function selectFamily(f: EmotionFamily): void {
    if (phase !== 'overview') return;
    buzz(10);
    setFamily(f);
    setShade(null);
    setPhase('leaving');
  }

  function back(): void {
    if (phase !== 'family') return;
    buzz(6);
    setPhase('returning');
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

  const showOverview = phase === 'overview' || phase === 'leaving';
  const showFamily = phase === 'family' || phase === 'returning';

  const title =
    showFamily && family
      ? `«${SHORT[family.id] ?? family.name}» — какой оттенок ближе?`
      : 'Что ты сейчас чувствуешь?';
  const subtitle = showFamily ? 'нажми, чтобы прочитать и выбрать' : 'нажми на подходящий лепесток';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex min-h-[2.75rem] w-full max-w-md items-center gap-2">
        {showFamily && (
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
        {showOverview && (
          <g className={phase === 'leaving' ? 'fl-fall' : 'fl-grow'}>
            {EMOTION_FAMILIES.map((f, i) => {
              const ang = petalAngle(i, EMOTION_FAMILIES.length);
              const d = petalPath(C, C, ang, INNER, OUTER, (2 * Math.PI) / EMOTION_FAMILIES.length);
              const lp = pointAt(C, C, ang, FAM_LABEL_R);
              const label = SHORT[f.id] ?? f.name;
              return (
                <g
                  key={f.id}
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

        {showFamily && family && (
          <g className={phase === 'returning' ? 'fl-fall' : 'fl-grow'}>
            {family.shades.map((s, i) => {
              const ang = petalAngle(i, family.shades.length);
              const d = petalPath(C, C, ang, INNER, OUTER, (2 * Math.PI) / family.shades.length);
              const lp = pointAt(C, C, ang, CHILD_LABEL_R);
              const isSel = shade?.id === s.id;
              return (
                <g
                  key={s.id}
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

        {showOverview ? (
          <circle
            cx={C}
            cy={C}
            r={HUB_R}
            fill="#221b3d"
            stroke="rgba(231,207,122,0.35)"
            strokeWidth={1}
            style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.25))' }}
          />
        ) : (
          family && (
            <>
              <circle
                cx={C}
                cy={C}
                r={FAM_CIRCLE_R}
                fill={family.color}
                stroke="rgba(231,207,122,0.5)"
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.35))' }}
              />
              <text
                x={C}
                y={C}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={500}
                fill={readableText(family.color)}
                style={{ pointerEvents: 'none' }}
              >
                {SHORT[family.id] ?? family.name}
              </text>
            </>
          )
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

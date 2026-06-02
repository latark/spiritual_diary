'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { EMOTION_FAMILIES, type EmotionFamily, type EmotionShade } from '@/shared/content/emotions';
import { cn } from '@/shared/lib/cn';

import {
  petalAngle,
  petalPath,
  pointAt,
  radialLabelRotation,
  readableText,
} from '../model/geometry';
import { MOTION_PRESET } from '../model/motion-presets';
import type { SelectedEmotion } from '../model/types';

const VIEW = 360;
const C = 180;
const CENTER_R = 42; // чёткая сердцевина-круг, один размер в обоих видах
const INNER = 50; // лепестки начинаются с зазором от сердцевины
const OUTER = 162; // удлинены — больше места для подписи внутри
const LABEL_R = 106; // подпись в широкой части лепестка

/** Доступная радиальная длина для подписи (px). По ней подбираем размер шрифта. */
const LABEL_USABLE = OUTER - INNER - 16;

/** Подбор размера шрифта так, чтобы самое длинное слово в кольце поместилось по длине лепестка. */
function fitFont(maxLen: number, base: number): number {
  const fit = Math.floor(LABEL_USABLE / (maxLen * 0.58));
  return Math.max(9, Math.min(base, fit));
}

/** Длительность смены уровня (мс) — после неё старое размонтируется. Свет на canvas живёт дольше сам. */
const TRANSITION_MS = 360;

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

const FAM_FONT = fitFont(Math.max(...Object.values(SHORT).map((s) => s.length)), 12);

type Phase = 'overview' | 'toFamily' | 'family' | 'toOverview';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// Генерация частиц — на уровне модуля (Math.random нельзя вызывать в теле компонента).
function spawnParticles(): Particle[] {
  const p = MOTION_PRESET;
  const out: Particle[] = [];
  for (let i = 0; i < p.moteCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = p.moteSpread * (0.7 + Math.random() * 0.35);
    const x = C + r * Math.cos(ang);
    const y = C + r * Math.sin(ang);
    const maxLife = p.moteDurMs * (0.8 + Math.random() * 0.4);
    const frames = maxLife / 16.67;
    const tang = (Math.random() - 0.5) * 0.6;
    out.push({
      x,
      y,
      vx: (C - x) / frames - Math.sin(ang) * tang,
      vy: (C - y) / frames + Math.cos(ang) * tang,
      life: maxLife,
      maxLife,
      size: p.moteSize * (0.6 + Math.random() * 0.8),
    });
  }
  return out;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
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

export function EmotionWheel({ onSelect }: { onSelect: (e: SelectedEmotion) => void }) {
  const [phase, setPhase] = useState<Phase>('overview');
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [shade, setShade] = useState<EmotionShade | null>(null);
  const [centerColor, setCenterColor] = useState<string | null>(null);
  const [centerLabel, setCenterLabel] = useState('');
  const [transitionId, setTransitionId] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const igniteRef = useRef<{ t: number; dur: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  function ensureCtx(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const cssW = canvas.clientWidth || VIEW;
    const dpr = window.devicePixelRatio || 1;
    const need = Math.max(1, Math.round(cssW * dpr));
    if (canvas.width !== need) {
      canvas.width = need;
      canvas.height = need;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const s = (cssW / VIEW) * dpr;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    return ctx;
  }

  function loop(ts: number): void {
    const ctx = ensureCtx();
    if (!ctx) {
      rafRef.current = null;
      return;
    }
    const dt = lastTsRef.current ? ts - lastTsRef.current : 16.67;
    lastTsRef.current = ts;
    const p = MOTION_PRESET;

    ctx.clearRect(0, 0, VIEW, VIEW);
    ctx.globalCompositeOperation = 'lighter';

    const ign = igniteRef.current;
    if (ign) {
      ign.t += dt;
      const prog = Math.min(1, ign.t / ign.dur);
      const a = Math.sin(prog * Math.PI) * p.igniteOpacity;
      if (a > 0.001) {
        const grad = ctx.createRadialGradient(C, C, 0, C, C, CENTER_R * 2.4);
        grad.addColorStop(0, `rgba(244,228,166,${a})`);
        grad.addColorStop(0.5, `rgba(231,207,122,${a * 0.5})`);
        grad.addColorStop(1, 'rgba(231,207,122,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(C, C, CENTER_R * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (prog >= 1) igniteRef.current = null;
    }

    const alive: Particle[] = [];
    const dtScale = dt / 16.67;
    for (const pt of particlesRef.current) {
      pt.x += pt.vx * dtScale;
      pt.y += pt.vy * dtScale;
      pt.life -= dt;
      if (pt.life <= 0) continue;
      const prog = 1 - pt.life / pt.maxLife;
      const a = Math.sin(prog * Math.PI) * p.moteGlow;
      if (a > 0.001) {
        const rr = pt.size * 4;
        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rr);
        grad.addColorStop(0, `rgba(244,228,166,${a})`);
        grad.addColorStop(0.4, `rgba(231,207,122,${a * 0.6})`);
        grad.addColorStop(1, 'rgba(231,207,122,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      alive.push(pt);
    }
    particlesRef.current = alive;

    if (alive.length > 0 || igniteRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, VIEW, VIEW);
      rafRef.current = null;
    }
  }

  function fireLight(): void {
    if (prefersReducedMotion()) return;
    particlesRef.current = spawnParticles();
    igniteRef.current = {
      t: 0,
      dur: Math.max(MOTION_PRESET.moteDurMs, MOTION_PRESET.materializeMs),
    };
    if (rafRef.current == null) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
  }

  // свет при каждом переходе
  useEffect(() => {
    if (transitionId > 0) fireLight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionId]);

  // фазовая машина
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

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
  const overviewPresent = phase === 'overview' || phase === 'toOverview';
  const familyPresent = phase === 'family' || phase === 'toFamily';
  const centerFilled = phase === 'toFamily' || phase === 'family';
  const familyPetals = family;

  const familyHeader = (phase === 'toFamily' || phase === 'family') && family;
  const title = familyHeader
    ? `«${SHORT[family.id] ?? family.name}» — какой оттенок ближе?`
    : 'Что ты сейчас чувствуешь?';
  const subtitle = familyHeader
    ? 'нажми, чтобы прочитать и выбрать'
    : 'нажми на подходящий лепесток';

  const childFont = familyPetals
    ? fitFont(Math.max(...familyPetals.shades.map((s) => s.name.length)), 11)
    : 11;

  // лепестки: только прозрачность (без размытия при maxBlur=0), быстрый кросс-фейд
  function groupStyle(present: boolean): CSSProperties {
    const p = MOTION_PRESET;
    return {
      opacity: present ? 1 : 0,
      filter: present ? 'blur(0px)' : `blur(${p.maxBlur}px)`,
      transition: present
        ? `opacity ${p.materializeMs}ms ease ${p.materializeDelayMs}ms, filter ${p.materializeMs}ms ease`
        : `opacity ${p.dissolveMs}ms ease, filter ${p.dissolveMs}ms ease`,
      pointerEvents: present ? undefined : 'none',
    };
  }
  // подписи проявляются чуть позже лепестков
  function labelStyle(visible: boolean): CSSProperties {
    const p = MOTION_PRESET;
    return {
      opacity: visible ? 1 : 0,
      transition: visible
        ? `opacity ${p.materializeMs}ms ease ${p.materializeMs}ms`
        : `opacity 150ms ease`,
      pointerEvents: 'none',
    };
  }
  const centerStyle: CSSProperties = {
    opacity: centerFilled ? 1 : 0,
    transition: `opacity ${MOTION_PRESET.materializeMs}ms ease`,
  };

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

      <div className="relative aspect-square w-full max-w-[440px]">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Цветок эмоций"
          style={{ overflow: 'visible' }}
        >
          {/* лепестки семей */}
          {overviewMounted && (
            <g style={groupStyle(overviewPresent)}>
              {EMOTION_FAMILIES.map((f, i) => {
                const ang = petalAngle(i, EMOTION_FAMILIES.length);
                const d = petalPath(
                  C,
                  C,
                  ang,
                  INNER,
                  OUTER,
                  (2 * Math.PI) / EMOTION_FAMILIES.length,
                );
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

          {/* лепестки оттенков */}
          {familyMounted && familyPetals && (
            <g style={groupStyle(familyPresent)}>
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

          {/* чёткая сердцевина-круг + плавная заливка цветом */}
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
              style={centerStyle}
            />
          )}

          {/* подписи семей */}
          {overviewMounted &&
            EMOTION_FAMILIES.map((f, i) => {
              const ang = petalAngle(i, EMOTION_FAMILIES.length);
              const lp = pointAt(C, C, ang, LABEL_R);
              return (
                <text
                  key={`l-${f.id}`}
                  x={lp.x}
                  y={lp.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={FAM_FONT}
                  fontWeight={500}
                  fill={readableText(f.color)}
                  transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                  style={labelStyle(phase === 'overview')}
                >
                  {SHORT[f.id] ?? f.name}
                </text>
              );
            })}

          {/* подписи оттенков */}
          {familyMounted &&
            familyPetals &&
            familyPetals.shades.map((s, i) => {
              const ang = petalAngle(i, familyPetals.shades.length);
              const lp = pointAt(C, C, ang, LABEL_R);
              return (
                <text
                  key={`l-${s.id}`}
                  x={lp.x}
                  y={lp.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={childFont}
                  fontWeight={500}
                  fill={readableText(s.color)}
                  transform={`rotate(${radialLabelRotation(ang)} ${lp.x} ${lp.y})`}
                  style={labelStyle(phase === 'family')}
                >
                  {s.name}
                </text>
              );
            })}

          {/* подпись семьи в сердцевине */}
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

        {/* canvas-слой света поверх (клики проходят сквозь) */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>

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

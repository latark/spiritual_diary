'use client';

/**
 * Стенд подбора анимации цветка (вариант «свет и растворение»).
 * SVG-лепестки + canvas-слой света (частицы, вспышка ядра). Параметры — ползунки.
 * Не входит в продукт: страница вне группы (main), нужна только для подбора ощущения.
 * Найди «то самое» → кнопка «Скопировать значения» → пришли цифры.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { EMOTION_FAMILIES } from '@/shared/content/emotions';

// --- Локальная геометрия (копия из features/emotion-wheel, чтобы стенд был независим) ---
const VIEW = 360;
const C = 180;
const CENTER_R = 42;
const INNER = 52;
const OUTER = 150;
const FAM_LABEL_R = 102;
const CHILD_LABEL_R = 100;

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

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}
function halfAngleAt(t: number, hmax: number): number {
  const p = 0.42;
  if (t <= p) return hmax;
  return hmax * (1 - smoothstep((t - p) / (1 - p)));
}
function petalPath(angle: number, sector: number): string {
  const hmax = (sector / 2) * 0.82;
  const pts: Array<[number, number]> = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = INNER + (OUTER - INNER) * t;
    const a = angle - halfAngleAt(t, hmax);
    pts.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / steps;
    const r = INNER + (OUTER - INNER) * t;
    const a = angle + halfAngleAt(t, hmax);
    pts.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  const n = pts.length;
  const f = (v: number) => v.toFixed(2);
  let d = `M ${f(pts[0]![0])} ${f(pts[0]![1])} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    d += `C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}, ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}, ${f(p2[0])} ${f(p2[1])} `;
  }
  return d + 'Z';
}
function petalAngle(i: number, total: number): number {
  return (-90 + (i * 360) / total) * (Math.PI / 180);
}
function rot(angle: number): number {
  const deg = angle * (180 / Math.PI);
  const nz = ((deg % 360) + 360) % 360;
  return nz > 90 && nz < 270 ? deg + 180 : deg;
}
function lum(hex: string): number {
  return (
    0.299 * parseInt(hex.slice(1, 3), 16) +
    0.587 * parseInt(hex.slice(3, 5), 16) +
    0.114 * parseInt(hex.slice(5, 7), 16)
  );
}
function readableText(hex: string): string {
  return lum(hex) < 150 ? '#F2EDFF' : '#241433';
}

// --- Параметры стенда ---
interface Params {
  dissolveMs: number;
  materializeMs: number;
  materializeDelayMs: number;
  maxBlur: number;
  moteCount: number;
  moteDurMs: number;
  moteSize: number;
  moteGlow: number;
  moteSpread: number;
  igniteOpacity: number;
  holdMs: number;
}

const DEFAULTS: Params = {
  dissolveMs: 550,
  materializeMs: 600,
  materializeDelayMs: 300,
  maxBlur: 8,
  moteCount: 16,
  moteDurMs: 750,
  moteSize: 2.2,
  moteGlow: 0.8,
  moteSpread: 120,
  igniteOpacity: 0.55,
  holdMs: 900,
};

const SLIDERS: Array<{ key: keyof Params; label: string; min: number; max: number; step: number }> =
  [
    { key: 'dissolveMs', label: 'Растворение старых, мс', min: 150, max: 1400, step: 10 },
    { key: 'materializeMs', label: 'Проявление новых, мс', min: 150, max: 1400, step: 10 },
    { key: 'materializeDelayMs', label: 'Задержка проявления, мс', min: 0, max: 700, step: 10 },
    { key: 'maxBlur', label: 'Сила размытия, px', min: 0, max: 18, step: 0.5 },
    { key: 'moteCount', label: 'Частиц света, шт', min: 0, max: 70, step: 1 },
    { key: 'moteDurMs', label: 'Жизнь частицы, мс', min: 250, max: 1800, step: 10 },
    { key: 'moteSize', label: 'Размер частицы', min: 0.5, max: 6, step: 0.1 },
    { key: 'moteGlow', label: 'Яркость свечения', min: 0, max: 1, step: 0.05 },
    { key: 'moteSpread', label: 'Разлёт частиц, px', min: 50, max: 175, step: 2 },
    { key: 'igniteOpacity', label: 'Вспышка ядра', min: 0, max: 1, step: 0.05 },
    { key: 'holdMs', label: 'Пауза (автоповтор), мс', min: 300, max: 2400, step: 50 },
  ];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// Генерация частиц вынесена на уровень модуля (вне компонента) — иначе Math.random
// нарушает правило чистоты React-хуков.
function spawnParticles(p: Params): Particle[] {
  const next: Particle[] = [];
  for (let i = 0; i < p.moteCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = p.moteSpread * (0.7 + Math.random() * 0.35);
    const x = C + r * Math.cos(ang);
    const y = C + r * Math.sin(ang);
    const maxLife = p.moteDurMs * (0.8 + Math.random() * 0.4);
    const frames = maxLife / 16.67;
    const tang = (Math.random() - 0.5) * 0.6;
    next.push({
      x,
      y,
      vx: (C - x) / frames - Math.sin(ang) * tang,
      vy: (C - y) / frames + Math.cos(ang) * tang,
      life: maxLife,
      maxLife,
      size: p.moteSize * (0.6 + Math.random() * 0.8),
    });
  }
  return next;
}

export default function MotionLabPage() {
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [phase, setPhase] = useState<'overview' | 'family'>('overview');
  const [familyIndex, setFamilyIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [copied, setCopied] = useState(false);

  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const igniteRef = useRef<{ t: number; dur: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  const family = EMOTION_FAMILIES[familyIndex] ?? EMOTION_FAMILIES[0]!;

  function ensureCanvas(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== VIEW * dpr) {
      canvas.width = VIEW * dpr;
      canvas.height = VIEW * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function loop(ts: number): void {
    const ctx = ensureCanvas();
    if (!ctx) {
      rafRef.current = null;
      return;
    }
    const dt = lastTsRef.current ? ts - lastTsRef.current : 16.67;
    lastTsRef.current = ts;
    const p = paramsRef.current;

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
    particlesRef.current = spawnParticles(paramsRef.current);
    igniteRef.current = {
      t: 0,
      dur: Math.max(paramsRef.current.moteDurMs, paramsRef.current.materializeMs),
    };
    if (rafRef.current == null) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
  }

  // запуск света при каждом переходе
  useEffect(() => {
    fireLight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, familyIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // автоповтор
  useEffect(() => {
    if (!autoplay) return undefined;
    let timer: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setPhase((prev) => (prev === 'overview' ? 'family' : 'overview'));
      const p = paramsRef.current;
      const period = Math.max(p.dissolveMs, p.materializeMs + p.materializeDelayMs) + p.holdMs;
      timer = setTimeout(cycle, period);
    };
    const p0 = paramsRef.current;
    const period0 = Math.max(p0.dissolveMs, p0.materializeMs + p0.materializeDelayMs) + p0.holdMs;
    timer = setTimeout(cycle, period0);
    return () => clearTimeout(timer);
  }, [autoplay]);

  // --- стили лепестков (живо настраиваются ползунками) ---
  function groupStyle(present: boolean): CSSProperties {
    const p = params;
    return {
      opacity: present ? 1 : 0,
      filter: present ? 'blur(0px)' : `blur(${p.maxBlur}px)`,
      transition: present
        ? `opacity ${p.materializeMs}ms ease ${p.materializeDelayMs}ms, filter ${p.materializeMs}ms ease ${p.materializeDelayMs}ms`
        : `opacity ${p.dissolveMs}ms ease, filter ${p.dissolveMs}ms ease`,
      pointerEvents: present ? undefined : 'none',
    };
  }
  function labelStyle(visible: boolean): CSSProperties {
    const p = params;
    const delay = p.materializeDelayMs + p.materializeMs * 0.5;
    return {
      opacity: visible ? 1 : 0,
      transition: visible
        ? `opacity ${p.materializeMs}ms ease ${delay}ms`
        : `opacity ${Math.min(p.dissolveMs, 250)}ms ease`,
      pointerEvents: 'none',
    };
  }
  const centerStyle: CSSProperties = {
    opacity: phase === 'family' ? 1 : 0,
    transition: `opacity ${params.materializeMs}ms ease ${params.materializeDelayMs}ms`,
  };

  function copyValues(): void {
    void navigator.clipboard?.writeText(JSON.stringify(params, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
      <div>
        <h1 className="font-display text-ink text-3xl">Стенд анимации · «свет и растворение»</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Крути ползунки, смотри переход. Включи автоповтор или жми по лепестку. Нашла ощущение —
          «Скопировать значения» и пришли мне.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Сцена */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative" style={{ width: VIEW, height: VIEW }}>
            <svg
              viewBox={`0 0 ${VIEW} ${VIEW}`}
              width={VIEW}
              height={VIEW}
              style={{ display: 'block', overflow: 'visible' }}
            >
              {/* лепестки семей */}
              <g style={groupStyle(phase === 'overview')}>
                {EMOTION_FAMILIES.map((f, i) => {
                  const ang = petalAngle(i, EMOTION_FAMILIES.length);
                  return (
                    <path
                      key={f.id}
                      d={petalPath(ang, (2 * Math.PI) / EMOTION_FAMILIES.length)}
                      fill={f.color}
                      stroke="rgba(231,207,122,0.30)"
                      strokeWidth={1}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPhase('family')}
                    />
                  );
                })}
              </g>

              {/* лепестки оттенков */}
              <g style={groupStyle(phase === 'family')}>
                {family.shades.map((s, i) => {
                  const ang = petalAngle(i, family.shades.length);
                  return (
                    <path
                      key={s.id}
                      d={petalPath(ang, (2 * Math.PI) / family.shades.length)}
                      fill={s.color}
                      stroke="rgba(231,207,122,0.30)"
                      strokeWidth={1}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPhase('overview')}
                    />
                  );
                })}
              </g>

              {/* сердцевина */}
              <circle
                cx={C}
                cy={C}
                r={CENTER_R}
                fill="none"
                stroke="#e7cf7a"
                strokeOpacity={0.55}
                strokeWidth={2}
              />
              <circle cx={C} cy={C} r={CENTER_R} fill={family.color} style={centerStyle} />

              {/* подписи */}
              {EMOTION_FAMILIES.map((f, i) => {
                const ang = petalAngle(i, EMOTION_FAMILIES.length);
                const x = C + FAM_LABEL_R * Math.cos(ang);
                const y = C + FAM_LABEL_R * Math.sin(ang);
                return (
                  <text
                    key={`l-${f.id}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={500}
                    fill={readableText(f.color)}
                    transform={`rotate(${rot(ang)} ${x} ${y})`}
                    style={labelStyle(phase === 'overview')}
                  >
                    {SHORT[f.id] ?? f.name}
                  </text>
                );
              })}
              {family.shades.map((s, i) => {
                const ang = petalAngle(i, family.shades.length);
                const x = C + CHILD_LABEL_R * Math.cos(ang);
                const y = C + CHILD_LABEL_R * Math.sin(ang);
                return (
                  <text
                    key={`l-${s.id}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={500}
                    fill={readableText(s.color)}
                    transform={`rotate(${rot(ang)} ${x} ${y})`}
                    style={labelStyle(phase === 'family')}
                  >
                    {s.name}
                  </text>
                );
              })}
              <text
                x={C}
                y={C}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={500}
                fill={readableText(family.color)}
                style={labelStyle(phase === 'family')}
              >
                {SHORT[family.id] ?? family.name}
              </text>
            </svg>

            {/* canvas-слой света поверх */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: VIEW,
                height: VIEW,
                pointerEvents: 'none',
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPhase((p) => (p === 'overview' ? 'family' : 'overview'))}
              className="bg-gold text-canvas rounded-lg px-4 py-2 text-sm font-medium"
            >
              Запустить переход
            </button>
            <button
              type="button"
              onClick={() => setAutoplay((a) => !a)}
              className="bg-surface-raised text-ink rounded-lg px-4 py-2 text-sm"
            >
              {autoplay ? 'Стоп автоповтор' : 'Автоповтор'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {EMOTION_FAMILIES.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFamilyIndex(i)}
                className="rounded-full px-2.5 py-1 text-xs"
                style={{
                  backgroundColor: i === familyIndex ? f.color : 'transparent',
                  color: i === familyIndex ? readableText(f.color) : '#b0a8c5',
                  outline: i === familyIndex ? 'none' : '1px solid rgba(176,168,197,0.3)',
                }}
              >
                {SHORT[f.id] ?? f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ползунки */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {SLIDERS.map((s) => (
              <label key={s.key} className="flex flex-col gap-1">
                <span className="text-ink-muted flex justify-between text-xs">
                  <span>{s.label}</span>
                  <span className="text-gold">{params[s.key]}</span>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                  }
                  className="accent-gold"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyValues}
              className="bg-gold text-canvas rounded-lg px-4 py-2 text-sm font-medium"
            >
              {copied ? 'Скопировано ✓' : 'Скопировать значения'}
            </button>
            <button
              type="button"
              onClick={() => setParams(DEFAULTS)}
              className="bg-surface-raised text-ink rounded-lg px-4 py-2 text-sm"
            >
              Сбросить
            </button>
          </div>

          <pre className="bg-surface text-ink-muted mt-4 overflow-x-auto rounded-lg p-3 text-xs">
            {JSON.stringify(params, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

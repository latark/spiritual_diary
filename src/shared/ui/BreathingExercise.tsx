'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Дыхательная практика — общий компонент для онбординга и записи эмоции.
 * Ритм: бокс-дыхание 4-4-4-4 (вдох · задержка · выдох · задержка), по умолчанию 4 цикла.
 *
 * Визуал по валентности:
 *  - 'amplify' (светлая эмоция) и 'calm' (онбординг): светлячок начинается маленьким и
 *    с каждым вдохом плавно растёт, в конце — большой и яркий.
 *  - 'release' (тяжёлая эмоция): в центре тёмная колючка; с каждым выдохом от неё отлетают
 *    кусочки, колючка обламывается и уменьшается, а внутри разгорается светлячок — растёт и
 *    ярчает, пока полностью не перекроет колючку. В конце такой же большой и яркий.
 * Анимация — подсказка ритма; досрочный выход доступен всегда.
 */

export type BreathMode = 'release' | 'amplify' | 'calm';

const PHASES = [
  { key: 'inhale', label: 'вдох' },
  { key: 'hold-in', label: 'задержка' },
  { key: 'exhale', label: 'выдох' },
  { key: 'hold-out', label: 'задержка' },
] as const;
const PHASE_SEC = 4;
const CYCLE_SEC = PHASE_SEC * PHASES.length; // 16

// Тёплый свет и тёмная колючка — значения из globals.css (тёмная тема, единственная в MVP).
const LIGHT_CORE = '#fff7da';
const LIGHT_MID = '#ffe9a8';
const LIGHT_GLOW = '#e7cf7a';
const THORN_FILL = '#0c0c15';
const THORN_EDGE = '#e8e2f8';

const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

interface Mote {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  bob: number;
}
interface Frag {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
}

export function BreathingExercise({
  mode,
  cycles = 4,
  title,
  subtitle,
  giftText,
  introText = 'Давай сонастроимся и подышим вместе — это всего минута.',
  startLabel = 'Наполнить светом',
  skipLabel = 'Пропустить',
  doneLabel = 'Далее',
  onFinish,
}: {
  mode: BreathMode;
  cycles?: number;
  title?: string;
  subtitle?: string;
  /** «Дар» эмоции — показываем перед началом. */
  giftText?: string | null;
  introText?: string;
  startLabel?: string;
  skipLabel?: string;
  doneLabel?: string;
  /** completed = практику довели до конца; false = пропустили досрочно. */
  onFinish: (completed: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [phaseLabel, setPhaseLabel] = useState<string>(PHASES[0].label);
  const [cycleNum, setCycleNum] = useState(1);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const isRelease = mode === 'release';

    let size = 0;
    let dpr = 1;
    const resize = () => {
      size = Math.min(wrap.clientWidth, 300);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const motes: Mote[] = reduce
      ? []
      : Array.from({ length: 5 }, (_, i) => ({
          angle: (Math.PI * 2 * i) / 5 + i * 0.7,
          radius: lerp(0.32, 0.44, (i % 3) / 2),
          speed: lerp(0.05, 0.11, (i % 4) / 3) * (i % 2 ? 1 : -1),
          size: lerp(1, 2.2, ((i * 7) % 5) / 4),
          bob: i * 1.3,
        }));
    const frags: Frag[] = [];

    const total = cycles * CYCLE_SEC;
    const start = performance.now();

    let lastPhaseId = '';
    let lastNow = start;
    let finished = false;
    // grow: 0 — маленький светлячок (колючка целая), 1 — большой яркий (колючки нет).
    let grow = 0;
    let growTarget = 0;

    function star(cx: number, cy: number, outer: number, inner: number, rot: number): void {
      const spikes = 11;
      ctx!.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI * i) / spikes + rot;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
    }

    function shedFrags(cx: number, cy: number, r: number): void {
      if (reduce) return;
      const k = size / 280;
      for (let i = 0; i < 9; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = lerp(0.8, 1.8, Math.random()) * k;
        frags.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.3 * k,
          r: lerp(2, 4.5, Math.random()) * k,
          life: 0,
          max: lerp(1.1, 1.9, Math.random()),
        });
      }
    }

    let raf = requestAnimationFrame(function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      const step = dt * 60;
      lastNow = now;

      const elapsedRaw = (now - start) / 1000;
      const isDone = elapsedRaw >= total;
      const elapsed = isDone ? total : elapsedRaw;

      const cx = size / 2;
      const cy = size / 2;

      const cycleIdx = Math.min(Math.floor(elapsed / CYCLE_SEC), cycles - 1);
      const tInCycle = elapsed % CYCLE_SEC;
      const rawPhase = Math.floor(tInCycle / PHASE_SEC);
      const phaseIdx = Number.isFinite(rawPhase) ? Math.min(Math.max(rawPhase, 0), 3) : 0;
      const phaseProg = (tInCycle - phaseIdx * PHASE_SEC) / PHASE_SEC;
      const phaseId = `${cycleIdx}:${phaseIdx}`;

      // 0 — опавший (выдох/нижняя задержка), 1 — раскрытый (вдох/верхняя задержка).
      let breath: number;
      if (phaseIdx === 0) breath = easeInOut(phaseProg);
      else if (phaseIdx === 1) breath = 1;
      else if (phaseIdx === 2) breath = 1 - easeInOut(phaseProg);
      else breath = 0;

      grow += (growTarget - grow) * 0.05;

      if (phaseId !== lastPhaseId && !isDone) {
        const phase = PHASES[phaseIdx];
        // release: на выдохе колючка осыпается и тут же уменьшается, свет подрастает.
        if (isRelease && phase?.key === 'exhale') {
          growTarget = Math.min(1, growTarget + 1 / cycles);
          const thornNow = size * 0.2 * 1.2 * clamp01(1 - grow);
          shedFrags(cx, cy, thornNow + size * 0.02);
        }
        // amplify/calm: после вдоха — шаг роста света.
        if (!isRelease && phaseIdx === 1) growTarget = Math.min(1, growTarget + 1 / cycles);
        setPhaseLabel(phase?.label ?? PHASES[0].label);
        setCycleNum(cycleIdx + 1);
        lastPhaseId = phaseId;
      }

      if (isDone && !finished) {
        finished = true;
        growTarget = 1;
        setDone(true);
      }

      const startR = size * 0.05;
      const bigR = size * 0.2;
      const baseR = lerp(startR, bigR, grow);
      const idle = isDone ? 0.5 + 0.5 * Math.sin(elapsedRaw * 1.1) : breath;
      const coreR = baseR * (0.82 + 0.22 * idle);
      const bright = (isRelease ? lerp(0.35, 1, grow) : 1) * (0.82 + 0.18 * idle);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // --- тёмная колючка и осыпающиеся кусочки (только release) ---
      if (isRelease) {
        ctx.globalCompositeOperation = 'source-over';
        const thornScale = clamp01(1 - grow);
        const thornAlpha = clamp01(1 - grow * 1.15);
        if (thornAlpha > 0.01) {
          // колючка тоже дышит вместе с ритмом (общее увеличение-уменьшение)
          const outer = bigR * 1.2 * thornScale * (0.85 + 0.15 * idle);
          star(cx, cy, outer, outer * 0.46, elapsedRaw * 0.25);
          ctx.fillStyle = rgba(THORN_FILL, thornAlpha);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = rgba(THORN_EDGE, 0.32 * thornAlpha);
          ctx.stroke();
        }
        for (let i = frags.length - 1; i >= 0; i--) {
          const f = frags[i];
          if (!f) continue;
          f.life += dt;
          f.x += f.vx * step;
          f.y += f.vy * step;
          f.vx *= 0.97;
          f.vy = f.vy * 0.97 + 0.02 * step;
          if (f.life >= f.max) {
            frags.splice(i, 1);
            continue;
          }
          const a = Math.max(0, 1 - f.life / f.max);
          ctx.fillStyle = rgba(THORN_FILL, a);
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 0.6;
          ctx.strokeStyle = rgba(THORN_EDGE, 0.3 * a);
          ctx.stroke();
        }
      }

      // --- свет: аура, ядро-светлячок, искры ---
      ctx.globalCompositeOperation = 'lighter';

      const auraR = Math.min(size * 0.48, coreR * 2.6);
      const aura = ctx.createRadialGradient(cx, cy, coreR * 0.4, cx, cy, auraR);
      aura.addColorStop(0, rgba(LIGHT_MID, 0.16 * bright));
      aura.addColorStop(0.55, rgba(LIGHT_GLOW, 0.07 * bright));
      aura.addColorStop(1, rgba(LIGHT_GLOW, 0));
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, size, size);

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, rgba(LIGHT_CORE, 0.98 * bright));
      core.addColorStop(0.5, rgba(LIGHT_MID, 0.8 * bright));
      core.addColorStop(1, rgba(LIGHT_GLOW, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      for (const m of motes) {
        m.angle += m.speed * dt;
        const r = (m.radius + 0.015 * Math.sin(elapsedRaw * 0.6 + m.bob)) * size;
        const mx = cx + Math.cos(m.angle) * r;
        const my = cy + Math.sin(m.angle) * r;
        const a = 0.38 * bright * (0.6 + 0.4 * Math.sin(elapsedRaw * 0.9 + m.bob));
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 3);
        g.addColorStop(0, rgba(LIGHT_CORE, a));
        g.addColorStop(1, rgba(LIGHT_CORE, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, cycles, started]);

  return (
    <div className="animate-fade-up flex w-full flex-col items-center gap-6 py-2 text-center">
      {(title || subtitle) && (
        <div>
          {title && <h2 className="font-display text-ink text-2xl">{title}</h2>}
          {subtitle && <p className="text-ink-muted mt-1 text-sm">{subtitle}</p>}
        </div>
      )}

      {!started ? (
        <div className="flex w-full max-w-xs flex-col items-center gap-7 py-4">
          {giftText && <p className="font-sans text-ink text-lg leading-relaxed">{giftText}</p>}
          <p className="text-ink-muted text-base leading-relaxed">{introText}</p>
          <button type="button" onClick={() => setStarted(true)} className="btn-gold h-12">
            {startLabel}
          </button>
        </div>
      ) : (
        <>
          <div
            ref={wrapRef}
            className="flex aspect-square w-full max-w-[300px] items-center justify-center"
          >
            <canvas ref={canvasRef} aria-hidden="true" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <p
              className="font-display text-ink flex h-12 items-center text-4xl transition-opacity duration-500"
              aria-live="polite"
            >
              {done ? 'Готово' : phaseLabel}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: cycles }).map((_, i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full transition-colors duration-500"
                  style={{
                    backgroundColor:
                      done || i < cycleNum ? 'var(--color-gold)' : 'var(--color-surface-raised)',
                  }}
                />
              ))}
            </div>
          </div>

          <button type="button" onClick={() => onFinish(done)} className="btn-gold h-12">
            {done ? doneLabel : skipLabel}
          </button>
        </>
      )}
    </div>
  );
}

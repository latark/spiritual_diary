'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Дыхательная практика — общий компонент для онбординга и записи эмоции.
 * Ритм: бокс-дыхание 4-4-4-4 (вдох · задержка · выдох · задержка), по умолчанию 4 цикла.
 * Визуал — медитативная canvas-анимация, режим зависит от валентности эмоции:
 *  - 'release' (негатив): тёмная «скорлупа» с каждым выдохом осыпается частицами,
 *    изнутри всё ярче проступает свет — к концу остаётся чистый светлячок;
 *  - 'amplify' (позитив): светлячок с каждым вдохом притягивает светлые частицы и растёт;
 *  - 'calm' (онбординг/нейтрально): просто тёплый растущий свет, без скорлупы.
 * Анимация — только подсказка ритма; досрочный выход доступен всегда.
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

// Палитра — тёмная тема (единственная в MVP), значения из globals.css.
const LIGHT_CORE = '#fff7da';
const LIGHT_MID = '#ffe9a8';
const LIGHT_GLOW = '#e7cf7a';
const SHELL_FILL = '#0c0c15';
const SHELL_EDGE = 'rgba(232,226,248,0.42)';

const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  dark: boolean;
}

export function BreathingExercise({
  mode,
  cycles = 4,
  title,
  subtitle,
  introText = 'Давай сонастроимся и подышим вместе — это всего минута.',
  startLabel = 'Подышим',
  skipLabel = 'Пропустить',
  doneLabel = 'Далее',
  onFinish,
}: {
  mode: BreathMode;
  cycles?: number;
  title?: string;
  subtitle?: string;
  introText?: string;
  startLabel?: string;
  skipLabel?: string;
  doneLabel?: string;
  onFinish: () => void;
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

    const total = cycles * CYCLE_SEC;
    const start = performance.now();
    const particles: Particle[] = [];

    let lastPhaseId = '';
    let lastNow = start;
    let finished = false;
    // release: свет проступает от 0 к 1; иначе свет открыт сразу.
    let reveal = mode === 'release' ? 0 : 1;
    let revealTarget = reveal;
    // amplify: светлячок растёт от 0 к 1; иначе сразу полный.
    let growth = mode === 'amplify' ? 0 : 1;
    let growthTarget = growth;

    function spawnDark(cx: number, cy: number, coreR: number): void {
      if (reduce) return;
      const k = size / 280;
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.5;
        const sp = lerp(0.7, 1.6, Math.random()) * k;
        particles.push({
          x: cx + Math.cos(a) * coreR * 1.3,
          y: cy + Math.sin(a) * coreR * 1.3,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: lerp(1.4, 3.4, Math.random()) * k,
          life: 0,
          max: lerp(1.0, 1.7, Math.random()),
          dark: true,
        });
      }
    }

    function spawnLight(cx: number, cy: number): void {
      if (reduce) return;
      const k = size / 280;
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = size * lerp(0.34, 0.46, Math.random());
        particles.push({
          x: cx + Math.cos(a) * rr,
          y: cy + Math.sin(a) * rr,
          vx: 0,
          vy: 0,
          r: lerp(1.0, 2.6, Math.random()) * k,
          life: 0,
          max: PHASE_SEC,
          dark: false,
        });
      }
    }

    function shellPath(cx: number, cy: number, rOuter: number, wobble: number): void {
      const spikes = 9;
      ctx!.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const a = (Math.PI * i) / spikes - Math.PI / 2;
        const r = (i % 2 === 0 ? rOuter : rOuter * 0.62) * (1 + Math.sin(a * 3 + wobble) * 0.04);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
    }

    let raf = requestAnimationFrame(function frame(now: number) {
      raf = requestAnimationFrame(frame);

      const f = Math.min((now - lastNow) / 1000, 0.05) * 60; // нормировка к 60fps
      const dt = Math.min((now - lastNow) / 1000, 0.05);
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

      // Масштаб дыхания: 0 — пустой (выдох/нижняя задержка), 1 — полный (вдох/верхняя задержка).
      let breath: number;
      if (phaseIdx === 0) breath = easeInOut(phaseProg);
      else if (phaseIdx === 1) breath = 1;
      else if (phaseIdx === 2) breath = 1 - easeInOut(phaseProg);
      else breath = 0;

      reveal += (revealTarget - reveal) * 0.06;
      growth += (growthTarget - growth) * 0.06;

      const small = size * 0.09;
      const big = size * 0.15;
      const gScale = mode === 'amplify' ? lerp(0.6, 1, growth) : 1;
      let coreR = lerp(small, big, breath) * gScale;

      // Переход фазы: всплески частиц и шаги раскрытия/роста.
      if (phaseId !== lastPhaseId && !isDone) {
        const phase = PHASES[phaseIdx];
        if (phase?.key === 'exhale' && mode === 'release') spawnDark(cx, cy, coreR);
        if (phase?.key === 'inhale' && mode === 'amplify') spawnLight(cx, cy);
        // конец выдоха (вошли в нижнюю задержку) → шаг раскрытия света
        if (phaseIdx === 3 && mode === 'release') {
          revealTarget = Math.min(1, revealTarget + 1 / cycles);
        }
        // конец вдоха (вошли в верхнюю задержку) → шаг роста
        if (phaseIdx === 1 && mode === 'amplify') {
          growthTarget = Math.min(1, growthTarget + 1 / cycles);
        }
        setPhaseLabel(phase?.label ?? PHASES[0].label);
        setCycleNum(cycleIdx + 1);
        lastPhaseId = phaseId;
      }

      if (isDone) {
        revealTarget = 1;
        growthTarget = 1;
        if (!finished) {
          finished = true;
          setDone(true);
        }
        // мягкая идл-пульсация завершённого светлячка
        const pulse = 0.5 + 0.5 * Math.sin(elapsedRaw * 1.3);
        coreR = lerp(big * 0.92, big * 1.06, pulse) * gScale;
      }

      const lightAlpha = mode === 'release' ? reveal : 1;

      // --- частицы ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.life += dt;
        if (p.dark) {
          p.x += p.vx * f;
          p.y += p.vy * f;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.vy += 0.012 * f;
          if (p.life >= p.max) particles.splice(i, 1);
        } else {
          const dx = cx - p.x;
          const dy = cy - p.y;
          p.x += dx * 0.05 * f;
          p.y += dy * 0.05 * f;
          if (Math.hypot(dx, dy) < coreR * 0.7 || p.life >= p.max) particles.splice(i, 1);
        }
      }

      // --- отрисовка ---
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);
      ctx!.globalCompositeOperation = 'lighter';

      // внешнее свечение
      // Свечение обязано полностью гаснуть внутри холста, иначе круглый свет упирается в квадратный край.
      const glowR = Math.min(
        coreR * lerp(1.8, 2.6, mode === 'release' ? reveal : growth),
        size * 0.46,
      );
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, rgba(LIGHT_MID, 0.45 * lightAlpha));
      glow.addColorStop(0.5, rgba(LIGHT_GLOW, 0.18 * lightAlpha));
      glow.addColorStop(1, rgba(LIGHT_GLOW, 0));
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, size, size);

      // ядро-светлячок
      const core = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, rgba(LIGHT_CORE, 0.98 * lightAlpha));
      core.addColorStop(0.55, rgba(LIGHT_MID, 0.85 * lightAlpha));
      core.addColorStop(1, rgba(LIGHT_GLOW, 0));
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx!.fill();

      // светлые частицы
      for (const p of particles) {
        if (p.dark) continue;
        const a = Math.min(1, p.life * 2.2) * 0.9;
        ctx!.fillStyle = rgba(LIGHT_CORE, a);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // тёмная скорлупа поверх света (release), тает по мере reveal
      ctx!.globalCompositeOperation = 'source-over';
      if (mode === 'release' && reveal < 0.985) {
        const shellAlpha = 1 - reveal;
        shellPath(cx, cy, coreR * 1.5, elapsedRaw * 0.6);
        ctx!.fillStyle = rgba(SHELL_FILL, shellAlpha);
        ctx!.fill();
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = rgba('#e8e2f8', 0.42 * shellAlpha);
        ctx!.stroke();
      }

      // тёмные частицы (осыпающаяся скорлупа)
      for (const p of particles) {
        if (!p.dark) continue;
        const a = Math.max(0, 1 - p.life / p.max);
        ctx!.fillStyle = rgba(SHELL_FILL, a);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.lineWidth = 0.6;
        ctx!.strokeStyle = SHELL_EDGE.replace('0.42', (0.42 * a).toFixed(2));
        ctx!.stroke();
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
        <div className="flex w-full flex-col items-center gap-7 py-4">
          <p className="text-ink-muted max-w-xs text-base leading-relaxed">{introText}</p>
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

          <button type="button" onClick={onFinish} className="btn-gold h-12">
            {done ? doneLabel : skipLabel}
          </button>
        </>
      )}
    </div>
  );
}

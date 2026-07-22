'use client';

import { useEffect, useRef } from 'react';

import { rgba } from '@/shared/lib/rgba';

/**
 * Фоновая «среда» основного приложения: тело света и контент висят в космосе, а не на плоском чёрном.
 * Отличие от CosmosBackground (онбординг): без фото-галактики и падающих звёзд — только редкое
 * мерцающее звёздное поле на низкой непрозрачности + мягкая радиальная туманность (чистый CSS).
 * Живёт позади контента — рисуется на z-index -1, контент трогать не нужно.
 * Уважает prefers-reduced-motion (один статичный кадр).
 */

const STAR_COLORS = ['#ffffff', '#e7cf7a', '#cdbdf0', '#b8c4e8'];

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  ph: number;
  sp: number;
  dx: number;
  dy: number;
  c: string;
}

export function AmbientCosmos() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let diag = 1;
    let stars: Star[] = [];

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      diag = Math.hypot(w, h) / 2;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // Заметно реже, чем в онбординге: это фон, а не сцена.
      const count = Math.min(150, Math.round((w * h) / 12000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.6),
        a: rand(0.18, 0.7),
        ph: Math.random() * Math.PI * 2,
        sp: rand(0.25, 0.9),
        dx: rand(-0.03, 0.03),
        dy: rand(-0.03, 0.03),
        c: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
      }));
    };
    build();
    window.addEventListener('resize', build);

    // Виньетка: звёзды гуще к краям, в центре уступают место телу света и контенту.
    const edge = (x: number, y: number) => {
      const d = Math.hypot(x - w / 2, y - h / 2) / diag;
      return Math.max(0, Math.min(1, (d - 0.15) / 0.7));
    };

    const render = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const star of stars) {
        if (!reduce) {
          star.x += star.dx;
          star.y += star.dy;
          if (star.x < 0) star.x += w;
          else if (star.x > w) star.x -= w;
          if (star.y < 0) star.y += h;
          else if (star.y > h) star.y -= h;
        }
        const tw = reduce ? 1 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * star.sp + star.ph));
        const a = star.a * tw * edge(star.x, star.y);
        if (a <= 0.012) continue;
        ctx.fillStyle = rgba(star.c, a);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    if (reduce) {
      render(0);
    } else {
      const loop = (t: number) => {
        render(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: -1 }}>
      {/* Мягкая туманность: фиолетовое свечение сверху, тёплое золотое — снизу. Чистый CSS, без перерисовки. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 0%, rgba(155,126,189,0.10), transparent 70%), radial-gradient(55% 40% at 50% 100%, rgba(212,175,55,0.05), transparent 70%)',
        }}
      />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  );
}

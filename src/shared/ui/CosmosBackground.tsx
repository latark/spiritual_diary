'use client';

import { useEffect, useRef } from 'react';

import { rgba } from '@/shared/lib/rgba';

/**
 * Космический фон онбординга: фото галактики (/public/cosmos.jpg) по центру у верхнего края
 * (без обрезки сверху); эллиптическая маска с длинным градиентом уводит края в прозрачность.
 * Поверх — живое звёздное поле и изредка падающие звёзды (в верхней полосе, не на центральный контент).
 * Чистый canvas, без зависимостей. Уважает prefers-reduced-motion (рисует один статичный кадр).
 */

const STAR_COLORS = ['#ffffff', '#e7cf7a', '#cdbdf0', '#b8c4e8'];
const CANVAS_BG = '#0f0b1f';

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

export function CosmosBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';

    // Офскрин-холст: на нём готовим фото с прозрачными (маскированными) краями.
    const oc = document.createElement('canvas');
    const octx = oc.getContext('2d');
    if (octx) octx.imageSmoothingQuality = 'high';

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const img = new Image();
    let imgReady = false;
    img.onload = () => {
      imgReady = true;
    };
    img.src = '/cosmos.jpg';

    let w = 0;
    let h = 0;
    let dpr = 1;
    let diag = 1;
    let stars: Star[] = [];

    // Падающая звезда (одна за раз) + время следующего запуска.
    let shoot: {
      t0: number;
      dur: number;
      x0: number;
      y0: number;
      dx: number;
      dy: number;
      ux: number;
      uy: number;
      tail: number;
    } | null = null;
    let nextShoot = 2500;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      diag = Math.hypot(w, h) / 2;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      oc.width = canvas.width;
      oc.height = canvas.height;
      const count = Math.min(260, Math.round((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.9),
        a: rand(0.25, 1),
        ph: Math.random() * Math.PI * 2,
        sp: rand(0.3, 1.2),
        dx: rand(-0.05, 0.05),
        dy: rand(-0.05, 0.05),
        c: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
      }));
    };
    build();
    window.addEventListener('resize', build);

    // Виньетка для звёзд: 0 в центре, 1 к краям.
    const edge = (x: number, y: number) => {
      const d = Math.hypot(x - w / 2, y - h / 2) / diag;
      return Math.max(0, Math.min(1, (d - 0.2) / 0.62));
    };

    const drawGalaxy = (t: number) => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih || !octx) return;

      // Без апскейла: ширина в device-пикселях не больше натуральной → резкость сохраняется.
      const dw = Math.min(w * 0.95, iw / dpr);
      const dh = (ih / iw) * dw;

      // По центру по горизонтали; верх фото у верхнего края, поднято на ~1,5см (57px).
      const gx = w / 2 + (reduce ? 0 : Math.sin(t * 0.00003) * w * 0.008);
      const gy = dh / 2 + h * 0.02 - 57;

      // Рисуем фото на офскрин, эллиптической маской делаем края прозрачными → плавный слив.
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, w, h);
      octx.globalCompositeOperation = 'source-over';
      octx.globalAlpha = 0.4; // приглушено, чтобы читалось как фон и не перетягивало внимание
      octx.drawImage(img, gx - dw / 2, gy - dh / 2, dw, dh);
      octx.globalAlpha = 1;

      // Эллипс по форме фото с очень длинным градиентом — края растворяются полностью.
      octx.globalCompositeOperation = 'destination-in';
      octx.save();
      octx.translate(gx, gy);
      octx.scale(1, dh / dw);
      const fr = dw * 0.55;
      const m = octx.createRadialGradient(0, 0, 0, 0, 0, fr);
      m.addColorStop(0, 'rgba(0,0,0,1)');
      m.addColorStop(0.2, 'rgba(0,0,0,0.92)');
      m.addColorStop(0.45, 'rgba(0,0,0,0.6)');
      m.addColorStop(0.7, 'rgba(0,0,0,0.28)');
      m.addColorStop(0.88, 'rgba(0,0,0,0.08)');
      m.addColorStop(1, 'rgba(0,0,0,0)');
      octx.fillStyle = m;
      octx.fillRect(-fr * 2, -fr * 2, fr * 4, fr * 4);
      octx.restore();
      octx.globalCompositeOperation = 'source-over';

      ctx.drawImage(oc, 0, 0, w, h);
    };

    const render = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, w, h);
      if (imgReady) drawGalaxy(t);

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
        const tw = reduce ? 1 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.001 * star.sp + star.ph));
        const a = star.a * tw * edge(star.x, star.y);
        if (a <= 0.012) continue;
        ctx.fillStyle = rgba(star.c, a);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Падающие звёзды — только в верхней полосе (не на центральный текст), примерно раз в 10 сек.
      if (!reduce) {
        if (!shoot && t >= nextShoot) {
          const fromLeft = Math.random() < 0.5;
          const y0 = rand(h * 0.05, h * 0.18);
          const x0 = fromLeft ? rand(-w * 0.05, w * 0.15) : rand(w * 0.85, w * 1.05);
          const dx = (fromLeft ? 1 : -1) * w * rand(0.4, 0.65);
          const dy = h * rand(0.04, 0.1);
          const len = Math.hypot(dx, dy) || 1;
          shoot = {
            t0: t,
            dur: rand(700, 1000),
            x0,
            y0,
            dx,
            dy,
            ux: dx / len,
            uy: dy / len,
            tail: rand(90, 150),
          };
        }
        if (shoot) {
          const lt = (t - shoot.t0) / shoot.dur;
          if (lt >= 1) {
            shoot = null;
            nextShoot = t + rand(8000, 12000);
          } else {
            const px = shoot.x0 + shoot.dx * lt;
            const py = shoot.y0 + shoot.dy * lt;
            const env = Math.sin(Math.PI * lt);
            const tx = px - shoot.ux * shoot.tail;
            const ty = py - shoot.uy * shoot.tail;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h * 0.34); // страховка: ничего ниже верхней полосы
            ctx.clip();
            const g = ctx.createLinearGradient(tx, ty, px, py);
            g.addColorStop(0, 'rgba(255,255,255,0)');
            g.addColorStop(1, rgba('#ffffff', 0.9 * env));
            ctx.strokeStyle = g;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.fillStyle = rgba('#ffffff', env);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    };

    let raf = 0;
    if (reduce) {
      if (imgReady) render(0);
      else img.addEventListener('load', () => render(0), { once: true });
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
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}

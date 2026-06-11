import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * Маленькие тёплые светлячки, тихо летающие в пределах контейнера. Декоративный слой —
 * абсолютно позиционируется в relative-контейнере и заполняет его овалом (шире, чем выше).
 * Позиции и дрейф детерминированы по индексу (без random — чтобы не ломать SSR-гидрацию).
 */

const COUNT = 14;
const RX = 44; // горизонтальный радиус облака, % (шире)
const RY = 32; // вертикальный радиус, % (приплюснуто сверху и снизу)

const FIREFLIES = Array.from({ length: COUNT }, (_, i) => {
  const angle = (Math.PI * 2 * i) / COUNT + i * 0.6;
  const rf = 0.32 + (((i * 5) % 4) / 3) * 0.66; // доля радиуса 0.32..0.98
  return {
    xPct: 50 + Math.cos(angle) * rf * RX,
    yPct: 50 + Math.sin(angle) * rf * RY,
    dx: Math.cos(angle + 1.3) * (6 + (i % 3) * 4),
    dy: Math.sin(angle + 2.1) * (4 + (i % 2) * 4),
    size: 2.5 + (i % 3),
    duration: 5 + (i % 4),
    delay: i * 0.5,
  };
});

export function Fireflies({
  className,
  sizeScale = 1,
}: {
  className?: string;
  sizeScale?: number;
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              left: `${f.xPct}%`,
              top: `${f.yPct}%`,
              width: `${f.size * sizeScale}px`,
              height: `${f.size * sizeScale}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              '--fx': `${f.dx}px`,
              '--fy': `${f.dy}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

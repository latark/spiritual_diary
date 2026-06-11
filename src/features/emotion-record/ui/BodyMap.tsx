'use client';

import { useId, useState, type KeyboardEvent } from 'react';

import { BODY_PATH, BODY_VIEW, BODY_ZONES, BODY_ZONE_BY_ID } from '../model/body-zones';
import type { Valence } from '../model/valence';

function buzz(ms = 8): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ms);
  }
}

/** Путь шипастой «колючки» (тёмная, негатив). */
function thornPath(cx: number, cy: number): string {
  const spikes = 7;
  const ro = 9;
  const ri = 3;
  let d = '';
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const r = i % 2 === 0 ? ro : ri;
    d += `${i === 0 ? 'M' : 'L'} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
  }
  return `${d}Z`;
}

function Firefly({ x, y }: { x: number; y: number }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={15} fill="#ffe9a8" opacity={0.14} />
      <circle cx={x} cy={y} r={7} fill="#fff0b8" opacity={0.45} />
      <circle cx={x} cy={y} r={3} fill="#fff7da" />
    </g>
  );
}

function Thorn({ x, y }: { x: number; y: number }) {
  return (
    <g pointerEvents="none">
      <path
        d={thornPath(x, y)}
        fill="#0c0c15"
        stroke="rgba(232,226,248,0.42)"
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <circle cx={x} cy={y} r={1.5} fill="#3a2230" />
    </g>
  );
}

export function BodyMap({
  valence,
  value,
  onChange,
}: {
  valence: Valence;
  value: string[];
  onChange: (zones: string[]) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const filterId = useId();

  function toggle(id: string): void {
    buzz(6);
    onChange(value.includes(id) ? value.filter((z) => z !== id) : [...value, id]);
  }

  const selectedLabels = value
    .map((id) => BODY_ZONE_BY_ID[id]?.label)
    .filter((l): l is string => Boolean(l));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full max-w-[205px]"
        style={{ aspectRatio: `${BODY_VIEW.w} / ${BODY_VIEW.h}` }}
      >
        <svg
          viewBox={`0 0 ${BODY_VIEW.w} ${BODY_VIEW.h}`}
          className="h-full w-full"
          role="group"
          aria-label="Силуэт тела: выбери, где это откликается"
        >
          <defs>
            <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.3" />
            </filter>
          </defs>

          {/* силуэт: мягкое свечение + чёткий тонкий контур */}
          <path
            d={BODY_PATH}
            fill="none"
            stroke="#F2EDFF"
            strokeWidth={2.4}
            strokeOpacity={0.85}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
          <path
            d={BODY_PATH}
            fill="none"
            stroke="#F2EDFF"
            strokeWidth={1}
            strokeOpacity={0.55}
            strokeLinejoin="round"
          />

          {/* подсветка зоны под курсором (подсказка тапа) */}
          {hover && !value.includes(hover) && BODY_ZONE_BY_ID[hover] && (
            <ellipse
              cx={BODY_ZONE_BY_ID[hover].anchor[0]}
              cy={BODY_ZONE_BY_ID[hover].anchor[1]}
              rx={BODY_ZONE_BY_ID[hover].rx}
              ry={BODY_ZONE_BY_ID[hover].ry}
              fill="rgba(212,175,55,0.06)"
              stroke="rgba(212,175,55,0.35)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}

          {/* тап-зоны (прозрачные) */}
          {BODY_ZONES.map((z) => {
            const selected = value.includes(z.id);
            return (
              <ellipse
                key={z.id}
                cx={z.anchor[0]}
                cy={z.anchor[1]}
                rx={z.rx}
                ry={z.ry}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={z.label}
                aria-pressed={selected}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() => toggle(z.id)}
                onMouseEnter={() => setHover(z.id)}
                onMouseLeave={() => setHover((h) => (h === z.id ? null : h))}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(z.id);
                  }
                }}
              />
            );
          })}

          {/* маркеры выбранных зон */}
          {value.map((id) => {
            const z = BODY_ZONE_BY_ID[id];
            if (!z) return null;
            return valence === 'positive' ? (
              <Firefly key={id} x={z.anchor[0]} y={z.anchor[1]} />
            ) : (
              <Thorn key={id} x={z.anchor[0]} y={z.anchor[1]} />
            );
          })}
        </svg>
      </div>

      <p className="text-ink-muted min-h-[1.5rem] max-w-xs text-center text-sm">
        {selectedLabels.length > 0
          ? selectedLabels.join(' · ')
          : 'коснись тех мест, где это сейчас живёт в теле'}
      </p>
    </div>
  );
}

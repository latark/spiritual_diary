'use client';

import { useMemo, useState } from 'react';

import { CHAKRAS, chakraStateLabel, type ChakraProfile } from '@/shared/content/chakras';
import { cn } from '@/shared/lib/cn';

import { type EnergyEntry } from '../model/energy';
import { computeWindow, nowMs, PERIODS } from '../model/series';

/** Отступ от краёв дорожки (в %), чтобы точка у самого края не обрезалась. */
const EDGE_PAD = 5;

const fmtDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const fmtDateYear = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const clamp = (v: number): number => Math.max(0, Math.min(100, v));

/** Уровень 0..100 → позиция на дорожке в % (с отступами от краёв). */
function pos(level: number): number {
  return EDGE_PAD + (clamp(level) / 100) * (100 - 2 * EDGE_PAD);
}

/** Диаметр точки чакры, px. Одинаковый у всех — положение, а не размер, несёт смысл. */
const DOT = 16;

/**
 * Дорожка одной чакры на шкале «покой ↔ поток» — оба края равноценны, без оценки. Точка стоит
 * на текущем положении (свечение у всех одинаково мягкое — низкое значение не выглядит «тусклее»).
 * Если за период положение сдвинулось — от прежнего места (тихая метка) к нынешнему тянется
 * спокойный соединитель, без подсветки направления. После теста (записей нет) — просто точка.
 */
function ChakraLevel({ start, end, color }: { start: number; end: number; color: string }) {
  const startX = pos(start);
  const endX = pos(end);
  const moved = Math.abs(end - start) >= 1;

  return (
    <div className="relative h-3.5 w-full">
      {/* Дорожка — ровная, без градиента «меньше → больше» */}
      <div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full"
        style={{ backgroundColor: `${color}2e` }}
      />

      {/* Движение за период — спокойный соединитель прежнего и нынешнего положения */}
      {moved && (
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{
            left: `${Math.min(startX, endX)}%`,
            width: `${Math.abs(endX - startX)}%`,
            backgroundColor: color,
            opacity: 0.5,
          }}
        />
      )}

      {/* Прежнее положение — тихая метка, только если был сдвиг */}
      {moved && (
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${startX}%`, backgroundColor: color, opacity: 0.3 }}
        />
      )}

      {/* Текущее положение — точка с одинаково мягким свечением у всех чакр */}
      <span
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{
          left: `${endX}%`,
          width: DOT,
          height: DOT,
          backgroundColor: color,
          boxShadow: `0 0 10px -1px ${color}`,
        }}
      />
    </div>
  );
}

/**
 * Карта чакр на абсолютной шкале «слабее → ярче». Точка каждой чакры стоит на своём уровне
 * (отправная точка теста + влияние записей), а переключатель окна (неделя/месяц/3 мес/год) и
 * навигация ← → показывают, как уровень двигался за период. Без чисел и процентов — положение
 * и свечение несут смысл сами.
 */
export function EnergyMap({
  initial,
  entries,
}: {
  initial: ChakraProfile;
  entries: EnergyEntry[];
}) {
  const [periodIdx, setPeriodIdx] = useState(1); // по умолчанию «Месяц»
  const [offset, setOffset] = useState(0); // 0 — текущее окно, дальше — назад
  const [now] = useState(nowMs);

  const period = PERIODS[periodIdx] ?? PERIODS[1];
  const win = useMemo(
    () => computeWindow(initial, entries, period, offset, now),
    [initial, entries, period, offset, now],
  );

  const fmt = period.days >= 60 ? fmtDateYear : fmtDate;
  const rangeLabel = `${fmt.format(win.from)} – ${fmt.format(win.to)}`;

  // Сразу после теста (записей нет) важно сказать, что точки не застыли — карта оживёт.
  const subtitle =
    entries.length === 0
      ? 'Это твоя отправная точка. С каждой записью в дневнике точки будут смещаться.'
      : 'Семь твоих центров — точки смещаются с каждой новой записью.';

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-ink text-2xl">Твоя карта чакр</h2>
        <p className="text-ink-muted text-sm leading-relaxed">{subtitle}</p>
      </header>

      {/* Окно */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p, i) => {
          const active = i === periodIdx;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPeriodIdx(i);
                setOffset(0);
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs transition-shadow duration-200',
                active
                  ? 'bg-gold text-canvas shadow-glow'
                  : 'bg-surface-raised text-ink-muted hover:text-ink',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Навигация по периодам */}
      <div className="text-ink-muted flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          aria-label="Предыдущий период"
          className="hover:text-gold rounded-full px-2 py-1 transition-colors duration-200"
        >
          ←
        </button>
        <span className="text-ink-muted/80 text-xs">{rangeLabel}</span>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Следующий период"
          className="hover:text-gold rounded-full px-2 py-1 transition-colors duration-200 disabled:opacity-30"
        >
          →
        </button>
      </div>

      {/* Края шкалы — равноценные состояния, без оценки */}
      <div className="text-ink-muted/45 flex items-center justify-between text-[11px]">
        <span>покой</span>
        <span>поток</span>
      </div>

      {/* Чакры на абсолютной шкале */}
      <div className="flex flex-col gap-3.5">
        {CHAKRAS.map((chakra) => {
          const levels = win.series[chakra.id];
          const start = levels.at(0) ?? 0;
          const end = levels.at(-1) ?? 0;
          return (
            <div key={chakra.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: chakra.color,
                    boxShadow: `0 0 8px -1px ${chakra.color}`,
                  }}
                />
                <span className="text-ink truncate text-sm">{chakra.name}</span>
                <span className="text-ink-muted/70 ml-auto text-xs">{chakraStateLabel(end)}</span>
              </div>
              <ChakraLevel start={start} end={end} color={chakra.color} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

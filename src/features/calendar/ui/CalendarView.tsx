'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { ROUTES } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/cn';

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

// Родительный падеж для подписи выбранного дня («3 июня»).
const MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

interface Cell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  weekend: boolean;
}

/**
 * Календарь-история. Пока без данных записей — только визуал в космо-эзотерическом стиле.
 * 6×7 сетка, неделя с понедельника. «Сегодня» — золотой ореол; будущие дни приглушены.
 */
export function CalendarView() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [selected, setSelected] = useState<Date | null>(null);

  const cells = useMemo<Cell[]>(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // Пн = 0
    const start = new Date(view.y, view.m, 1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return {
        date,
        inMonth: date.getMonth() === view.m,
        isToday: sameDay(date, today),
        isFuture: date.getTime() > today.getTime(),
        weekend: (date.getDay() + 6) % 7 >= 5,
      };
    });
  }, [view, today]);

  const go = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const goToday = () => {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    setSelected(today);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Панель календаря — «стекло» поверх космоса */}
      <section className="ring-gold/12 shadow-glow-soft animate-fade-up bg-surface/40 relative overflow-hidden rounded-3xl p-4 ring-1 backdrop-blur-md sm:p-6">
        {/* мягкая внутренняя туманность */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 50% at 50% 0%, rgba(155,126,189,0.10), transparent 70%), radial-gradient(60% 45% at 50% 100%, rgba(212,175,55,0.06), transparent 70%)',
          }}
        />

        {/* Шапка месяца */}
        <header className="relative mb-5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-ink text-2xl sm:text-3xl">{MONTHS[view.m]}</h1>
            <span className="text-ink-muted font-display text-xl">{view.y}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Предыдущий месяц"
              onClick={() => go(-1)}
              className="text-ink-muted hover:text-gold hover:bg-surface-raised/60 grid size-9 place-items-center rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="text-ink-muted hover:text-gold hover:bg-surface-raised/60 rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
            >
              Сегодня
            </button>
            <button
              type="button"
              aria-label="Следующий месяц"
              onClick={() => go(1)}
              className="text-ink-muted hover:text-gold hover:bg-surface-raised/60 grid size-9 place-items-center rounded-full transition-colors duration-200"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Дни недели */}
        <div className="relative mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={cn(
                'text-center text-[11px] font-medium tracking-[0.08em] uppercase',
                i >= 5 ? 'text-gold-soft/55' : 'text-ink-muted/70',
              )}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Сетка дней */}
        <div className="relative grid grid-cols-7 gap-1.5">
          {cells.map((c) => {
            const isSel = selected && sameDay(c.date, selected);
            return (
              <button
                key={c.date.toISOString()}
                type="button"
                onClick={() => setSelected(c.date)}
                className={cn(
                  'group relative grid aspect-square place-items-center rounded-2xl text-sm transition-all duration-200',
                  'focus-visible:outline-none',
                  c.inMonth ? 'text-ink' : 'text-ink-muted/30',
                  !isSel && 'hover:bg-surface-raised/50',
                  c.weekend && c.inMonth && !c.isToday && 'text-gold-soft/85',
                  c.isToday && 'text-gold font-semibold',
                  isSel && 'bg-surface-raised/70',
                )}
                style={
                  isSel && !c.isToday
                    ? {
                        boxShadow:
                          '0 0 0 1px color-mix(in oklab, var(--color-violet) 60%, transparent)',
                      }
                    : undefined
                }
              >
                {/* ореол «сегодня» */}
                {c.isToday && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      boxShadow:
                        '0 0 0 1px color-mix(in oklab, var(--color-gold) 55%, transparent), 0 0 18px -2px color-mix(in oklab, var(--color-gold) 50%, transparent)',
                    }}
                  />
                )}
                <span className="relative">{c.date.getDate()}</span>
                {/* зарезервированное место под индикаторы записей (появятся позже) */}
                <span aria-hidden className="absolute bottom-1.5 flex h-1 items-center gap-0.5" />
              </button>
            );
          })}
        </div>

        {/* Легенда вибраций — что появится на днях */}
        <div className="text-ink-muted/70 relative mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px]">
          <span className="text-ink-muted/50">вибрация дня:</span>
          {[
            ['bg-vibe-low', 'низкая'],
            ['bg-vibe-mid', 'средняя'],
            ['bg-vibe-high', 'высокая'],
            ['bg-vibe-transcendent', 'высшая'],
          ].map(([dot, label]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={cn('inline-block size-2 rounded-full', dot)} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Панель выбранного дня (визуал-заглушка, без данных) */}
      <aside className="animate-fade-up">
        <div className="ring-gold/12 bg-surface/40 sticky top-4 rounded-3xl p-5 ring-1 backdrop-blur-md">
          {selected ? (
            <>
              <p className="text-gold-soft/70 text-xs tracking-[0.12em] uppercase">
                {WEEKDAYS[(selected.getDay() + 6) % 7]}
              </p>
              <h2 className="font-display text-ink mt-1 text-2xl">
                {selected.getDate()} {MONTHS_GEN[selected.getMonth()]}
              </h2>
              <div className="bg-line/60 my-4 h-px w-full" />
              <p className="text-ink-muted text-sm leading-relaxed">
                Записей пока нет. Здесь появятся эмоции этого дня — с цветом, оттенком и осознанием.
              </p>
              <Link
                href={ROUTES.record}
                className="bg-gold/90 text-canvas hover:shadow-glow mt-5 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-shadow duration-300"
              >
                <Sparkles className="size-4" strokeWidth={1.75} />
                Записать эмоцию
              </Link>
            </>
          ) : (
            <div className="text-ink-muted/80 flex flex-col items-center py-6 text-center">
              <div
                aria-hidden
                className="mb-3 grid size-12 place-items-center rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in oklab, var(--color-gold) 30%, transparent), transparent 70%)',
                }}
              >
                <Sparkles className="text-gold-soft size-5" strokeWidth={1.5} />
              </div>
              <p className="text-sm leading-relaxed">
                Выбери день, чтобы увидеть его эмоции и осознания.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

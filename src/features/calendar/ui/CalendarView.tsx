'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import {
  ReflectionOverlay,
  causeLabel,
  thoughtLabel,
  type EmotionEntry,
} from '@/entities/emotion-entry';
import { ROUTES } from '@/shared/config/navigation';
import { familyValence } from '@/shared/content/valence';
import { aggregateVibration, VIBE_LEVELS, VIBE_META } from '@/shared/content/vibration';
import { cn } from '@/shared/lib/cn';

const entryVibeItems = (entries: EmotionEntry[]) =>
  entries.map((e) => ({ familyId: e.familyId, intensity: e.intensity }));

import { getMonthEntriesAction } from '../model/get-month-entries-action';

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

const monthKey = (y: number, m: number) => `${y}-${m}`;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

interface Cell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  weekend: boolean;
}

/** Запись дня в боковой панели: компактно, с раскрытием по тапу. «Память» — хранилище
 *  (read-only): внутри видно причину/мысль/инсайт, а «осмыслить» открывает общий экран
 *  осмысления (ReflectionOverlay) на этой записи, не уводя со страницы. */
function DayEntryRow({
  entry,
  open,
  onToggle,
}: {
  entry: EmotionEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const positive = familyValence(entry.familyId) === 'positive';
  const cause = causeLabel(entry);
  const thought = thoughtLabel(entry);
  // Инсайт держим в локальном состоянии: после записи показываем сразу, не дожидаясь
  // обновления серверного кэша месяца.
  const [awareness, setAwareness] = useState<string | null>(entry.awareness);
  const [editing, setEditing] = useState(false);

  return (
    <li data-entry-id={entry.id} className="bg-surface-raised/60 rounded-xl p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-2.5 text-left"
      >
        <ChevronRight
          aria-hidden
          strokeWidth={2}
          className={cn(
            'size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-gentle)]',
            open && 'rotate-90',
          )}
          style={{
            color: entry.emotionColor,
            filter: positive ? `drop-shadow(0 0 5px ${entry.emotionColor})` : undefined,
          }}
        />
        <span className="text-ink text-base">{entry.emotionName}</span>
        <span
          className="ml-auto flex items-center gap-1"
          aria-label={`сила ${entry.intensity} из 5`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="size-3 rounded-full"
              style={{
                backgroundColor: entry.emotionColor,
                opacity: n <= entry.intensity ? 0.9 : 0.16,
              }}
            />
          ))}
        </span>
      </button>

      {/* Раскрытие — плавное «дыхание» высоты (grid-rows 0fr→1fr), не мгновенный скачок.
          reduced-motion → мгновенно. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-[350ms] ease-[var(--ease-gentle)] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div
          className={cn(
            'overflow-hidden transition-opacity duration-300 ease-[var(--ease-gentle)] motion-reduce:transition-none',
            open ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="mt-2.5 space-y-2 pl-6">
            {cause && (
              <p className="text-ink-muted text-sm leading-relaxed">
                <span className="text-ink-muted/45">причина — </span>
                {cause}
              </p>
            )}
            {thought && (
              <p className="text-ink-muted text-sm leading-relaxed">
                <span className="text-ink-muted/45">мысль — </span>«{thought}»
              </p>
            )}
            {awareness ? (
              <p className="text-ink/85 text-sm leading-relaxed whitespace-pre-line">
                <span className="text-gold/60">инсайт — </span>
                {awareness}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-gold/70 hover:text-gold text-sm transition-colors duration-200"
              >
                осмыслить
              </button>
            )}

            {editing && (
              <ReflectionOverlay
                entry={entry}
                onSaved={(text) => {
                  setAwareness(text);
                  setEditing(false);
                }}
                onClose={() => setEditing(false)}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Сколько лет назад можно пролистать в пикере — достаточно для истории дневника. */
const PICKER_MIN_YEAR_BACK = 10;

/**
 * Поповер выбора месяца и года: строка года со стрелками + сетка 12 месяцев. Будущие месяцы
 * приглушены и недоступны. Закрытие — по фону или Escape. Год держим в локальном состоянии,
 * чтобы можно было сменить год и только потом выбрать месяц.
 */
function MonthYearPicker({
  year,
  month,
  today,
  onPick,
  onClose,
}: {
  year: number;
  month: number;
  today: Date;
  onPick: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const [py, setPy] = useState(year);
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  const canPrevYear = py > thisYear - PICKER_MIN_YEAR_BACK;
  const canNextYear = py < thisYear;
  const isFuture = (m: number) => py > thisYear || (py === thisYear && m > thisMonth);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <button
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
      />
      <div
        role="dialog"
        aria-label="Выбор месяца и года"
        className="ring-gold/15 shadow-glow-soft bg-surface/95 absolute top-full left-0 z-50 mt-2 w-[280px] rounded-2xl p-3 ring-1 backdrop-blur-md"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Предыдущий год"
            disabled={!canPrevYear}
            onClick={() => setPy((y) => y - 1)}
            className="text-ink-muted hover:text-gold grid size-8 place-items-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <span className="font-display text-ink text-lg">{py}</span>
          <button
            type="button"
            aria-label="Следующий год"
            disabled={!canNextYear}
            onClick={() => setPy((y) => y + 1)}
            className="text-ink-muted hover:text-gold grid size-8 place-items-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.map((name, m) => {
            const disabled = isFuture(m);
            const active = py === year && m === month;
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onPick(py, m)}
                className={cn(
                  'rounded-lg py-2 text-sm transition-colors duration-200',
                  active
                    ? 'bg-gold text-canvas'
                    : disabled
                      ? 'text-ink-muted/25'
                      : 'text-ink-muted hover:text-gold hover:bg-surface-raised/60',
                )}
              >
                {name.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * Календарь-история. Записи месяца грузятся на сервере (стартовый месяц) и догружаются
 * при навигации server action'ом. «Сегодня» — золотой ореол; будущие дни приглушены;
 * на днях с записями — цветные огоньки эмоций, в панели дня — список с раскрытием.
 */
export function CalendarView({
  initialYear,
  initialMonth,
  initialEntries,
}: {
  initialYear: number;
  initialMonth: number;
  initialEntries: EmotionEntry[];
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  // Текущий месяц — по таймзоне клиента (сервер для initial мог быть в другой TZ у границы суток).
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  // Всегда есть выбранный день: на старте — сегодня (placeholder не показываем).
  const [selected, setSelected] = useState<Date>(() => today);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  // Якорь стабилизации прокрутки: id и положение в окне той строки, по которой тапнули.
  const anchorRef = useRef<{ id: string; top: number } | null>(null);

  // Раскрывая/сворачивая запись, держим саму тапнутую строку на месте: пока высоты
  // плавно меняются, докручиваем окно так, чтобы её верх оставался под пальцем.
  const toggleEntry = (id: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-entry-id="${id}"]`);
    anchorRef.current = el ? { id, top: el.getBoundingClientRect().top } : null;
    setOpenEntryId((cur) => (cur === id ? null : id));
  };

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURATION = 380; // чуть длиннее анимации высоты (350ms)
    let raf = 0;
    let startTs: number | null = null;
    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const el = listRef.current?.querySelector<HTMLElement>(`[data-entry-id="${anchor.id}"]`);
      if (el) {
        const delta = el.getBoundingClientRect().top - anchor.top;
        if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
      }
      if (!reduce && now - startTs < DURATION) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [openEntryId]);
  const [cache, setCache] = useState<Record<string, EmotionEntry[]>>({
    [monthKey(initialYear, initialMonth)]: initialEntries,
  });
  const [, startTransition] = useTransition();

  const loadMonth = (y: number, m: number) => {
    const key = monthKey(y, m);
    if (cache[key]) return;
    startTransition(async () => {
      const entries = await getMonthEntriesAction(y, m);
      setCache((c) => (c[key] ? c : { ...c, [key]: entries }));
    });
  };

  // Если клиентский «текущий месяц» разошёлся с серверным (граница суток) — догружаем его.
  useEffect(() => {
    loadMonth(view.y, view.m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const byDay = useMemo<Map<string, EmotionEntry[]>>(() => {
    const map = new Map<string, EmotionEntry[]>();
    for (const entry of cache[monthKey(view.y, view.m)] ?? []) {
      const key = dayKey(new Date(entry.createdAt));
      const list = map.get(key);
      if (list) list.push(entry);
      else map.set(key, [entry]);
    }
    return map;
  }, [cache, view]);

  // Переход к конкретному месяцу. В новом месяце выбираем осмысленный день: сегодня, если
  // месяц текущий, иначе 1-е.
  const goTo = (y: number, m: number) => {
    setView({ y, m });
    const isCurrentMonth = y === today.getFullYear() && m === today.getMonth();
    setSelected(isCurrentMonth ? today : new Date(y, m, 1));
    loadMonth(y, m);
  };
  const go = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    goTo(d.getFullYear(), d.getMonth());
  };
  const goToday = () => goTo(today.getFullYear(), today.getMonth());

  const selectedEntries = byDay.get(dayKey(selected)) ?? [];
  const selectedVibe = aggregateVibration(entryVibeItems(selectedEntries));

  // Запись всегда ложится в выбранный день: сегодня — обычная запись «сейчас», прошлый день —
  // бэкдейтинг через ?date (created_at ставится на полдень того дня в save-action).
  const isTodaySelected = sameDay(selected, today);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const recordHref = isTodaySelected
    ? ROUTES.record
    : `${ROUTES.record}?date=${selected.getFullYear()}-${pad2(selected.getMonth() + 1)}-${pad2(selected.getDate())}`;

  // Будущие месяцы ещё не настали — листать вперёд за текущий месяц нельзя.
  const canGoNext =
    view.y < today.getFullYear() || (view.y === today.getFullYear() && view.m < today.getMonth());

  return (
    <div className="flex flex-col items-center gap-5 lg:min-h-0 lg:flex-1 lg:flex-row lg:items-stretch lg:justify-center">
      {/* Панель календаря — «стекло» поверх космоса */}
      <section className="ring-gold/12 shadow-glow-soft animate-fade-up bg-surface/40 relative flex w-full max-w-[560px] flex-col overflow-hidden rounded-3xl p-3 ring-1 backdrop-blur-md sm:p-5 lg:max-w-[760px] lg:flex-1">
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
        <header className="relative mb-3 flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
              className="group hover:text-gold flex items-baseline gap-2 rounded-lg transition-colors duration-200"
            >
              <span className="font-display text-ink group-hover:text-gold text-2xl transition-colors duration-200 sm:text-3xl">
                {MONTHS[view.m]}
              </span>
              <span className="text-ink-muted font-display text-xl">{view.y}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'text-ink-muted/70 size-4 self-center transition-transform duration-200',
                  pickerOpen && 'rotate-180',
                )}
                strokeWidth={1.75}
              />
            </button>
            {pickerOpen && (
              <MonthYearPicker
                year={view.y}
                month={view.m}
                today={today}
                onClose={() => setPickerOpen(false)}
                onPick={(y, m) => {
                  goTo(y, m);
                  setPickerOpen(false);
                }}
              />
            )}
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
              disabled={!canGoNext}
              className="text-ink-muted hover:text-gold hover:bg-surface-raised/60 grid size-9 place-items-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Дни недели */}
        <div className="relative mb-1.5 grid grid-cols-7 gap-1">
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

        {/* Сетка дней — на десктопе тянется на всю высоту панели (6 строк) */}
        <div className="relative grid grid-cols-7 gap-1 lg:min-h-0 lg:flex-1 lg:grid-rows-6">
          {cells.map((c) => {
            const isSel = selected && sameDay(c.date, selected);
            const dayEntries = c.inMonth ? (byDay.get(dayKey(c.date)) ?? []) : [];
            const cellVibe = aggregateVibration(entryVibeItems(dayEntries));
            return (
              <button
                key={c.date.toISOString()}
                type="button"
                onClick={() => setSelected(c.date)}
                disabled={c.isFuture}
                className={cn(
                  'group relative grid aspect-square place-items-center rounded-2xl text-sm transition-all duration-200 lg:aspect-auto lg:min-h-0',
                  'focus-visible:outline-none disabled:cursor-default',
                  c.isFuture ? 'text-ink-muted/20' : c.inMonth ? 'text-ink' : 'text-ink-muted/30',
                  !isSel && !c.isFuture && 'hover:bg-surface-raised/50',
                  c.weekend && c.inMonth && !c.isToday && !c.isFuture && 'text-gold-soft/85',
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
                {/* точка цвета вибрации дня — под числом, чуть выше к цифре */}
                {cellVibe && (
                  <span
                    aria-hidden
                    className="absolute bottom-2.5 size-1.5 rounded-full"
                    style={{
                      backgroundColor: `var(${VIBE_META[cellVibe].cssVar})`,
                      boxShadow: `0 0 6px -1px color-mix(in oklab, var(${VIBE_META[cellVibe].cssVar}) 70%, transparent)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Легенда вибраций — что появится на днях */}
        <div className="text-ink-muted/70 relative mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px]">
          <span className="text-ink-muted/50">вибрация дня:</span>
          {VIBE_LEVELS.map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1.5">
              <span className={cn('inline-block size-2 rounded-full', VIBE_META[lvl].token)} />
              {VIBE_META[lvl].label}
            </span>
          ))}
        </div>
      </section>

      {/* Панель выбранного дня */}
      <aside className="animate-fade-up w-full max-w-[560px] lg:w-[340px] lg:max-w-none lg:shrink-0 xl:w-[400px]">
        <div className="ring-gold/12 bg-surface/40 sticky top-4 rounded-3xl p-5 ring-1 backdrop-blur-md lg:static lg:flex lg:h-full lg:flex-col">
          <p className="text-gold-soft/70 text-xs tracking-[0.12em] uppercase">
            {WEEKDAYS[(selected.getDay() + 6) % 7]}
          </p>
          <h2 className="font-display text-ink mt-1 text-2xl">
            {selected.getDate()} {MONTHS_GEN[selected.getMonth()]}
          </h2>
          {selectedVibe && (
            <div className="text-ink-muted/80 mt-2 inline-flex items-center gap-2 text-sm">
              <span
                className="size-3 rounded-full"
                style={{
                  backgroundColor: `var(${VIBE_META[selectedVibe].cssVar})`,
                  boxShadow: `0 0 8px -1px color-mix(in oklab, var(${VIBE_META[selectedVibe].cssVar}) 70%, transparent)`,
                }}
                aria-hidden
              />
              вибрация дня — {VIBE_META[selectedVibe].label}
            </div>
          )}
          <div className="bg-line/60 my-4 h-px w-full" />
          {selectedEntries.length > 0 ? (
            <>
              <ul
                ref={listRef}
                className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
              >
                {selectedEntries.map((entry) => (
                  <DayEntryRow
                    key={entry.id}
                    entry={entry}
                    open={openEntryId === entry.id}
                    onToggle={() => toggleEntry(entry.id)}
                  />
                ))}
              </ul>
              <Link
                href={recordHref}
                className="text-gold/70 hover:text-gold mt-3 flex shrink-0 items-center justify-center gap-2 text-sm transition-colors duration-200"
              >
                <Sparkles className="size-4" strokeWidth={1.75} />
                Записать ещё
              </Link>
            </>
          ) : (
            <>
              <p className="text-ink-muted text-sm leading-relaxed">
                В этот день записей нет. Здесь появятся эмоции дня — с цветом, оттенком и
                осознанием.
              </p>
              <Link
                href={recordHref}
                className="bg-gold/90 text-canvas hover:shadow-glow mt-5 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-shadow duration-300"
              >
                <Sparkles className="size-4" strokeWidth={1.75} />
                Записать эмоцию
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

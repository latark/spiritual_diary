'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * Деликатная подсказка-«?» на концептуальных словах, которые нельзя угадать (тело света,
 * намерение, послание дня, переоценка силы). Не tooltip: главная платформа — мобайл, hover
 * там нет, поэтому это tap-поповер — коснулась, раскрылось; коснулась мимо или Esc — закрылось.
 * Знак тусклый (text-ink-muted/50), разгорается золотом — свечение вместо жёсткой рамки.
 * Ставить скупо: только там, где слово вводит понятие, не на каждой кнопке.
 */
export function Hint({
  children,
  srLabel = 'Подсказка',
}: {
  children: ReactNode;
  srLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative ml-1.5 inline-flex align-middle">
      <button
        type="button"
        aria-label={srLabel}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex size-4 items-center justify-center rounded-full text-[10px] leading-none transition-all duration-300',
          open
            ? 'text-gold shadow-glow-soft ring-gold/50 ring-1'
            : 'text-ink-muted/50 ring-ink-muted/25 hover:text-gold hover:ring-gold/50 ring-1',
        )}
      >
        ?
      </button>

      {open && (
        <span
          id={panelId}
          role="tooltip"
          className="animate-fade-up bg-surface-raised/95 text-ink-muted shadow-glow-soft absolute top-6 left-1/2 z-50 w-max max-w-[min(19rem,78vw)] -translate-x-1/2 rounded-2xl px-4 py-3 text-left text-sm leading-relaxed font-normal tracking-normal backdrop-blur-md"
        >
          {children}
        </span>
      )}
    </span>
  );
}

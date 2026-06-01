import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

import { ROUTES } from '@/shared/config/navigation';

function formatToday(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

/**
 * Минималистичная шапка: только дата и аватар-тотем.
 * Никаких лозунгов — это съедает воздух (UI spec §2).
 */
export function Topbar() {
  return (
    <header className="border-line/40 bg-canvas/70 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md md:px-8">
      <span className="font-display text-ink-muted text-lg capitalize">{formatToday()}</span>

      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.help}
          aria-label="Поддержка"
          className="text-ink-muted hover:text-gold rounded-full p-2 transition-colors duration-300"
        >
          <HelpCircle className="size-5" strokeWidth={1.5} />
        </Link>

        {/* Аватар-тотем (генеративный — заглушка на Phase 1) */}
        <div
          aria-hidden
          className="from-gold-soft via-violet to-canvas shadow-glow-soft size-9 rounded-full bg-gradient-to-br"
        />
      </div>
    </header>
  );
}

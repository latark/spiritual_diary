import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

import { APP } from '@/shared/config/app';
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
      {/* Мобайл: бренд слева (сайдбар скрыт). Десктоп: дата (бренд живёт в сайдбаре). */}
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href={ROUTES.home}
          aria-label={APP.shortName}
          className="flex shrink-0 items-center gap-2 md:hidden"
        >
          <Image
            src="/cassiopeia-logo.png"
            alt=""
            width={560}
            height={560}
            className="size-7 shrink-0"
          />
          <span className="font-display text-ink text-lg">{APP.shortName}</span>
        </Link>
        <span className="font-display text-ink-muted hidden truncate text-lg capitalize md:inline">
          {formatToday()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.help}
          aria-label="Поддержка"
          className="text-ink-muted hover:text-gold rounded-full p-2 transition-colors duration-300"
        >
          <HelpCircle className="size-5" strokeWidth={1.5} />
        </Link>

        {/* Аватар-тотем → «Твой дневник» (аккаунт, поддержка, сеанс). Глобальная точка входа
            на всех экранах вместо отдельной вкладки «Я». Градиент пока генеративная заглушка. */}
        <Link
          href={ROUTES.profile}
          aria-label="Твой дневник"
          className="hover:shadow-glow focus-visible:shadow-glow from-gold-soft via-violet to-canvas shadow-glow-soft block size-9 rounded-full bg-gradient-to-br transition-shadow duration-300"
        />
      </div>
    </header>
  );
}

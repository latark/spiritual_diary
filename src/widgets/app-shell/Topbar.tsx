import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

import { APP } from '@/shared/config/app';
import { ROUTES } from '@/shared/config/navigation';

/**
 * Мобильная шапка: бренд (декоративный, не ссылка — чтобы не казался кликабельным),
 * поддержка и аватар-тотем справа. На десктопе скрыта — там всё живёт в сайдбаре.
 * Без даты и лозунгов (UI spec §2).
 */
export function Topbar() {
  return (
    <header className="border-line/40 bg-canvas/70 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md md:hidden">
      <div className="flex shrink-0 items-center gap-2 select-none">
        <Image
          src="/cassiopeia-logo.png"
          alt=""
          width={560}
          height={560}
          className="size-7 shrink-0"
        />
        <span className="font-display text-ink text-lg">{APP.shortName}</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.help}
          aria-label="Поддержка"
          className="text-ink-muted hover:text-gold rounded-full p-2 transition-colors duration-300"
        >
          <HelpCircle className="size-5" strokeWidth={1.5} />
        </Link>

        {/* Аватар-тотем → «Твой дневник» (аккаунт, поддержка, сеанс). Градиент пока заглушка. */}
        <Link
          href={ROUTES.profile}
          aria-label="Твой дневник"
          className="hover:shadow-glow focus-visible:shadow-glow from-gold-soft via-violet to-canvas shadow-glow-soft block size-9 rounded-full bg-gradient-to-br transition-shadow duration-300"
        />
      </div>
    </header>
  );
}

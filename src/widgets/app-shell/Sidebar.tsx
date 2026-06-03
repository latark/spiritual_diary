'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';

import { APP } from '@/shared/config/app';
import { NAV_ITEMS, ROUTES } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/cn';

function isActive(pathname: string, href: string): boolean {
  return href === ROUTES.home ? pathname === href : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-line/40 bg-surface/40 fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r px-4 py-6 md:flex">
      <Link href={ROUTES.home} className="flex items-center gap-2.5 px-1">
        <Image
          src="/cassiopeia-logo.png"
          alt=""
          width={560}
          height={560}
          className="size-9 shrink-0"
        />
        <span className="font-display text-ink text-xl leading-tight">{APP.name}</span>
      </Link>

      <nav className="mt-10 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="btn-gold mb-2 flex w-full items-center justify-start gap-3 px-4 py-3"
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-300',
                active ? 'bg-surface-raised text-gold' : 'text-ink-muted hover:text-ink',
              )}
            >
              <Icon className="size-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="bg-surface text-ink-muted rounded-lg px-4 py-3 text-sm">
          <span className="text-ink">Бесплатный план</span>
        </div>
        <Link
          href={ROUTES.help}
          className="text-ink-muted hover:text-gold flex items-center gap-2 px-2 text-sm transition-colors duration-300"
        >
          <HelpCircle className="size-4" strokeWidth={1.5} />
          Поддержка
        </Link>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_ITEMS, ROUTES } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/cn';

function isActive(pathname: string, href: string): boolean {
  return href === ROUTES.home ? pathname === href : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-line/40 bg-canvas/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pt-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <li key={item.href} className="-mt-6">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="animate-glow bg-gold text-canvas flex size-14 items-center justify-center rounded-full"
                >
                  <Icon className="size-6" strokeWidth={1.75} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-300',
                  active ? 'text-gold' : 'text-ink-muted',
                )}
              >
                <Icon className="size-6" strokeWidth={1.5} />
                {active && <span className="text-[10px] leading-none">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import type { ReactNode } from 'react';

import { AmbientCosmos } from '@/shared/ui/AmbientCosmos';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Оболочка основного раздела приложения.
 * Мобайл: верхняя шапка + нижний таб-бар.
 * Десктоп: сайдбар слева (240px) + шапка + контент (max-width 1200px).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AmbientCosmos />
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col md:pl-60">
        <Topbar />
        <main className="animate-fade-up mx-auto w-full max-w-[1200px] flex-1 px-4 pt-2 pb-28 md:px-8 md:pb-12">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

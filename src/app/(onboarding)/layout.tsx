import type { ReactNode } from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { getCurrentUser, getProfile } from '@/shared/lib/auth';
import { CosmosBackground } from '@/shared/ui/CosmosBackground';

/**
 * Зона онбординга: без AppShell, центрированная.
 * Не авторизован → на вход. Уже прошёл онбординг → на главную (защита от перезаписи).
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile();

  // TODO(temp): в dev не выкидываем уже прошедших онбординг — чтобы можно было перетестить поток. Вернуть перед релизом.
  if (profile?.onboarding_completed && process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <div className="flex min-h-dvh items-start justify-center px-4 py-10 sm:items-center">
      <CosmosBackground />
      <Image
        src="/cassiopeia-logo.png"
        alt="Кассиопея"
        width={560}
        height={560}
        priority
        className="pointer-events-none fixed top-4 right-4 z-20 h-auto w-24 opacity-70 sm:w-28"
      />
      <div className="animate-fade-up relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

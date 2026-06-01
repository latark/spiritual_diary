import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase';

/**
 * Зона онбординга: без AppShell, центрированная.
 * Не авторизован → на вход. Уже прошёл онбординг → на главную (защита от перезаписи).
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/');
  }

  return (
    <div className="flex min-h-dvh items-start justify-center px-4 py-10 sm:items-center">
      <div className="animate-fade-up w-full max-w-md">{children}</div>
    </div>
  );
}

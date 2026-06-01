import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { APP } from '@/shared/config/app';

/**
 * Оболочка экранов входа/регистрации: без AppShell, центрированная.
 * Уже авторизованного отправляем на главную.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="animate-fade-up flex w-full max-w-sm flex-col gap-8">
        <div className="text-center">
          <h1 className="font-display text-ink text-3xl">{APP.name}</h1>
        </div>
        <div className="bg-surface/60 shadow-glow-soft rounded-2xl p-6">{children}</div>
      </div>
    </div>
  );
}

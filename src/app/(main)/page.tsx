import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { ROUTES } from '@/shared/config/navigation';
import { greeting } from '@/shared/lib/greeting';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let timezone: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', user.id)
      .single();
    timezone = profile?.timezone ?? null;
  }

  return (
    <div className="flex flex-col gap-8 pt-6">
      <div>
        <h1 className="font-display text-ink text-3xl">{greeting(timezone)}</h1>
        <p className="text-ink-muted mt-1">С чего начнём сегодня?</p>
      </div>

      <Link
        href={ROUTES.record}
        className="animate-glow bg-gold text-canvas flex h-20 items-center justify-center gap-3 rounded-2xl text-lg font-medium"
      >
        <Sparkles className="size-6" strokeWidth={1.75} />
        Записать эмоцию
      </Link>
      <p className="font-display text-ink-muted -mt-5 text-center">Что ты сейчас чувствуешь?</p>

      {/* TODO(temp): кнопка для повторного прохождения онбординга при тестировании — удалить перед релизом */}
      <Link
        href={ROUTES.onboarding}
        className="text-ink-muted hover:text-gold mt-4 text-center text-sm underline underline-offset-4 transition-colors duration-200"
      >
        → пройти онбординг заново (temp)
      </Link>
    </div>
  );
}

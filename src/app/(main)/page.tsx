import Link from 'next/link';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { ROUTES } from '@/shared/config/navigation';
import { greeting } from '@/shared/lib/greeting';
import { LightBody } from '@/features/light-body';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let timezone: string | null = null;
  let name: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone, display_name')
      .eq('id', user.id)
      .single();
    timezone = profile?.timezone ?? null;
    name = profile?.display_name ?? null;
  }

  return (
    <div className="flex flex-col gap-8 pt-6">
      <div>
        <h1 className="font-display text-ink text-3xl">{greeting(timezone, name)}</h1>
        <p className="text-ink-muted mt-1">С чего начнём сегодня?</p>
      </div>

      {/* Тело света — центр главной, «висит» в космосе */}
      <LightBody initialStage={1} />

      {/* TODO(temp): кнопка для повторного прохождения онбординга при тестировании — удалить перед релизом */}
      <Link
        href={ROUTES.onboarding}
        className="text-ink-muted hover:text-gold mt-2 text-center text-sm underline underline-offset-4 transition-colors duration-200"
      >
        → пройти онбординг заново (temp)
      </Link>
    </div>
  );
}

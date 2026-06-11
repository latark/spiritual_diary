import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { ROUTES } from '@/shared/config/navigation';
import { PageHeader } from '@/shared/ui/PageHeader';
import { signOutAction } from '@/features/auth';

const sinceFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('profiles').select('display_name, created_at').eq('id', user.id).single()
    : { data: null };

  const name = profile?.display_name ?? null;
  const since = profile?.created_at ? sinceFormat.format(new Date(profile.created_at)) : null;

  return (
    <div className="flex flex-col gap-8 pt-2">
      {/* Экран-аккаунт за иконкой: тотем + связь и сеанс. Намерение живёт на «Доме» рядом с телом света. */}
      <PageHeader title="Твой дневник" />

      {/* Тотем-аура: пока генеративная заглушка-градиент, но уже живая опора экрана. */}
      <section className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden
          className="from-gold-soft via-violet to-canvas shadow-glow-soft size-24 rounded-full bg-gradient-to-br"
        />
        {name ? <p className="font-display text-ink text-2xl">{name}</p> : null}
        {since ? (
          <p className="text-ink-muted/80 text-sm capitalize">ты идёшь этим путём с {since}</p>
        ) : null}
      </section>

      <div className="flex flex-col gap-3">
        <Link
          href={ROUTES.help}
          className="text-ink-muted hover:text-gold flex items-center gap-2.5 text-sm transition-colors duration-300"
        >
          <HelpCircle className="size-4" strokeWidth={1.5} />
          Поддержка
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-ink-muted/70 hover:text-ink text-sm transition-colors duration-300"
          >
            Завершить сеанс
          </button>
        </form>
      </div>
    </div>
  );
}

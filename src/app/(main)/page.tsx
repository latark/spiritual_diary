import Link from 'next/link';

import { computeStage, ripeness, vitality } from '@/entities/light-body';
import { getLightBodyState } from '@/entities/light-body/server';
import { createSupabaseServerClient } from '@/shared/api/supabase';
import { ROUTES } from '@/shared/config/navigation';
import { greeting } from '@/shared/lib/greeting';
import { dayNumber, localDate } from '@/shared/lib/local-date';
import { DailyMessageCard, selectDailyMessage } from '@/features/daily-message';
import { LightBody } from '@/features/light-body';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let timezone: string | null = null;
  let name: string | null = null;
  let intention: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone, display_name, intention_30d')
      .eq('id', user.id)
      .single();
    timezone = profile?.timezone ?? null;
    name = profile?.display_name ?? null;
    intention = profile?.intention_30d ?? null;
  }

  // Состояние тела света: фаза (драйвер — активные дни), готовность к переходу, витальность.
  const lb = user ? await getLightBodyState() : null;
  const today = localDate(timezone);
  const stage = lb?.acknowledgedStage ?? 1;
  const readyStage = computeStage(lb?.activeDays ?? 0);
  // Витальность тускнеет с днями простоя (по локальной дате последней записи), при записи — к 1.
  const daysIdle = lb?.lastActiveDate ? dayNumber(today) - dayNumber(lb.lastActiveDate) : Infinity;
  const lightVitality = vitality(daysIdle);
  // Вызревание показываем только когда переход ещё не доступен (иначе — кнопка).
  const lightRipeness = lb && readyStage === stage ? ripeness(lb.activeDays, stage) : 0;

  const message = user ? selectDailyMessage(user.id, today) : null;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="font-display text-ink text-3xl">{greeting(timezone, name)}</h1>
        <p className="text-ink-muted mt-1">С чего начнём сегодня?</p>
      </div>

      {/* ≥1400px: тело света держит центр (обычный блок, w-full → рамка 330), «послание дня»
          поверх слева (absolute, из потока — не сжимает тело). Уже — стопкой по центру:
          тело света сверху, карта под ним. */}
      <div className="relative flex flex-col items-center gap-8 min-[1400px]:block">
        <LightBody
          stage={stage}
          readyStage={readyStage}
          vitality={lightVitality}
          ripeness={lightRipeness}
        />

        {message ? (
          <div className="min-[1400px]:absolute min-[1400px]:top-1/2 min-[1400px]:left-0 min-[1400px]:-translate-y-1/2">
            <DailyMessageCard message={message} />
          </div>
        ) : null}
      </div>

      {/* Намерение переехало из бывшей вкладки «Я»: тихий якорь «ты сегодня» под телом света. */}
      <section className="bg-surface/40 flex flex-col gap-2 rounded-2xl px-5 py-5">
        <h2 className="text-ink-muted/70 text-xs tracking-wide uppercase">Твоё намерение</h2>
        {intention ? (
          <p className="font-display text-ink text-xl leading-relaxed">{intention}</p>
        ) : (
          <p className="text-ink-muted/80 text-sm leading-relaxed">
            Намерение ещё не названо. Оно проявится, когда ты будешь готова.
          </p>
        )}
      </section>

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

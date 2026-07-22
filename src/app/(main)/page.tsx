import Link from 'next/link';

import { computeStage, ripeness, vitality } from '@/entities/light-body';
import { getLightBodyState } from '@/entities/light-body/server';
import { ROUTES } from '@/shared/config/navigation';
import { getCurrentUser, getProfile } from '@/shared/lib/auth';
import { greeting } from '@/shared/lib/greeting';
import { dayNumber, localDate } from '@/shared/lib/local-date';
import { Hint } from '@/shared/ui/Hint';
import { DailyMessageCard, selectDailyMessage } from '@/features/daily-message';
import { LightBody } from '@/features/light-body';

export default async function HomePage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile() : null;
  const timezone = profile?.timezone ?? null;
  const name = profile?.display_name ?? null;
  const intention = profile?.intention_30d ?? null;

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
  // Первый заход: тела света ещё нет (ни одной записи → 0 очков). Не оставляем экран пустым
  // и не объясняем интерфейс — мягко зовём в первую запись, она и есть онбординг.
  const hasRecords = (lb?.points ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="font-display text-ink text-3xl">{greeting(timezone, name)}</h1>
        <p className="text-ink-muted mt-1">С чего начнём сегодня?</p>
      </div>

      {/* Намерение — тихий якорь «ты сегодня», сразу под приветствием. */}
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

      {hasRecords ? (
        /* ≥1400px: тело света держит центр (обычный блок, w-full → рамка 330), «послание дня»
           поверх слева (absolute, из потока — не сжимает тело). Уже — стопкой по центру:
           тело света сверху, карта под ним. */
        <div className="relative flex flex-col items-center gap-8 min-[1400px]:block">
          <LightBody
            stage={stage}
            readyStage={readyStage}
            vitality={lightVitality}
            ripeness={lightRipeness}
          />

          {message ? (
            <div className="min-[1400px]:absolute min-[1400px]:top-1/2 min-[1400px]:left-0 min-[1400px]:-translate-y-1/2">
              {/* Подпись с подсказкой — только в стопке (мобайл/планшет, основная платформа);
                  на ≥1400px карта выровнена попиксельно с телом света, не трогаем. */}
              <div className="mb-3 flex items-center justify-center gap-0 min-[1400px]:hidden">
                <span className="text-ink-muted/70 text-xs tracking-wide uppercase">
                  Послание дня
                </span>
                <Hint srLabel="О послании дня">
                  Знакомая мысль и её светлая сторона на сегодня, а ниже — чувство, в которое стоит
                  заглянуть. Записывать ничего не нужно: просто понаблюдай за собой.
                </Hint>
              </div>
              <DailyMessageCard message={message} />
            </div>
          ) : null}
        </div>
      ) : (
        <section className="bg-surface/40 flex flex-col items-center gap-6 rounded-[2rem] px-6 py-14 text-center">
          <div className="max-w-sm">
            <h2 className="font-display text-ink text-2xl">Твоё тело света ещё не зажглось</h2>
            <p className="text-ink-muted mt-3 leading-relaxed">
              Оно растёт из чувств, которые ты проживаешь. Начнём с первого?
            </p>
          </div>
          <Link href={ROUTES.record} className="btn-gold h-12 px-7">
            Записать первое чувство
          </Link>
        </section>
      )}
    </div>
  );
}

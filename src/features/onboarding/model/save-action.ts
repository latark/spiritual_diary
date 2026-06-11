'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { classifyCrisis, recordCrisisFlag } from '@/shared/safety';

import { onboardingSchema } from './schema';
import type { OnboardingData } from './types';

export type CompleteResult = { ok: true } | { crisis: true } | { error: string };

export async function completeOnboardingAction(data: OnboardingData): Promise<CompleteResult> {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверь поля' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  // Намерение — свободный текст → crisis-фильтр (§6). При срабатывании острый текст в
  // профиль не пишем, флаг куратору, ведём на экран поддержки. Онбординг при этом
  // завершаем (onboarding_completed = true), чтобы не запереть пользователя в цикле.
  let intention: string | null = parsed.data.intention;
  let crisis = false;
  const c = await classifyCrisis(intention);
  if (c.triggered) {
    await recordCrisisFlag(supabase, user.id, c, 'onboarding_intention');
    intention = null;
    crisis = true;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      birth_date: parsed.data.birthDate,
      birth_time: parsed.data.birthTime,
      birth_location: parsed.data.birthLocation,
      intention_30d: intention,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  return crisis ? { crisis: true } : { ok: true };
}

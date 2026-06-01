'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';

import { onboardingSchema } from './schema';
import type { OnboardingData } from './types';

export type CompleteResult = { ok: true } | { error: string };

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

  const { error } = await supabase
    .from('profiles')
    .update({
      birth_date: parsed.data.birthDate,
      birth_time: parsed.data.birthTime,
      birth_location: parsed.data.birthLocation,
      chakra_profile: parsed.data.chakraProfile,
      intention_30d: parsed.data.intention,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  return { ok: true };
}

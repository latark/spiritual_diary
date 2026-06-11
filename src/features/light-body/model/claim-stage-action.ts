'use server';

import { revalidatePath } from 'next/cache';

import { computeStage } from '@/entities/light-body';
import { createSupabaseServerClient } from '@/shared/api/supabase';

export type ClaimStageResult = { ok: true; stage: number } | { error: string };

/**
 * Церемония перехода: подтверждаем заработанную фазу. Заработанную считаем на сервере из
 * active_days (пороги — единый источник в TS), не доверяя клиенту, и клампим/не понижаем в RPC.
 */
export async function claimLightStageAction(): Promise<ClaimStageResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  const { data } = await supabase
    .from('light_body_state')
    .select('active_days')
    .eq('user_id', user.id)
    .maybeSingle();
  const earned = computeStage(data?.active_days ?? 0);

  const { error } = await supabase.rpc('claim_light_stage', { p_stage: earned });
  if (error) {
    return { error: 'Переход не дался с первого раза. Попробуем ещё раз?' };
  }

  revalidatePath('/');
  return { ok: true, stage: earned };
}

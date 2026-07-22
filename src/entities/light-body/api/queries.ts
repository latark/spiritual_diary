import 'server-only';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { getCurrentUser } from '@/shared/lib/auth';

import type { LightBodyState } from '../model/types';

const DEFAULT_STATE: LightBodyState = {
  points: 0,
  activeDays: 0,
  lastActiveDate: null,
  acknowledgedStage: 1,
};

/**
 * Состояние тела света текущего пользователя. Строки может не быть (ещё ни одной записи) →
 * дефолты (фаза 1, покой). Пишется только через RPC register_light_activity / claim_light_stage.
 */
export async function getLightBodyState(): Promise<LightBodyState> {
  const user = await getCurrentUser();
  if (!user) return DEFAULT_STATE;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('light_body_state')
    .select('points, active_days, last_active_date, acknowledged_stage')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return DEFAULT_STATE;
  return {
    points: data.points,
    activeDays: data.active_days,
    lastActiveDate: data.last_active_date,
    acknowledgedStage: data.acknowledged_stage,
  };
}

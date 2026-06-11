import 'server-only';

import { createSupabaseServerClient } from '@/shared/api/supabase';

/**
 * Момент последней записи пользователя — основа витальности тела света. Берём
 * light_body_state.updated_at (его двигает add_light_point при каждой записи). Строки может
 * не быть (ещё ни одной записи) → null, что трактуется как «покой».
 */
export async function getLightBodyActivity(): Promise<{ lastRecordAt: string | null }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { lastRecordAt: null };

  const { data } = await supabase
    .from('light_body_state')
    .select('updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  return { lastRecordAt: data?.updated_at ?? null };
}

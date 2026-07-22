import 'server-only';

import { createSupabaseServerClient } from '@/shared/api/supabase';

import { weeklyMessageSchema, type LatestWeekly } from './types';

/** Последнее послание текущего пользователя — для показа в «Пути». */
export async function getLatestWeeklyAnalysis(): Promise<LatestWeekly | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('weekly_analyses')
    .select('status, content, created_at, period_start, period_end')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const parsed = data.content ? weeklyMessageSchema.safeParse(data.content) : null;
  return {
    status: data.status,
    message: parsed?.success ? parsed.data : null,
    createdAt: data.created_at,
    periodStart: data.period_start,
    periodEnd: data.period_end,
  };
}

'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/shared/api/supabase';

import { runWeeklyForUser } from './run';
import type { WeeklyResult } from './types';

/** Ручной прогон послания для текущего пользователя (кнопка в «Пути»). */
export async function generateWeeklyAnalysisAction(): Promise<WeeklyResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Сессия истекла — войди заново' };

  const result = await runWeeklyForUser(supabase, user.id);
  revalidatePath('/progress');
  return result;
}

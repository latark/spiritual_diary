'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { classifyCrisis, recordCrisisFlag } from '@/shared/safety';

export type AwarenessCrisisResult = { crisis: boolean };

/**
 * Шаговая проверка свободного текста лестницы проработки (§6). Клиент дублирует быстрый
 * keyword-слой ради мгновенного экрана поддержки, но запись флага куратору и глубокий слой —
 * здесь, авторитетно. Текст НЕ сохраняем: это только сигнал, само осознание в дневник не
 * пишется при срабатывании. Живёт в entities (InsightLadder в этом слайсе; импорт
 * checkCrisisAction из features был бы нарушением FSD). Degrade gracefully: сбой не вешает UI.
 */
export async function checkAwarenessCrisisAction(text: string): Promise<AwarenessCrisisResult> {
  const trimmed = text.trim();
  if (!trimmed) return { crisis: false };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const result = await classifyCrisis(trimmed);
    if (!result.triggered) return { crisis: false };

    if (user) {
      await recordCrisisFlag(supabase, user.id, result, 'record_awareness');
    }
    return { crisis: true };
  } catch (e) {
    console.error('checkAwarenessCrisisAction failed:', e instanceof Error ? e.message : e);
    return { crisis: false };
  }
}

'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { classifyCrisis, recordCrisisFlag, type CrisisSource } from '@/shared/safety';

/**
 * Оба исхода — «успех» с точки зрения контура: `crisis: true` ведёт UI на экран
 * поддержки, `false` — обычный поток. Ошибку наружу не бросаем.
 */
export type CrisisCheckResult = { crisis: boolean };

/**
 * Авторитетная серверная проверка свободного текста (CLAUDE.md §6). Клиент дублирует
 * быстрый keyword-слой ради мгновенного экрана, но источник правды, глубокий слой и
 * запись флага — здесь. При срабатывании ведём к поддержке в любом случае.
 */
export async function checkCrisisAction(
  text: string,
  source: CrisisSource,
): Promise<CrisisCheckResult> {
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
      await recordCrisisFlag(supabase, user.id, result, source);
    }
    return { crisis: true };
  } catch (e) {
    // Степ-проверка лишь ускоряет экран поддержки. Истинная гарантия — финальная проверка
    // в save-action (синхронный keyword, не падает): крайнее состояние не попадёт в БД и
    // там же запишется флаг. Поэтому при сбое здесь degrade gracefully, а не вешаем UI.
    console.error('checkCrisisAction failed:', e instanceof Error ? e.message : e);
    return { crisis: false };
  }
}

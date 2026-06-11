import type { createSupabaseServerClient } from '@/shared/api/supabase';

import type { CrisisClassification } from './classify';

/** Откуда пришёл свободный текст — маппится на crisis_flags.source. */
export type CrisisSource =
  | 'record_cause'
  | 'record_thought'
  | 'record_awareness'
  | 'record_situation'
  | 'onboarding_intention';

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Пишет флаг крайнего состояния для куратора (CLAUDE.md §6). Сам триггернувший текст НЕ
 * сохраняем — только факт, категории и источник (приватность, минимизация ПДн). Лучшее
 * усилие: провал записи не ломает поток пользователю, но логируем — это safety-сигнал.
 *
 * Живёт в shared/safety: переиспользуется несколькими фичами (запись эмоции, осознание
 * на «Пути»). Это обычный серверный модуль, а не 'use server': хелпер принимает
 * Supabase-клиент (несериализуем).
 */
export async function recordCrisisFlag(
  supabase: ServerClient,
  userId: string,
  classification: CrisisClassification,
  source: CrisisSource,
): Promise<void> {
  const { error } = await supabase.from('crisis_flags').insert({
    user_id: userId,
    categories: classification.categories,
    source,
    detected_by: classification.detectedBy,
  });

  if (error) {
    // TODO(F-06): когда подключим Sentry — отправлять сюда. Пока хотя бы в серверный лог.
    console.error('crisis_flag insert failed:', error.message);
  }

  // TODO(crisis алерт, §10 #4): Telegram-уведомление куратору школы — когда определят
  // получателя и в env появятся TELEGRAM_BOT_TOKEN / TELEGRAM_CURATOR_CHAT_ID.
}

'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { classifyCrisis, recordCrisisFlag } from '@/shared/safety';

import { awarenessSchema, type AwarenessInput } from './awareness-schema';

/**
 * Три исхода: `ok` — осознание сохранено; `crisis` — текст задел детектор, осознание
 * НЕ записано, флаг куратору, UI ведёт на экран поддержки; `error` — тёплая ошибка.
 */
export type AddAwarenessResult = { ok: true } | { crisis: true } | { error: string };

/**
 * Дописывает осознание (в UI — «инсайт») к существующей записи (CLAUDE.md §6). Свободный
 * текст обязательно проходит crisis-фильтр ДО записи: при срабатывании острое состояние в
 * дневник не кладём, пишем флаг и ведём к поддержке. RLS (update own) гарантирует, что
 * чужую запись не тронуть. Зовётся и с «Пути» (возврат к чувству), и из «Памяти».
 */
export async function addAwarenessAction(input: AwarenessInput): Promise<AddAwarenessResult> {
  const parsed = awarenessSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверь поле' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  const { entryId, text } = parsed.data;

  const crisis = await classifyCrisis(text);
  if (crisis.triggered) {
    await recordCrisisFlag(supabase, user.id, crisis, 'record_awareness');
    return { crisis: true };
  }

  const { error } = await supabase
    .from('emotion_entries')
    .update({ awareness: text })
    .eq('id', entryId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  // Осознание влияет на «Путь» (выпадает из очереди возврата, входит в ленту «Осознания»)
  // и на «Память» (видно в дне) — обновляем серверный кэш этих экранов.
  revalidatePath('/progress');
  revalidatePath('/calendar');

  return { ok: true };
}

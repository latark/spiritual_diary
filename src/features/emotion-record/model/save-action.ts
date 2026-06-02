'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';

import { emotionEntrySchema, type EmotionEntryInput } from './entry-schema';

export type SaveEntryResult = { ok: true; id: string } | { error: string };

export async function saveEmotionEntryAction(input: EmotionEntryInput): Promise<SaveEntryResult> {
  const parsed = emotionEntrySchema.safeParse(input);
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

  const d = parsed.data;
  const { data, error } = await supabase
    .from('emotion_entries')
    .insert({
      user_id: user.id,
      family_id: d.familyId,
      shade_id: d.shadeId,
      emotion_name: d.emotionName,
      emotion_color: d.emotionColor,
      intensity: d.intensity,
      cause_sphere: d.causeSphere,
      cause_custom: d.causeCustom || null,
      background_thought_id: d.thoughtId,
      background_thought_custom: d.thoughtCustom || null,
      body_zones: d.bodyZones,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  // Сайд-эффект: +1 точка света. Лучшее усилие — не валим сохранение, если не вышло.
  await supabase.rpc('add_light_point');

  return { ok: true, id: data.id };
}

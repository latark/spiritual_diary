'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { classifyCrisis, recordCrisisFlag } from '@/shared/safety';

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

  // Причина теперь выбирается из каталога (сфера + под-область) — не свободный текст,
  // crisis-фильтр ей не нужен. Ситуация (Колонка 1) и фоновая мысль — свободные → финальная
  // сеть §6: триггернувший текст очищаем (в дневник не кладём), запись сохраняем, флаг куратору.
  const causeCustom = d.causeCustom.trim() || null;
  let situation = d.situation.trim() || null;
  let thoughtCustom = d.thoughtCustom.trim() || null;

  if (situation) {
    const c = await classifyCrisis(situation);
    if (c.triggered) {
      await recordCrisisFlag(supabase, user.id, c, 'record_situation');
      situation = null;
    }
  }

  if (thoughtCustom) {
    const c = await classifyCrisis(thoughtCustom);
    if (c.triggered) {
      await recordCrisisFlag(supabase, user.id, c, 'record_thought');
      thoughtCustom = null;
    }
  }

  // Бэкдейтинг из «Памяти»: ставим created_at только для прошедшего момента (будущее игнорим —
  // защита от прямого захода с битым параметром). Иначе — default now() самой БД.
  const recordedAt =
    d.recordedAt && new Date(d.recordedAt).getTime() <= Date.now() ? d.recordedAt : null;

  const { data, error } = await supabase
    .from('emotion_entries')
    .insert({
      user_id: user.id,
      family_id: d.familyId,
      shade_id: d.shadeId,
      emotion_name: d.emotionName,
      emotion_color: d.emotionColor,
      intensity: d.intensity,
      intensity_after: d.intensityAfter,
      situation,
      cause_sphere: d.causeSphere,
      cause_custom: causeCustom,
      background_thought_id: d.thoughtId,
      background_thought_custom: thoughtCustom,
      body_zones: d.bodyZones,
      ...(recordedAt ? { created_at: recordedAt } : {}),
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  // Сайд-эффект: +1 точка света. Лучшее усилие — не валим сохранение, если не вышло.
  await supabase.rpc('add_light_point');

  // Запись отражается на главной (витальность тела), в «Памяти» и на «Пути» — освежаем их кэш.
  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/progress');

  return { ok: true, id: data.id };
}

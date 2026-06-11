'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/shared/api/supabase';

const chakraProfileSchema = z.object({
  root: z.number().int().min(0).max(100),
  sacral: z.number().int().min(0).max(100),
  solar: z.number().int().min(0).max(100),
  heart: z.number().int().min(0).max(100),
  throat: z.number().int().min(0).max(100),
  third_eye: z.number().int().min(0).max(100),
  crown: z.number().int().min(0).max(100),
});

export type ChakraProfileInput = z.infer<typeof chakraProfileSchema>;

export type SaveChakraResult = { ok: true } | { error: string };

/**
 * Сохраняет результат теста чакр как отправную точку (`profiles.chakra_profile`). Дальше
 * карта оживает от записей дневника (computeEnergyAt поверх этого профиля). Только числа —
 * crisis-фильтр не нужен.
 */
export async function saveChakraProfileAction(
  input: ChakraProfileInput,
): Promise<SaveChakraResult> {
  const parsed = chakraProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Что-то не так с ответами — попробуем ещё раз?' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ chakra_profile: parsed.data })
    .eq('id', user.id);

  if (error) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  revalidatePath('/progress');
  return { ok: true };
}

/**
 * TODO(temp/dev): сброс результата теста чакр для перетестирования (profiles.chakra_profile →
 * null). Работает под сессией пользователя (RLS update-own). Убрать перед бетой вместе с
 * dev-ссылкой в EnergyPanel.
 */
export async function resetChakraProfileAction(): Promise<SaveChakraResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ chakra_profile: null })
    .eq('id', user.id);

  if (error) {
    return { error: 'Не удалось сбросить' };
  }

  revalidatePath('/progress');
  return { ok: true };
}

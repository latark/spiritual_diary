import 'server-only';

import { cache } from 'react';

import { createSupabaseServerClient } from '@/shared/api/supabase';

/**
 * Текущий пользователь, дедуплицированный на один серверный рендер. До этого `getUser()`
 * дёргался по отдельности в layout, page и каждом query-хелпере — 3–5 одинаковых round-trip
 * к Supabase Auth за один заход. `cache()` из React схлопывает их в один вызов на запрос.
 * `getSession()` сознательно не используем: `getUser()` проверяет токен на сервере (см. §6).
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Профиль текущего пользователя одним запросом на рендер. Раньше layout читал
 * `onboarding_completed`, page — `timezone/display_name/intention`, «Путь» — `chakra_profile`
 * отдельными SELECT к одной строке. Здесь берём нужный набор колонок разом и кэшируем.
 */
export const getProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select(
      'onboarding_completed, timezone, display_name, intention_30d, chakra_profile, created_at',
    )
    .eq('id', user.id)
    .single();

  return data;
});

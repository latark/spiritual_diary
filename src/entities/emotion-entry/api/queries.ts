import 'server-only';

import { createSupabaseServerClient } from '@/shared/api/supabase';

import { rowToEntry } from '../lib/row-to-entry';
import type { EmotionEntry } from '../model/types';

const SELECT =
  'id, user_id, family_id, shade_id, emotion_name, emotion_color, intensity, intensity_after, cause_sphere, cause_custom, background_thought_id, background_thought_custom, body_zones, awareness, created_at';

const DAY_MS = 86_400_000;

/** Записи за календарный месяц (локальные границы) — для «Памяти». */
export async function getMonthEntries(year: number, month: number): Promise<EmotionEntry[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Границы в UTC (не в таймзоне сервера) + паддинг ±1 день: created_at хранится в UTC, а
  // группировка на клиенте — по его локальному дню. Запись у границы месяца (поздний вечер /
  // раннее утро) по локальному дню попадает в этот месяц, хотя по UTC — в соседний; паддинг
  // её не теряет. Лишние соседние дни клиент отбрасывает (показывает только дни месяца).
  const from = new Date(Date.UTC(year, month, 1) - DAY_MS).toISOString();
  const to = new Date(Date.UTC(year, month + 1, 1) + DAY_MS).toISOString();

  const { data } = await supabase
    .from('emotion_entries')
    .select(SELECT)
    .eq('user_id', user.id)
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: true });

  return (data ?? []).map(rowToEntry);
}

/**
 * Кандидаты на «возвращение» — записи 3–14-дневной давности без осознания. Дистанция в
 * несколько дней даёт взгляд со стороны; верхняя граница держит инсайт свежим. Отбор и
 * сортировку (по 3 за раз) делает selectReturnMoments.
 */
export async function getReturnCandidates(): Promise<EmotionEntry[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const now = Date.now();
  const from = new Date(now - 14 * DAY_MS).toISOString();
  const to = new Date(now - 3 * DAY_MS).toISOString();

  const { data } = await supabase
    .from('emotion_entries')
    .select(SELECT)
    .eq('user_id', user.id)
    .is('awareness', null)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: false });

  return (data ?? []).map(rowToEntry);
}

/** Осмысленные записи (с осознанием) — лента «Твой свет» на «Пути», свежие сверху. */
export async function getInsightTrail(limit: number): Promise<EmotionEntry[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('emotion_entries')
    .select(SELECT)
    .eq('user_id', user.id)
    .not('awareness', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map(rowToEntry);
}

'use server';

import type { EmotionEntry } from '@/entities/emotion-entry';
import { getMonthEntries } from '@/entities/emotion-entry/server';

/** Записи месяца для клиентской навигации календаря. RLS отдаёт только свои. */
export async function getMonthEntriesAction(year: number, month: number): Promise<EmotionEntry[]> {
  return getMonthEntries(year, month);
}

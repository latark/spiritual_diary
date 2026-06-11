import type { EmotionEntry } from '@/entities/emotion-entry';

import { toReturnMoment } from './to-return-moment';
import type { ReturnMoment } from './types';

/** Сколько моментов показываем за раз. */
const MAX_MOMENTS = 3;

/**
 * Отбирает 2–3 момента для «возвращения». Приоритет — негативным семьям (там осознание
 * целебнее всего), затем по силе чувства, затем — более свежие. Позитивные занимают
 * оставшиеся места. Уже осмысленные (с awareness) — пропускаем.
 */
export function selectReturnMoments(entries: EmotionEntry[]): ReturnMoment[] {
  return entries
    .filter((e) => e.awareness == null)
    .map(toReturnMoment)
    .sort((a, b) => {
      if (a.valence !== b.valence) return a.valence === 'negative' ? -1 : 1;
      if (b.intensity !== a.intensity) return b.intensity - a.intensity;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, MAX_MOMENTS);
}

import type { EmotionEntry } from '@/entities/emotion-entry';
import { familyValence } from '@/shared/content/valence';

import type { ReturnMoment } from './types';

/** Запись дневника → момент с валентностью (из семьи эмоции). */
export function toReturnMoment(entry: EmotionEntry): ReturnMoment {
  return { ...entry, valence: familyValence(entry.familyId) };
}

import type { EmotionEntry } from '@/entities/emotion-entry';
import type { Valence } from '@/shared/content/valence';

/** Запись с посчитанной валентностью — для показа на «Пути» (очередь + лента осознаний). */
export interface ReturnMoment extends EmotionEntry {
  valence: Valence;
}

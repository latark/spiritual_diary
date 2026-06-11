import { BACKGROUND_THOUGHTS, THOUGHT_BY_ID } from '@/shared/content/background-thoughts';
import { LIFE_SPHERES } from '@/shared/content/life-spheres';
import { familyValence } from '@/shared/content/valence';

import type { EmotionEntry } from '../model/types';

/** Текст причины: свой текст приоритетнее, иначе — название сферы жизни. */
export function causeLabel(entry: EmotionEntry): string | null {
  const custom = entry.causeCustom?.trim();
  if (custom) return custom;
  if (!entry.causeSphere) return null;
  return LIFE_SPHERES.find((s) => s.id === entry.causeSphere)?.name ?? null;
}

/**
 * Текст фоновой мысли: свой текст приоритетнее. Из каталога берём установку под
 * валентность — для негативной эмоции ограничивающую (negative), для светлой — переустановку.
 */
export function thoughtLabel(entry: EmotionEntry): string | null {
  const custom = entry.thoughtCustom?.trim();
  if (custom) return custom;
  if (entry.thoughtId == null) return null;
  const thought = BACKGROUND_THOUGHTS.find((t) => t.id === entry.thoughtId);
  if (!thought) return null;
  const valence = familyValence(entry.familyId);
  return valence === 'negative' ? (thought.negative ?? thought.positive) : thought.positive;
}

/**
 * Тип когнитивного искажения выбранной фоновой мысли (из каталога) — для прицельного
 * вопроса в «Осознании». null, если мысль своя или мысли нет. Служебное значение, на
 * экран не показываем; маппится в вопрос через promptForDistortion.
 */
export function thoughtDistortion(entry: EmotionEntry): string | null {
  if (entry.thoughtId == null) return null;
  return THOUGHT_BY_ID.get(entry.thoughtId)?.distortion ?? null;
}

/**
 * Каталожная переустановка (positive) выбранной мысли — «модель-ответ» в финале лестницы
 * проработки: показываем как «а вот как это можно ещё увидеть», не вместо своей альтернативы.
 * null для своей мысли (своей переустановки в каталоге нет).
 */
export function thoughtReframe(entry: EmotionEntry): string | null {
  if (entry.thoughtId == null) return null;
  return THOUGHT_BY_ID.get(entry.thoughtId)?.positive ?? null;
}

/** Убеждение-схема о себе (core) — лестница ведёт его в регистр CORE_BELIEF, не в челлендж. */
export function thoughtIsCore(entry: EmotionEntry): boolean {
  if (entry.thoughtId == null) return false;
  return THOUGHT_BY_ID.get(entry.thoughtId)?.core ?? false;
}

/**
 * Валентность эмоции — для выбора маркера на теле:
 * позитивная → светлячок (тёплое свечение), негативная → чёрная колючка.
 * Удивление отнесено к позитивным (решение Артёма).
 */

export type Valence = 'positive' | 'negative';

const POSITIVE_FAMILIES = new Set(['joy', 'love', 'peace', 'interest', 'surprise']);

export function familyValence(familyId: string): Valence {
  return POSITIVE_FAMILIES.has(familyId) ? 'positive' : 'negative';
}

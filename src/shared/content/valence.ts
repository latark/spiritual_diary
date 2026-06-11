/**
 * Валентность семьи эмоций. Доменная логика школы: «позитивные» / «негативные» здесь —
 * НЕ «хорошие/плохие», а направление заряда для UI-метафор (светлячок ↔ колючка) и
 * приоритизации. Удивление отнесено к позитивным (решение Артёма).
 *
 * Живёт в shared/content рядом с каталогом эмоций, чтобы любой слой мог опереться на неё
 * без горизонтальных импортов между фичами.
 */

export type Valence = 'positive' | 'negative';

const POSITIVE_FAMILIES = new Set(['joy', 'love', 'peace', 'interest', 'surprise']);

export function familyValence(familyId: string): Valence {
  return POSITIVE_FAMILIES.has(familyId) ? 'positive' : 'negative';
}

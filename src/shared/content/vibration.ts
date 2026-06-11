/**
 * Вибрация дня — традиция школы (шкала уровней сознания, Хокинса), НЕ измерение.
 * Семьи грубо ложатся на 4-ступенчатую вибрационную шкалу продукта:
 * низкая → средняя → высокая → высшая. Юзеру показываем только цвет/свечение и слово,
 * никаких чисел-баллов (CLAUDE.md §4, принцип «без метрик»).
 *
 * Живёт в shared/content рядом с каталогом эмоций и валентностью, чтобы любой слой мог
 * опереться без горизонтальных импортов. Работает на примитивах (familyId + сила).
 */

export type VibeLevel = 'low' | 'mid' | 'high' | 'transcendent';

export const VIBE_LEVELS: readonly VibeLevel[] = ['low', 'mid', 'high', 'transcendent'];

/** Ступень семьи на шкале: 0 низкая … 3 высшая. */
const FAMILY_LEVEL: Record<string, number> = {
  shame: 0,
  disgust: 0,
  sadness: 0,
  fear: 0,
  anger: 0,
  surprise: 1,
  interest: 1,
  joy: 2,
  love: 2,
  peace: 3,
};

export const VIBE_META: Record<VibeLevel, { label: string; token: string; cssVar: string }> = {
  low: { label: 'низкая', token: 'bg-vibe-low', cssVar: '--color-vibe-low' },
  mid: { label: 'средняя', token: 'bg-vibe-mid', cssVar: '--color-vibe-mid' },
  high: { label: 'высокая', token: 'bg-vibe-high', cssVar: '--color-vibe-high' },
  transcendent: {
    label: 'высшая',
    token: 'bg-vibe-transcendent',
    cssVar: '--color-vibe-transcendent',
  },
};

/**
 * Вибрация набора эмоций (дня): взвешенное по силе среднее ступеней семей.
 * Сильнее прожитая эмоция сильнее тянет день к своей вибрации. null — если эмоций нет.
 */
export function aggregateVibration(
  items: { familyId: string; intensity: number }[],
): VibeLevel | null {
  if (items.length === 0) return null;
  let weighted = 0;
  let total = 0;
  for (const { familyId, intensity } of items) {
    const level = FAMILY_LEVEL[familyId] ?? 1;
    const weight = Math.max(1, intensity);
    weighted += level * weight;
    total += weight;
  }
  const idx = Math.min(VIBE_LEVELS.length - 1, Math.max(0, Math.round(weighted / total)));
  return VIBE_LEVELS[idx] ?? null;
}

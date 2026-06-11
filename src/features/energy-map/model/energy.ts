import type { ChakraProfile } from '@/shared/content/chakras';

// EnergyEntry — доменная форма (вклад записи в чакру), живёт в shared/content/chakras,
// чтобы на неё опирался и читающий слой (entities), и эта механика. Ре-экспорт сохраняет
// существующие пути импорта внутри слайса.
export type { EnergyEntry } from '@/shared/content/chakras';

import type { EnergyEntry } from '@/shared/content/chakras';

/**
 * Сила влияния одной эмоции на чакру за единицу интенсивности. 0.5 → вклад = интенсивность/2
 * (макс ±2.5 за запись): развитие плавное, одна запись не перечёркивает прогресс.
 */
const ENERGY_STEP = 0.5;

const clamp = (v: number): number => Math.max(0, Math.min(100, v));

/**
 * Уровень чакр на момент `asOf`: стартовый профиль из онбординга + накопленное влияние
 * эмоций до этого момента. Позитивные усиливают, негативные ослабляют, сила ∝ интенсивности.
 * Клампим после каждого шага — энергия не уходит за 0..100 даже промежуточно.
 */
export function computeEnergyAt(
  initial: ChakraProfile,
  entries: EnergyEntry[],
  asOf: number,
): ChakraProfile {
  const result = { ...initial };
  const ordered = entries.filter((e) => e.at <= asOf).sort((a, b) => a.at - b.at);
  for (const e of ordered) {
    const dir = e.valence === 'positive' ? 1 : -1;
    result[e.chakra] = clamp(result[e.chakra] + dir * ENERGY_STEP * e.intensity);
  }
  return result;
}

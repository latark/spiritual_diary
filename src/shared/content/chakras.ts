/**
 * Семь чакр — доменная основа (id, названия, цвета) и профиль 0..100.
 * Живёт в shared/content, чтобы и тест чакр («Путь»), и визуализации энергий
 * опирались на один источник без горизонтальных импортов между фичами.
 */

import type { Valence } from './valence';

export type ChakraId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown';

export interface ChakraInfo {
  id: ChakraId;
  name: string;
  color: string;
}

export const CHAKRAS: ChakraInfo[] = [
  { id: 'root', name: 'Корневая', color: '#C0392B' },
  { id: 'sacral', name: 'Сакральная', color: '#E67E22' },
  { id: 'solar', name: 'Солнечное сплетение', color: '#F1C40F' },
  { id: 'heart', name: 'Сердечная', color: '#2ECC71' },
  { id: 'throat', name: 'Горловая', color: '#3498DB' },
  { id: 'third_eye', name: 'Третий глаз', color: '#5B6BBF' },
  { id: 'crown', name: 'Коронная', color: '#9B59B6' },
];

export type ChakraProfile = Record<ChakraId, number>;

export function chakraState(score: number): 'weak' | 'balanced' | 'strong' {
  if (score < 45) return 'weak';
  if (score < 70) return 'balanced';
  return 'strong';
}

// Нейтральные, равноценные состояния — без оценки «хорошо/плохо», «сильнее/слабее».
// Покой и поток одинаково естественны; ни один край шкалы не «хуже».
export function chakraStateLabel(score: number): string {
  const s = chakraState(score);
  return s === 'weak' ? 'в покое' : s === 'balanced' ? 'в равновесии' : 'в потоке';
}

/**
 * Вклад одной записи дневника в энергию чакры: чакра = сфера-причина (`causeSphere` совпадает
 * по id с чакрой), валентность — из семьи эмоции (`familyValence`). Доменная форма данных,
 * на которую опираются и читающий слой (entities), и визуализации энергий (energy-map).
 */
export interface EnergyEntry {
  chakra: ChakraId;
  valence: Valence;
  /** Интенсивность 1..5. */
  intensity: number;
  /** Момент записи, ms. */
  at: number;
}

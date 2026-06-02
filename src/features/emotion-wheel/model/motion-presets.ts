/**
 * Пресеты анимации перехода колеса («свет и растворение»), подобранные на стенде /dev/motion.
 * holdMs (пауза) относится только к автоповтору на стенде и в продукте не используется.
 */

export interface MotionPreset {
  /** Затухание старых лепестков, мс. */
  dissolveMs: number;
  /** Проявление новых лепестков, мс. */
  materializeMs: number;
  /** Задержка перед проявлением, мс. */
  materializeDelayMs: number;
  /** Размытие лепестков при переходе, px (0 — без размытия). */
  maxBlur: number;
  /** Количество частиц света (canvas). */
  moteCount: number;
  /** Время жизни частицы, мс. */
  moteDurMs: number;
  /** Размер частицы. */
  moteSize: number;
  /** Яркость свечения частиц (0..1). */
  moteGlow: number;
  /** Радиус разлёта частиц от центра, px. */
  moteSpread: number;
  /** Яркость вспышки ядра (0..1). */
  igniteOpacity: number;
}

/** Основной — применён в продукте. Крупные мягкие частицы, без размытия лепестков. */
export const MOTION_PRESET: MotionPreset = {
  dissolveMs: 150,
  materializeMs: 340,
  materializeDelayMs: 0,
  maxBlur: 0,
  moteCount: 22,
  moteDurMs: 1200,
  moteSize: 6,
  moteGlow: 0.1,
  moteSpread: 174,
  igniteOpacity: 0.1,
};

/** Запасной вариант (НЕ применён). Много мелких ярких искр. Держим на случай смены. */
export const MOTION_PRESET_FALLBACK: MotionPreset = {
  dissolveMs: 150,
  materializeMs: 340,
  materializeDelayMs: 0,
  maxBlur: 0,
  moteCount: 70,
  moteDurMs: 860,
  moteSize: 0.7,
  moteGlow: 0.45,
  moteSpread: 174,
  igniteOpacity: 0.1,
};

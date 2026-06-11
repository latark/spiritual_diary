/**
 * Прогрессия тела света: 13 фаз, драйвер — накопленные активные дни (день с ≥1 записью).
 * Чистые функции, client-safe. Пороги — единый источник правды между UI и claim-экшеном.
 */

export const STAGE_COUNT = 13;

// Накопительные активные дни для ВХОДА в фазу (индекс = фаза − 1). Первые быстро, дальше зазор растёт.
export const STAGE_THRESHOLDS = [0, 1, 3, 5, 8, 12, 18, 26, 38, 54, 76, 110, 160] as const;

/** Заработанная фаза по активным дням (1..13). */
export function computeStage(activeDays: number): number {
  let stage = 1;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (activeDays >= STAGE_THRESHOLDS[i]!) stage = i + 1;
  }
  return stage;
}

/** Прогресс внутри текущего гэпа 0..1 (от порога входа в фазу к порогу следующей). */
export function gapProgress(activeDays: number, stage: number): number {
  if (stage >= STAGE_COUNT) return 1;
  const lo = STAGE_THRESHOLDS[stage - 1]!;
  const hi = STAGE_THRESHOLDS[stage]!;
  if (hi <= lo) return 1;
  const p = (activeDays - lo) / (hi - lo);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/**
 * Вызревание (ripeness) — back-loaded: первые ~70% гэпа ровно, последние ~30% свет сгущается
 * («что-то назревает»). 0..1. Показываем только когда заработанная фаза = подтверждённой
 * (иначе вместо мерцания — кнопка перехода).
 */
export function ripeness(activeDays: number, stage: number): number {
  const r = (gapProgress(activeDays, stage) - 0.7) / 0.3;
  return r < 0 ? 0 : r > 1 ? 1 : r;
}

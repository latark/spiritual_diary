// Public API — client-safe: чистая логика витальности и прогрессии (без серверного кода).
// Серверное чтение состояния живёт в './server' (тянет next/headers).
export { vitality, daysSinceLastRecord, VITALITY_FLOOR } from './model/vitality';
export {
  STAGE_COUNT,
  STAGE_THRESHOLDS,
  computeStage,
  gapProgress,
  ripeness,
} from './model/progression';
export type { LightBodyState } from './model/types';

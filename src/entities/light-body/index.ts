// Public API — client-safe: чистая логика витальности (без серверного кода).
// Серверное чтение состояния живёт в './server' (тянет next/headers).
export { vitality, daysSinceLastRecord, VITALITY_FLOOR } from './model/vitality';

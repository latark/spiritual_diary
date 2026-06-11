// Public API — client-safe: схема и типы послания. Серверные части (gather, openai, generate)
// живут в model/* с пометкой server-only и импортируются только серверными модулями.
export { weeklyMessageSchema, type WeeklyMessage } from './model/types';
export type { WeeklySummary, WeeklyEntrySummary } from './model/types';

// Public API — client-safe: схема/типы, server action и UI. Серверные запросы (getLatest) и
// внутренности генерации (gather/openai) — в server.ts / model/* с пометкой server-only.
export { weeklyMessageSchema, type WeeklyMessage } from './model/types';
export type { WeeklySummary, WeeklyEntrySummary, LatestWeekly, WeeklyResult } from './model/types';
export { generateWeeklyAnalysisAction } from './model/generate-action';
export { WeeklyMessageCard } from './ui/WeeklyMessageCard';
export { WeeklyDevTrigger } from './ui/WeeklyDevTrigger';

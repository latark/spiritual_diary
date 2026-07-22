// Server-only public API: запросы к БД и оркестрация (тянут next/headers / service-role).
// Импортируется только серверными модулями (server components, route handlers).
export { getLatestWeeklyAnalysis } from './model/queries';
export { runWeeklyForUser } from './model/run';

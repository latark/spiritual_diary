// Server-only public API сущности: запросы к БД (тянут next/headers). Импортируется ТОЛЬКО
// серверными модулями (server components, server actions). Клиент использует './index' (типы,
// лейблы). Разделение не даёт серверному коду утечь в клиентский бандл.
export {
  getMonthEntries,
  getReturnCandidates,
  getInsightTrail,
  getEnergyEntries,
  getEntriesSince,
} from './api/queries';

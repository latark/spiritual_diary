// Public API — client-safe: типы, презентационные лейблы и общий экран осмысления.
// Серверные запросы к БД (next/headers) живут в './api/queries' с пометкой server-only,
// чтобы не утянуть серверный код в клиентский бандл; их импортируют только server-модули.
// `add-awareness-action` — 'use server', InsightLadder зовёт его сам, наружу не выносим.
// InsightLadder инкапсулирован: наружу — только ReflectionOverlay (общий экран на запись).
export type { EmotionEntry } from './model/types';
export { causeLabel, thoughtLabel } from './lib/labels';
export { ReflectionOverlay } from './ui/ReflectionOverlay';

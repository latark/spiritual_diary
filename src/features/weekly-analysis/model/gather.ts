import { causeLabel, thoughtLabel, type EmotionEntry } from '@/entities/emotion-entry';
import { EMOTION_FAMILIES } from '@/shared/content/emotions';
import { familyValence } from '@/shared/content/valence';

import type { WeeklyEntrySummary, WeeklySummary } from './types';

const DAY_MS = 86_400_000;
const FAMILY_NAME = new Map(EMOTION_FAMILIES.map((f) => [f.id, f.name]));
const isoDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

function tally(map: Record<string, number>, key: string | null): void {
  if (!key) return;
  map[key] = (map[key] ?? 0) + 1;
}

/**
 * Записи недели → обезличенная сводка для ИИ. Чистое преобразование (без БД): имени/локаций
 * нет (§7), свободный текст (ситуация/мысль/осознание) включаем (MVP «как есть»). Сбор записей
 * (auth- или service-клиентом) делает вызывающий; порог low-data проверяется по entriesCount.
 */
export function summarize(entries: EmotionEntry[], days = 7): WeeklySummary {
  const familyCounts: Record<string, number> = {};
  const causeCounts: Record<string, number> = {};

  const summarized: WeeklyEntrySummary[] = entries.map((e) => {
    const family = FAMILY_NAME.get(e.familyId) ?? e.familyId;
    const cause = causeLabel(e);
    tally(familyCounts, family);
    tally(causeCounts, cause);

    return {
      day: e.createdAt.slice(0, 10),
      emotion: e.emotionName,
      family,
      valence: familyValence(e.familyId) === 'positive' ? 'светлая' : 'тёмная',
      intensity: e.intensity,
      intensityAfter: e.intensityAfter,
      cause,
      thought: thoughtLabel(e),
      situation: e.situation,
      awareness: e.awareness,
    };
  });

  return {
    periodStart: isoDate(Date.now() - days * DAY_MS),
    periodEnd: isoDate(Date.now()),
    entriesCount: summarized.length,
    familyCounts,
    causeCounts,
    entries: summarized,
  };
}

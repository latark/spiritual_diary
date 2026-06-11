import type { LifeSphereId } from '@/shared/content/life-spheres';
import type { Tables } from '@/shared/api/supabase/database.types';

import type { EmotionEntry } from '../model/types';

/** Строка emotion_entries из БД → доменная сущность EmotionEntry. */
export function rowToEntry(row: Tables<'emotion_entries'>): EmotionEntry {
  return {
    id: row.id,
    familyId: row.family_id,
    shadeId: row.shade_id,
    emotionName: row.emotion_name,
    emotionColor: row.emotion_color,
    intensity: row.intensity,
    intensityAfter: row.intensity_after,
    causeSphere: (row.cause_sphere as LifeSphereId | null) ?? null,
    causeCustom: row.cause_custom,
    thoughtId: row.background_thought_id,
    thoughtCustom: row.background_thought_custom,
    bodyZones: row.body_zones,
    awareness: row.awareness,
    createdAt: row.created_at,
  };
}

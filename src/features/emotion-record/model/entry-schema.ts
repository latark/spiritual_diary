import { z } from 'zod';

/** Данные записи эмоции для сохранения (маппятся на таблицу emotion_entries). */
export const emotionEntrySchema = z.object({
  familyId: z.string().min(1),
  shadeId: z.string().min(1),
  emotionName: z.string().min(1),
  emotionColor: z.string().min(1),
  intensity: z.number().int().min(1).max(5),
  // Сила после дыхания (переоценка облегчения). null = шаг пропустили.
  intensityAfter: z.number().int().min(1).max(5).nullable(),
  causeSphere: z
    .enum(['root', 'sacral', 'solar', 'heart', 'throat', 'third_eye', 'crown'])
    .nullable(),
  // Причина-уточнение — под-область сферы из каталога (контролируемое значение, не своб. текст).
  causeCustom: z.string().max(120),
  thoughtId: z.number().int().min(1).max(200).nullable(),
  // Фоновая мысль может быть своей → save-action прогоняет её через crisis-фильтр (§6).
  thoughtCustom: z.string().max(2000),
  bodyZones: z.array(z.string()).max(20),
  // Бэкдейтинг из «Памяти»: запись за прошедший день. ISO-инстант (полдень локального дня,
  // считает клиент). Без поля — created_at = now() по умолчанию БД.
  recordedAt: z.string().datetime().optional(),
});

export type EmotionEntryInput = z.infer<typeof emotionEntrySchema>;

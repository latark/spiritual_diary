import { z } from 'zod';

/** Данные записи эмоции для сохранения (маппятся на таблицу emotion_entries). */
export const emotionEntrySchema = z.object({
  familyId: z.string().min(1),
  shadeId: z.string().min(1),
  emotionName: z.string().min(1),
  emotionColor: z.string().min(1),
  intensity: z.number().int().min(1).max(5),
  causeSphere: z
    .enum(['root', 'sacral', 'solar', 'heart', 'throat', 'third_eye', 'crown'])
    .nullable(),
  causeCustom: z.string().max(1000),
  thoughtId: z.number().int().min(1).max(200).nullable(),
  thoughtCustom: z.string().max(2000),
  bodyZones: z.array(z.string()).max(20),
});

export type EmotionEntryInput = z.infer<typeof emotionEntrySchema>;

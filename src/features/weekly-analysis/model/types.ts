import { z } from 'zod';

/**
 * Структура «послания проводника» — то, что возвращает ИИ (structured output). Поля = голос
 * тотема (spiritual-voice): мягкий зачин → узор недели (отражение, не диагноз) → что окрепло/
 * смягчилось (свет) → одно бережное приглашение (НЕ императив, reflection-method). Текст в
 * каждом поле — на «ты», без медицины и оценок.
 */
export const weeklyMessageSchema = z.object({
  greeting: z.string().describe('Мягкий зачин на «ты»: «Милая…», «Душа моя…». 1 короткая фраза.'),
  pattern: z
    .string()
    .describe('Что проступает за неделю — узор чувств/сфер. Отражение без диагноза, 2–4 фразы.'),
  softening: z
    .string()
    .describe(
      'Что окрепло или смягчилось — метафора света/тепла, опора на сдвиги силы и осознания.',
    ),
  invitation: z
    .string()
    .describe('Одно бережное приглашение на неделю. Не приказ, не практика-инструкция.'),
});

export type WeeklyMessage = z.infer<typeof weeklyMessageSchema>;

/** Одна запись в обезличенной сводке недели (вход для ИИ). */
export interface WeeklyEntrySummary {
  day: string; // YYYY-MM-DD
  emotion: string; // оттенок (имя)
  family: string; // семья (имя)
  valence: 'светлая' | 'тёмная';
  intensity: number; // 1..5
  intensityAfter: number | null; // сила после дыхания
  cause: string | null; // сфера-причина или свой текст
  thought: string | null; // фоновая мысль
  situation: string | null; // что случилось (своими словами)
  awareness: string | null; // осознание
}

/**
 * Обезличенная сводка недели — единственное, что уходит в ИИ. Имени/локаций здесь нет (§7).
 * MVP «как есть»: свободный текст (ситуация/мысль/осознание) включаем, имя — нет.
 */
export interface WeeklySummary {
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  entriesCount: number;
  familyCounts: Record<string, number>; // семья → сколько раз
  causeCounts: Record<string, number>; // сфера → сколько раз
  entries: WeeklyEntrySummary[];
}

/** Последнее послание пользователя — для показа в «Пути» (client-safe). */
export interface LatestWeekly {
  status: string; // ready | skipped_low_data | safe_fallback | error
  message: WeeklyMessage | null; // распарсенное послание (только при status ready)
  createdAt: string;
  periodStart: string;
  periodEnd: string;
}

/** Итог прогона генерации для одного пользователя (кнопка и cron). */
export type WeeklyResult =
  | { ok: true; status: 'ready'; message: WeeklyMessage }
  | { ok: true; status: 'skipped_low_data' | 'safe_fallback' }
  | { error: string };

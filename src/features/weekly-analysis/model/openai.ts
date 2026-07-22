import 'server-only';

import OpenAI from 'openai';

import { PROMPT_VERSION, SYSTEM_PROMPT } from './prompt';
import { weeklyMessageSchema, type WeeklyMessage, type WeeklySummary } from './types';

// Точную строку модели держим в env, чтобы менять без правок кода (вдруг это не ровно 'gpt-5').
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-5';

export interface GenerationResult {
  message: WeeklyMessage;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
}

/** Обезличенная сводка → читаемый текст для модели (только данные, без имени). */
function formatSummary(s: WeeklySummary): string {
  const lines: string[] = [
    `Окно недели: ${s.periodStart} — ${s.periodEnd}. Записей: ${s.entriesCount}.`,
  ];

  const fam = Object.entries(s.familyCounts)
    .map(([k, v]) => `${k}×${v}`)
    .join(', ');
  if (fam) lines.push(`Семьи чувств: ${fam}.`);

  const cau = Object.entries(s.causeCounts)
    .map(([k, v]) => `${k}×${v}`)
    .join(', ');
  if (cau) lines.push(`Сферы-причины: ${cau}.`);

  lines.push('Записи:');
  for (const e of s.entries) {
    const after = e.intensityAfter != null ? `→${e.intensityAfter}` : '';
    const parts: string[] = [
      `${e.day}: ${e.emotion} (${e.family}, ${e.valence}), сила ${e.intensity}${after}`,
    ];
    if (e.cause) parts.push(`причина: ${e.cause}`);
    if (e.thought) parts.push(`мысль: «${e.thought}»`);
    if (e.situation) parts.push(`ситуация: ${e.situation}`);
    if (e.awareness) parts.push(`осознание: ${e.awareness}`);
    lines.push(`- ${parts.join('; ')}.`);
  }

  return lines.join('\n');
}

/**
 * Зовёт модель и возвращает валидное послание. Structured output задаём ручной JSON-схемой
 * (надёжнее zod-хелпера при zod v4), на выходе валидируем нашим Zod; при невалидности — 1 ретрай.
 * Ключ OPENAI_API_KEY читается из env (только сервер). Ошибки пробрасываем — их ловит оркестратор.
 */
export async function generateWeeklyMessage(summary: WeeklySummary): Promise<GenerationResult> {
  const client = new OpenAI();
  const userContent = formatSummary(summary);

  for (let attempt = 0; attempt < 2; attempt++) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'weekly_message',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              greeting: { type: 'string' },
              pattern: { type: 'string' },
              softening: { type: 'string' },
              invitation: { type: 'string' },
            },
            required: ['greeting', 'pattern', 'softening', 'invitation'],
          },
        },
      },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const result = weeklyMessageSchema.safeParse(parsed);
    if (result.success) {
      return {
        message: result.data,
        model: MODEL,
        promptVersion: PROMPT_VERSION,
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
      };
    }
  }

  throw new Error('weekly message: модель вернула невалидный вывод дважды');
}

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { getEntriesSinceWith } from '@/entities/emotion-entry/server';
import type { Database } from '@/shared/api/supabase/database.types';

import { summarize } from './gather';
import { generateWeeklyMessage } from './openai';
import { filterWeeklyMessage } from './output-filter';
import type { WeeklyResult } from './types';

// Меньше порога записей — не выдумываем узор (мягкое уведомление вместо послания).
const LOW_DATA_THRESHOLD = 4;

// ≈ цена за 1M токенов, USD. ⚠️ PLACEHOLDER — сверь актуальные цифры модели и поправь.
const PRICE: Record<string, { input: number; output: number }> = {
  'gpt-5': { input: 1.25, output: 10 },
};

function costUsd(model: string, inTok: number, outTok: number): number | null {
  const p = PRICE[model];
  if (!p) return null;
  return Number(((inTok / 1e6) * p.input + (outTok / 1e6) * p.output).toFixed(6));
}

/**
 * Генерирует «послание проводника» за неделю для ОДНОГО пользователя и пишет результат в
 * weekly_analyses через переданный клиент. Auth-клиент (кнопка) пишет свою строку по RLS;
 * service-клиент (cron) — в обход RLS за любого пользователя. Свободного ввода нет (данные —
 * уже сохранённые записи, прошедшие crisis-фильтр при записи); §6 закрыт ВЫХОДНЫМ фильтром.
 */
export async function runWeeklyForUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<WeeklyResult> {
  const entries = await getEntriesSinceWith(client, userId, 7);
  const summary = summarize(entries, 7);
  const base = {
    user_id: userId,
    period_start: summary.periodStart,
    period_end: summary.periodEnd,
    entries_count: summary.entriesCount,
  };

  if (summary.entriesCount < LOW_DATA_THRESHOLD) {
    await client.from('weekly_analyses').insert({ ...base, status: 'skipped_low_data' });
    return { ok: true, status: 'skipped_low_data' };
  }

  let gen;
  try {
    gen = await generateWeeklyMessage(summary);
  } catch {
    await client.from('weekly_analyses').insert({ ...base, status: 'error' });
    return { error: 'Связь с каналом прервалась… вернёмся к этому чуть позже' };
  }

  const meta = {
    model: gen.model,
    prompt_version: gen.promptVersion,
    input_tokens: gen.inputTokens,
    output_tokens: gen.outputTokens,
    cost_usd: costUsd(gen.model, gen.inputTokens, gen.outputTokens),
  };

  const verdict = filterWeeklyMessage(gen.message);
  if (!verdict.safe) {
    await client.from('weekly_analyses').insert({ ...base, ...meta, status: 'safe_fallback' });
    return { ok: true, status: 'safe_fallback' };
  }

  await client
    .from('weekly_analyses')
    .insert({ ...base, ...meta, status: 'ready', content: gen.message });
  return { ok: true, status: 'ready', message: gen.message };
}

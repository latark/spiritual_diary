import { NextResponse } from 'next/server';

import { runWeeklyForUser } from '@/features/weekly-analysis/server';
import { createSupabaseServiceClient } from '@/shared/api/supabase/service';

// Плановый прогон еженедельного анализа. Триггерится Vercel Cron (vercel.json) по воскресеньям
// 09:00 UTC = 12:00 МСК. Vercel добавляет заголовок Authorization: Bearer <CRON_SECRET> — сверяем.
// Работает без пользовательской сессии → service-role клиент (в обход RLS).
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // потолок Vercel Hobby; на масштабе перейти на батч/очередь

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new NextResponse('CRON_SECRET not configured', { status: 500 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('onboarding_completed', true);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stats = { total: 0, ready: 0, skipped_low_data: 0, safe_fallback: 0, error: 0 };
  for (const u of users ?? []) {
    stats.total++;
    const r = await runWeeklyForUser(supabase, u.id);
    if ('error' in r) stats.error++;
    else stats[r.status]++;
  }

  return NextResponse.json(stats);
}

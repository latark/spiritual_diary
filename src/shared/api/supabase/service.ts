import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/shared/config/env';

import type { Database } from './database.types';

/**
 * Service-role клиент: ПОЛНЫЙ доступ в обход RLS. Только для серверных фоновых задач без
 * пользовательской сессии (cron еженедельного анализа перебирает всех пользователей). Никогда
 * не отдавать на клиент и не использовать в обработчике пользовательского запроса вместо
 * auth-клиента. Ключ SUPABASE_SERVICE_ROLE_KEY — серверный секрет (не NEXT_PUBLIC).
 */
export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(env.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

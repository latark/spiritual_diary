import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/shared/config/env';

import type { Database } from './database.types';

/** Клиент Supabase для клиентских компонентов. */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}

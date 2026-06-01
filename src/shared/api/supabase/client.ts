import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/shared/config/env';

/** Клиент Supabase для клиентских компонентов. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

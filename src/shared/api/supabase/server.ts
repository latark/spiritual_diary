import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { env } from '@/shared/config/env';

import type { Database } from './database.types';

/**
 * Клиент Supabase для серверных компонентов, server actions и route handlers.
 * Читает/обновляет сессию через cookies (в Next 16 cookies() асинхронный).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Вызов из Server Component, где запись cookies запрещена —
          // обновление сессии берёт на себя proxy. Безопасно игнорируем.
        }
      },
    },
  });
}

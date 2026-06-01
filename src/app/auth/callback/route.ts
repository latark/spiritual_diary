import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/shared/api/supabase';

/**
 * Callback подтверждения email: Supabase редиректит сюда со ?code=...,
 * обмениваем код на сессию и ведём дальше.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

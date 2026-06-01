'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { env } from '@/shared/config/env';

import { mapAuthError } from './errors';
import { loginSchema, registerSchema } from './schemas';

export interface LoginState {
  error?: string;
}

export interface RegisterState {
  error?: string;
  status?: 'check_email';
}

export async function signInAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверь поля' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect('/');
}

export async function signUpAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
    consent: formData.get('consent'),
    marketingConsent: formData.get('marketingConsent') ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверь поля' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.siteUrl}/auth/callback`,
      data: {
        display_name: parsed.data.displayName,
        marketing_consent: Boolean(parsed.data.marketingConsent),
      },
    },
  });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { status: 'check_email' };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

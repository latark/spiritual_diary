'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { ROUTES } from '@/shared/config/navigation';

import { signInAction, type LoginState } from '../model/actions';
import { Field, FormError, SubmitButton } from './fields';

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormError message={state.error} />
      <SubmitButton>Войти</SubmitButton>
      <p className="text-ink-muted text-center text-sm">
        Ещё нет аккаунта?{' '}
        <Link href={ROUTES.register} className="text-gold">
          Создать
        </Link>
      </p>
    </form>
  );
}

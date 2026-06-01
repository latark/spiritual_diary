'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { ROUTES } from '@/shared/config/navigation';

import { signUpAction, type RegisterState } from '../model/actions';
import { Field, FormError, SubmitButton } from './fields';

const initial: RegisterState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(signUpAction, initial);

  if (state.status === 'check_email') {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h2 className="font-display text-ink text-2xl">Проверь почту</h2>
        <p className="text-ink-muted">
          Мы отправили письмо со ссылкой для подтверждения. Перейди по ней — и можно входить.
        </p>
        <Link href={ROUTES.login} className="text-gold mt-2">
          Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="Имя"
        name="displayName"
        autoComplete="name"
        required
        placeholder="Как тебя называть"
      />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Пароль" name="password" type="password" autoComplete="new-password" required />

      <label className="text-ink-muted flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 accent-[var(--color-gold)]"
        />
        <span>
          Я согласна на обработку персональных данных и принимаю{' '}
          <Link href="/legal/privacy" className="text-gold">
            политику конфиденциальности
          </Link>
          .
        </span>
      </label>

      <label className="text-ink-muted flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="marketingConsent"
          className="mt-1 accent-[var(--color-gold)]"
        />
        <span>Получать письма о новых практиках (необязательно).</span>
      </label>

      <FormError message={state.error} />
      <SubmitButton>Создать аккаунт</SubmitButton>

      <p className="text-ink-muted text-center text-sm">
        Уже есть аккаунт?{' '}
        <Link href={ROUTES.login} className="text-gold">
          Войти
        </Link>
      </p>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CrisisSupport } from '@/shared/ui/CrisisSupport';

import { completeOnboardingAction } from '../model/save-action';
import { IntentionStep } from './steps/IntentionStep';

/** Онбординг — один шаг: выбор намерения на 30 дней. Имя/почта/пароль собраны при регистрации. */
export function OnboardingFlow() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [crisis, setCrisis] = useState(false);

  // Только навигация: на главную ведёт свежий серверный рендер (страница динамическая,
  // читает cookies/профиль). router.refresh() здесь не нужен и вреден — в паре с replace
  // даёт гонку, из-за которой переход застревает на /onboarding. Свежесть роутер-кеша
  // обеспечивает revalidatePath в server action.
  function finish() {
    router.replace('/');
  }

  async function submitIntention(intention: string) {
    setBusy(true);
    setError(undefined);
    const res = await completeOnboardingAction({ intention });
    setBusy(false);
    if ('crisis' in res) {
      setCrisis(true);
      return;
    }
    if ('error' in res) {
      setError(res.error);
      return;
    }
    finish();
  }

  // Онбординг уже завершён на сервере (намерение очищено, флаг записан) — с экрана
  // поддержки ведём в приложение.
  if (crisis) {
    return <CrisisSupport onBack={finish} />;
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <IntentionStep busy={busy} error={error} onSubmit={submitIntention} />
    </div>
  );
}

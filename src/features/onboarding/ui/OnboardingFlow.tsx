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

  function finish() {
    router.replace('/');
    router.refresh();
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

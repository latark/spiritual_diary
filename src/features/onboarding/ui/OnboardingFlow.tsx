'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CrisisSupport } from '@/shared/ui/CrisisSupport';

import { completeOnboardingAction } from '../model/save-action';
import { EMPTY_ONBOARDING, type OnboardingData } from '../model/types';
import { ProgressBar } from './ProgressBar';
import { BirthStep } from './steps/BirthStep';
import { BreathingStep } from './steps/BreathingStep';
import { IntentionStep } from './steps/IntentionStep';
import { WelcomeStep } from './steps/WelcomeStep';

const TOTAL = 3; // welcome(0) → birth(1) → intention(2) → breathing(3)

export function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(EMPTY_ONBOARDING);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [crisis, setCrisis] = useState(false);

  function patch(p: Partial<OnboardingData>) {
    setData((d) => ({ ...d, ...p }));
  }

  async function submitIntention(intention: string) {
    setBusy(true);
    setError(undefined);
    const res = await completeOnboardingAction({ ...data, intention });
    setBusy(false);
    if ('crisis' in res) {
      setCrisis(true);
      return;
    }
    if ('error' in res) {
      setError(res.error);
      return;
    }
    patch({ intention });
    setStep(3);
  }

  function finish() {
    router.replace('/');
    router.refresh();
  }

  const note = step === 2 ? 'И последний вопрос' : null;
  const showProgress = step >= 1 && step <= 2;

  // Онбординг уже завершён на сервере (намерение очищено, флаг записан) — с экрана
  // поддержки ведём в приложение.
  if (crisis) {
    return <CrisisSupport onBack={finish} />;
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {showProgress && (
        <div className="flex flex-col gap-2">
          <ProgressBar value={step / TOTAL} />
          {note && <p className="text-gold text-center text-sm">{note}</p>}
        </div>
      )}

      {step === 0 && <WelcomeStep name={name} onNext={() => setStep(1)} />}
      {step === 1 && (
        <BirthStep
          onNext={(v) => {
            patch(v);
            setStep(2);
          }}
        />
      )}
      {step === 2 && <IntentionStep busy={busy} error={error} onSubmit={submitIntention} />}
      {step === 3 && <BreathingStep onFinish={finish} />}
    </div>
  );
}

'use client';

import { useState } from 'react';

import { BACKGROUND_THOUGHTS } from '@/shared/content/background-thoughts';
import type { LifeSphereId } from '@/shared/content/life-spheres';
import { BreathingExercise } from '@/shared/ui/BreathingExercise';

import { BodyMap } from './BodyMap';
import { CauseStep, type CauseValue } from './CauseStep';
import { CompletionStep } from './CompletionStep';
import { CrisisSupport } from './CrisisSupport';
import { IntensityStep } from './IntensityStep';
import { ThoughtStep, type ThoughtValue } from './ThoughtStep';
import type { EmotionEntryInput } from '../model/entry-schema';
import { saveEmotionEntryAction } from '../model/save-action';
import { familyValence } from '../model/valence';
import type { RecordEmotion } from '../model/types';

type Step = 'intensity' | 'cause' | 'thought' | 'body' | 'breathing' | 'done';

interface Draft {
  intensity: number | null;
  causeSphere: LifeSphereId | null;
  causeCustom: string;
  thoughtId: number | null;
  thoughtCustom: string;
  bodyZones: string[];
}

const EMPTY: Draft = {
  intensity: null,
  causeSphere: null,
  causeCustom: '',
  thoughtId: null,
  thoughtCustom: '',
  bodyZones: [],
};

function EmotionChip({ emotion }: { emotion: RecordEmotion }) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <span
        className="inline-block size-3.5 rounded-full"
        style={{ backgroundColor: emotion.color, boxShadow: `0 0 12px -2px ${emotion.color}` }}
      />
      <span className="font-display text-ink text-lg">{emotion.name}</span>
    </div>
  );
}

export function RecordSteps({ emotion, onReset }: { emotion: RecordEmotion; onReset: () => void }) {
  const valence = familyValence(emotion.familyId);

  const [step, setStep] = useState<Step>('intensity');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [crisis, setCrisis] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (crisis) {
    return <CrisisSupport onBack={() => setCrisis(false)} />;
  }

  function submitIntensity(level: number): void {
    setDraft((d) => ({ ...d, intensity: level }));
    setStep('cause');
  }

  function submitCause(v: CauseValue): void {
    setDraft((d) => ({ ...d, causeSphere: v.sphereId, causeCustom: v.custom }));
    setStep('thought');
  }

  function submitThought(v: ThoughtValue): void {
    setDraft((d) => ({ ...d, thoughtId: v.thoughtId, thoughtCustom: v.custom }));
    setStep('body');
  }

  function buildInput(): EmotionEntryInput {
    return {
      familyId: emotion.familyId,
      shadeId: emotion.shadeId,
      emotionName: emotion.name,
      emotionColor: emotion.color,
      intensity: draft.intensity ?? 1,
      causeSphere: draft.causeSphere,
      causeCustom: draft.causeCustom,
      thoughtId: draft.thoughtId,
      thoughtCustom: draft.thoughtCustom,
      bodyZones: draft.bodyZones,
    };
  }

  function runSave(): void {
    setSaveStatus('saving');
    void saveEmotionEntryAction(buildInput()).then((r) =>
      setSaveStatus('ok' in r ? 'saved' : 'error'),
    );
  }

  function finishRecord(): void {
    setStep('done');
    runSave();
  }

  function resetAll(): void {
    setDraft(EMPTY);
    setSaveStatus('idle');
    setStep('intensity');
    onReset();
  }

  const affirmation =
    draft.thoughtId != null
      ? (BACKGROUND_THOUGHTS.find((t) => t.id === draft.thoughtId)?.positive ?? null)
      : null;

  return (
    <div className="flex flex-col items-center gap-5 pt-2">
      <EmotionChip emotion={emotion} />

      {step === 'intensity' && (
        <IntensityStep color={emotion.color} onSubmit={submitIntensity} onBack={onReset} />
      )}

      {step === 'cause' && (
        <CauseStep
          onSubmit={submitCause}
          onBack={() => setStep('intensity')}
          onCrisis={() => setCrisis(true)}
        />
      )}

      {step === 'thought' && (
        <ThoughtStep
          valence={valence}
          familyId={emotion.familyId}
          sphereId={draft.causeSphere}
          onSubmit={submitThought}
          onBack={() => setStep('cause')}
          onCrisis={() => setCrisis(true)}
        />
      )}

      {step === 'body' && (
        <div className="animate-fade-up flex flex-col items-center gap-5">
          <div className="text-center">
            <h2 className="font-display text-ink text-2xl">Где это откликается в теле?</h2>
            <p className="text-ink-muted mt-1 text-sm">можно выбрать несколько мест</p>
          </div>

          <BodyMap
            valence={valence}
            value={draft.bodyZones}
            onChange={(zones) => setDraft((d) => ({ ...d, bodyZones: zones }))}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep('thought')}
              className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
            >
              ← назад
            </button>
            <button
              type="button"
              onClick={() => setStep('breathing')}
              className="bg-surface-raised text-ink ring-gold/40 hover:ring-gold hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300"
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {step === 'breathing' && (
        <BreathingExercise
          mode={valence === 'negative' ? 'release' : 'amplify'}
          title={valence === 'negative' ? 'Отпусти на выдохе' : 'Дай этому свету расти'}
          subtitle="Подыши вместе с кругом: вдох, задержка, выдох, задержка."
          skipLabel="Пропустить"
          doneLabel="Завершить"
          onFinish={finishRecord}
        />
      )}

      {step === 'done' && (
        <CompletionStep
          status={saveStatus === 'idle' ? 'saving' : saveStatus}
          affirmation={affirmation}
          onRetry={runSave}
          onReset={resetAll}
        />
      )}
    </div>
  );
}

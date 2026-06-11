'use client';

import { useRef, useState } from 'react';

import { THOUGHT_BY_ID } from '@/shared/content/background-thoughts';
import { emotionGift } from '@/shared/content/emotion-gifts';
import type { LifeSphereId } from '@/shared/content/life-spheres';
import { BreathingExercise } from '@/shared/ui/BreathingExercise';
import { CrisisSupport } from '@/shared/ui/CrisisSupport';

import { BodyMap } from './BodyMap';
import { CauseStep, type CauseValue } from './CauseStep';
import { CompletionStep } from './CompletionStep';
import { IntensityStep } from './IntensityStep';
import { ReliefStep } from './ReliefStep';
import { ThoughtStep, type ThoughtValue } from './ThoughtStep';
import type { EmotionEntryInput } from '../model/entry-schema';
import { reliefMessage } from '../model/relief-message';
import { saveEmotionEntryAction } from '../model/save-action';
import { familyValence } from '../model/valence';
import type { RecordEmotion } from '../model/types';

type Step = 'intensity' | 'cause' | 'thought' | 'body' | 'breathing' | 'relief' | 'done';

interface Draft {
  intensity: number | null;
  intensityAfter: number | null;
  causeSphere: LifeSphereId | null;
  causeCustom: string;
  thoughtId: number | null;
  thoughtCustom: string;
  bodyZones: string[];
}

const EMPTY: Draft = {
  intensity: null,
  intensityAfter: null,
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

export function RecordSteps({
  emotion,
  onReset,
  recordedFor,
}: {
  emotion: RecordEmotion;
  onReset: () => void;
  /** Бэкдейтинг из «Памяти»: день, за который пишем запись. null/undefined — обычная запись «сейчас». */
  recordedFor?: Date | null;
}) {
  const valence = familyValence(emotion.familyId);

  const [step, setStep] = useState<Step>('intensity');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [crisis, setCrisis] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Последний собранный input — чтобы «Повторить» сохраняло ровно его, а не пересобирало
  // из draft (setDraft асинхронен).
  const lastInput = useRef<EmotionEntryInput | null>(null);

  if (crisis) {
    return <CrisisSupport onBack={() => setCrisis(false)} />;
  }

  function submitIntensity(level: number): void {
    setDraft((d) => ({ ...d, intensity: level }));
    setStep('cause');
  }

  function submitCause(v: CauseValue): void {
    setDraft((d) => ({ ...d, causeSphere: v.sphereId, causeCustom: v.area }));
    setStep('thought');
  }

  function submitThought(v: ThoughtValue): void {
    setDraft((d) => ({ ...d, thoughtId: v.thoughtId, thoughtCustom: v.custom }));
    setStep('body');
  }

  function buildInput(intensityAfter: number | null): EmotionEntryInput {
    return {
      familyId: emotion.familyId,
      shadeId: emotion.shadeId,
      emotionName: emotion.name,
      emotionColor: emotion.color,
      intensity: draft.intensity ?? 1,
      intensityAfter,
      causeSphere: draft.causeSphere,
      causeCustom: draft.causeCustom,
      thoughtId: draft.thoughtId,
      thoughtCustom: draft.thoughtCustom,
      bodyZones: draft.bodyZones,
      // Полдень локального дня — далеко от границ суток, чтобы при группировке по локальному
      // дню запись гарантированно осталась в выбранном дне в любой таймзоне.
      recordedAt: recordedFor
        ? new Date(
            recordedFor.getFullYear(),
            recordedFor.getMonth(),
            recordedFor.getDate(),
            12,
          ).toISOString()
        : undefined,
    };
  }

  function runSave(input: EmotionEntryInput): void {
    setSaveStatus('saving');
    void saveEmotionEntryAction(input).then((r) => setSaveStatus('ok' in r ? 'saved' : 'error'));
  }

  // Завершение «петли облегчения»: фиксируем переоценку (или её отсутствие) и сохраняем.
  // setDraft асинхронен, поэтому строим input от явного after, а не от draft.
  function finishRelief(intensityAfter: number | null): void {
    const input = buildInput(intensityAfter);
    lastInput.current = input;
    setDraft((d) => ({ ...d, intensityAfter }));
    runSave(input);
    setStep('done');
  }

  function resetAll(): void {
    setDraft(EMPTY);
    setSaveStatus('idle');
    setStep('intensity');
    onReset();
  }

  const affirmation =
    draft.thoughtId != null ? (THOUGHT_BY_ID.get(draft.thoughtId)?.positive ?? null) : null;

  const relief = reliefMessage(valence, draft.intensity ?? 1, draft.intensityAfter);

  return (
    <div className="flex flex-col items-center gap-5 pt-2">
      <EmotionChip emotion={emotion} />

      {step === 'intensity' && (
        <IntensityStep color={emotion.color} onSubmit={submitIntensity} onBack={onReset} />
      )}

      {step === 'cause' && <CauseStep onSubmit={submitCause} onBack={() => setStep('intensity')} />}

      {step === 'thought' && (
        <ThoughtStep
          valence={valence}
          familyId={emotion.familyId}
          shadeId={emotion.shadeId}
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
          giftText={emotionGift(emotion.shadeId, emotion.familyId)}
          introText={
            valence === 'negative'
              ? 'Сделай вдох и поблагодари эмоцию за помощь'
              : 'Сделай вдох… и дай этому свету расти.'
          }
          startLabel="Наполнить светом"
          skipLabel="Пропустить"
          doneLabel="Дальше"
          onFinish={(completed) => (completed ? setStep('relief') : finishRelief(null))}
        />
      )}

      {step === 'relief' && (
        <ReliefStep color={emotion.color} valence={valence} onSubmit={finishRelief} />
      )}

      {step === 'done' && (
        <CompletionStep
          status={saveStatus === 'idle' ? 'saving' : saveStatus}
          affirmation={affirmation}
          relief={relief}
          onRetry={() => lastInput.current && runSave(lastInput.current)}
          onReset={resetAll}
        />
      )}
    </div>
  );
}

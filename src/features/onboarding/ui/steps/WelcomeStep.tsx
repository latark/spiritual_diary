'use client';

import { ContinueButton } from '../ContinueButton';

export function WelcomeStep({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-ink text-3xl">Здравствуй, {name}</h1>
      <p className="text-ink-muted leading-relaxed">
        На многих высокоразвитых планетах наблюдение за своими эмоциями считается основой духовного
        роста и входит в обучение с детства. Здесь ты сможешь развивать эту практику, повышать
        осознанность и вибрации, отслеживать свои состояния и глубже понимать путь своей души.
      </p>
      <p className="text-ink-muted leading-relaxed">
        Давай настроимся: пара минут, чтобы я узнал тебя поближе и собрал твою первую карту
        состояния.
      </p>
      <ContinueButton onClick={onNext}>Начать</ContinueButton>
    </div>
  );
}

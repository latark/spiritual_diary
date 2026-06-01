'use client';

import { ContinueButton } from '../ContinueButton';

export function WelcomeStep({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-ink text-3xl">Здравствуй, {name}</h1>
      <p className="text-ink-muted leading-relaxed">
        Это твоё тихое пространство, чтобы слышать себя. Здесь ты будешь замечать свои эмоции,
        видеть, где они живут в теле, и мягко возвращать себе равновесие. Не нужно ничего исправлять
        — только наблюдать с теплом. Давай настроимся: пара минут, чтобы я узнал тебя чуть ближе и
        собрал твою первую карту состояния.
      </p>
      <ContinueButton onClick={onNext}>Начать</ContinueButton>
    </div>
  );
}

'use client';

import { BreathingExercise } from '@/shared/ui/BreathingExercise';

export function BreathingStep({ onFinish }: { onFinish: () => void }) {
  return (
    <BreathingExercise
      mode="calm"
      cycles={2}
      title="Настройка канала"
      subtitle="Подыши вместе с кругом: вдох, задержка, выдох, задержка."
      skipLabel="Пропустить и войти"
      doneLabel="Войти в дневник"
      onFinish={onFinish}
    />
  );
}

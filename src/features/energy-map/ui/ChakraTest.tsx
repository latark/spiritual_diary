'use client';

import { useState } from 'react';

import {
  CHAKRA_ANSWER_OPTIONS,
  CHAKRA_QUESTIONS,
  computeChakraProfile,
} from '@/shared/content/chakra-test';
import type { ChakraProfile } from '@/shared/content/chakras';
import { cn } from '@/shared/lib/cn';

/**
 * Тест чакр в «Пути»: 21 вопрос по одному на экран, ответ сразу ведёт к следующему. На
 * последнем ответе считаем профиль и отдаём наверх — карта чакр и есть результат, отдельного
 * экрана-итога нет. «Назад» на первом вопросе — выход к приглашению.
 */
export function ChakraTest({
  onComplete,
  onCancel,
}: {
  onComplete: (profile: ChakraProfile) => void;
  onCancel: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = CHAKRA_QUESTIONS.length;
  const question = CHAKRA_QUESTIONS[index];

  function answer(value: number) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      onComplete(computeChakraProfile(next));
    }
  }

  function back() {
    if (index === 0) onCancel();
    else setIndex(index - 1);
  }

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={back}
          className="text-ink-muted hover:text-gold mb-3 -ml-1 text-sm transition-colors duration-200"
        >
          ← назад
        </button>
        <p className="text-ink-muted text-sm">
          Вопрос {index + 1} из {total}
        </p>
        <h2 className="font-display text-ink mt-2 text-2xl leading-snug">{question?.prompt}</h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {CHAKRA_ANSWER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => answer(opt.value)}
            className={cn(
              'bg-surface-raised text-ink rounded-lg px-4 py-3.5 text-left transition-colors duration-200',
              'hover:bg-surface-raised/70 hover:text-gold',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

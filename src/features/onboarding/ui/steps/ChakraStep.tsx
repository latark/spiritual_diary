'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import {
  CHAKRAS,
  CHAKRA_ANSWER_OPTIONS,
  CHAKRA_QUESTIONS,
  chakraStateLabel,
  computeChakraProfile,
  type ChakraProfile,
} from '../../model/chakra';
import { ContinueButton } from '../ContinueButton';

export function ChakraStep({ onNext }: { onNext: (profile: ChakraProfile) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<ChakraProfile | null>(null);

  const total = CHAKRA_QUESTIONS.length;
  const question = CHAKRA_QUESTIONS[index];

  function answer(value: number) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setProfile(computeChakraProfile(next));
    }
  }

  if (profile) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-ink text-2xl">Твоя карта чакр</h2>
          <p className="text-ink-muted mt-1 text-sm">
            Это отправная точка. Со временем карта будет меняться вместе с тобой.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {CHAKRAS.map((c) => {
            const score = profile[c.id];
            return (
              <li key={c.id} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-ink">{c.name}</span>
                  <span className="text-ink-muted">{chakraStateLabel(score)}</span>
                </div>
                <div className="bg-surface-raised h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: c.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <ContinueButton onClick={() => onNext(profile)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
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

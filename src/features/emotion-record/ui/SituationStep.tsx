'use client';

import { useRef, useState } from 'react';

import { detectCrisis } from '@/shared/safety';

import { checkCrisisAction } from '../model/crisis-check-action';

/** Нейтральный фактический пример — показывает, что ждём «что случилось», а не чувство. */
const PLACEHOLDER = 'позвонила мама, и разговор свернул не туда…';

/**
 * Колонка 1 КПТ-записи: что случилось — факт своими словами. Первый шаг записи: сначала
 * собрать ситуацию, потом отражать (порядок thought record). Поле опциональное — ритуал
 * остаётся коротким, но даже одна строка делает вопросы проработки на «Пути» точными.
 * Свободный текст → crisis-контур (§6): клиентский keyword-слой ведёт на экран поддержки
 * мгновенно, авторитетная проверка и флаг — в server action; финальная сеть — в save-action.
 */
export function SituationStep({
  onSubmit,
  onBack,
  onCrisis,
}: {
  onSubmit: (situation: string) => void;
  onBack: () => void;
  onCrisis: () => void;
}) {
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const submitting = useRef(false);

  async function submit(): Promise<void> {
    if (submitting.current) return;
    const trimmed = text.trim();
    if (!trimmed) {
      onSubmit('');
      return;
    }

    if (detectCrisis(trimmed).triggered) {
      // Гард до await: иначе повторный клик «Далее» во время записи → двойной флаг куратору.
      submitting.current = true;
      setChecking(true);
      // Флаг куратору — safety-сигнал (§6): дожидаемся записи, не fire-and-forget.
      await checkCrisisAction(trimmed, 'record_situation');
      onCrisis();
      return;
    }

    submitting.current = true;
    setChecking(true);
    try {
      const result = await checkCrisisAction(trimmed, 'record_situation');
      if (result.crisis) {
        onCrisis();
        return;
      }
      onSubmit(trimmed);
    } finally {
      submitting.current = false;
      setChecking(false);
    }
  }

  return (
    <div className="animate-fade-up flex w-full flex-col items-center gap-5">
      <div className="text-center">
        <h2 className="font-display text-ink text-2xl">Что случилось?</h2>
        <p className="text-ink-muted mt-1 text-sm">опиши, как было — что видела, что услышала</p>
      </div>

      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        maxLength={1000}
        rows={4}
        className="bg-surface-raised text-ink placeholder:text-ink-muted/50 focus:ring-gold/50 w-full max-w-md resize-none rounded-lg px-4 py-3 text-sm leading-relaxed focus:ring-1 focus:outline-none"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
        >
          ← назад
        </button>
        <button
          type="button"
          onClick={() => onSubmit('')}
          className="text-ink-muted hover:text-gold rounded-full px-3 py-2 text-sm transition-colors duration-200"
        >
          пропустить
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={checking}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft h-11 rounded-lg px-6 font-medium ring-1 transition-all duration-300 disabled:opacity-40 disabled:ring-transparent"
        >
          {checking ? '…' : 'Далее'}
        </button>
      </div>
    </div>
  );
}

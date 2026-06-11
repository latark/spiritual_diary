'use client';

import { useState } from 'react';

import { DEEPER_PROMPTS, REFLECTION_PROMPTS } from '@/shared/content/awareness-prompts';
import { detectCrisis } from '@/shared/safety';
import { CrisisSupport } from '@/shared/ui/CrisisSupport';

import { addAwarenessAction } from '../model/add-awareness-action';

/** Пример-подсказка: показывает, что «инсайт» — это рефлексия, а не пересказ ситуации. */
const PLACEHOLDER =
  'теперь я вижу: тревожилась не из-за самой работы, а из-за страха, что меня не оценят…';

/**
 * Поле записи осознания/инсайта к записи. Переиспользуется на «Пути» (возврат к чувству)
 * и в «Памяти» (любая запись). Свободный текст → crisis-фильтр (§6): клиентский keyword-слой
 * даёт мгновенный экран поддержки, авторитетная проверка и флаг куратору — в server action
 * (оно и при срабатывании не сохранит текст). Флаг safety-критичен — дожидаемся записи.
 */
export function AwarenessEditor({
  entryId,
  onSaved,
  onCancel,
}: {
  entryId: string;
  onSaved: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [crisis, setCrisis] = useState(false);
  const [deeper, setDeeper] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const prompts = deeper ? DEEPER_PROMPTS : REFLECTION_PROMPTS;
  const prompt = prompts[promptIndex % prompts.length];

  async function save(): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) {
      onCancel();
      return;
    }

    // Блокируем повторный сабмит на время записи (в т.ч. на кризисном пути).
    setStatus('saving');

    // Клиентский keyword-слой ведёт на экран поддержки мгновенно. Но решение и запись
    // флага куратору авторитетны на сервере (§6): результат action всегда дожидаемся
    // и обрабатываем, а не теряем — keyword-срабатывание клиента ⊆ серверного.
    const clientCrisis = detectCrisis(trimmed).triggered;
    if (clientCrisis) setCrisis(true);

    const result = await addAwarenessAction({ entryId, text: trimmed });
    if ('crisis' in result) {
      setCrisis(true);
    } else if ('ok' in result) {
      onSaved(trimmed);
    } else if (!clientCrisis) {
      // Ошибка записи. На экране поддержки её не показываем — приоритет за безопасностью.
      setStatus('error');
    }
  }

  if (crisis) {
    return (
      <div className="bg-surface-raised rounded-xl p-4">
        <CrisisSupport
          onBack={() => {
            setCrisis(false);
            onCancel();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-3">
      <div className="space-y-1.5">
        <p className="font-display text-ink text-lg leading-snug">{prompt}</p>
        <div className="text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <button
            type="button"
            onClick={() => setPromptIndex((i) => i + 1)}
            className="hover:text-gold underline-offset-4 transition-colors duration-200"
          >
            другой вопрос
          </button>
          <button
            type="button"
            onClick={() => {
              setDeeper((d) => !d);
              setPromptIndex(0);
            }}
            className="hover:text-gold underline-offset-4 transition-colors duration-200"
          >
            {deeper ? '← к простым вопросам' : 'исследовать глубже'}
          </button>
        </div>
      </div>

      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        maxLength={1000}
        rows={3}
        className="bg-canvas/60 text-ink placeholder:text-ink-muted/50 focus:ring-gold/40 w-full resize-none rounded-lg px-3.5 py-3 text-sm leading-relaxed focus:ring-1 focus:outline-none"
      />
      {status === 'error' && (
        <p className="text-danger text-sm">Не удалось сохранить. Попробуем ещё раз?</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
        >
          позже
        </button>
        <button
          type="button"
          onClick={save}
          disabled={status === 'saving' || !text.trim()}
          className="btn-gold mr-0 ml-auto h-10 px-5 text-sm disabled:opacity-50"
        >
          {status === 'saving' ? '…' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { INTENTION_PRESETS } from '../../model/intentions';
import { ContinueButton } from '../ContinueButton';

interface IntentionStepProps {
  busy?: boolean;
  error?: string;
  onSubmit: (intention: string) => void;
}

export function IntentionStep({ busy, error, onSubmit }: IntentionStepProps) {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-ink text-2xl">Намерение на 30 дней</h2>
        <p className="text-ink-muted mt-1 text-sm">Что для тебя сейчас важнее всего?</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INTENTION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setValue(preset)}
            className={cn(
              'rounded-full px-3.5 py-2 text-sm transition-colors duration-200',
              value === preset
                ? 'bg-gold text-canvas'
                : 'bg-surface-raised text-ink-muted hover:text-ink',
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="…или своими словами"
        className="bg-surface-raised text-ink placeholder:text-ink-muted/50 resize-none rounded-md px-4 py-3"
      />

      {error && <p className="text-danger text-sm">{error}</p>}

      <ContinueButton busy={busy} disabled={!value.trim()} onClick={() => onSubmit(value.trim())}>
        Завершить
      </ContinueButton>
    </div>
  );
}

'use client';

import { Fireflies } from '@/shared/ui/Fireflies';

export function CompletionStep({
  status,
  affirmation,
  relief,
  onRetry,
  onReset,
}: {
  status: 'saving' | 'saved' | 'error';
  affirmation: string | null;
  relief: string | null;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-7 pt-4 text-center">
      <div className="relative h-28 w-full max-w-sm">
        <Fireflies sizeScale={2} />
      </div>

      <div className="max-w-sm">
        <h2 className="font-display text-ink text-2xl">Свет принят</h2>
        {relief && <p className="text-ink mt-3 leading-relaxed">{relief}</p>}
        {affirmation && <p className="text-ink-muted mt-2 leading-relaxed">«{affirmation}»</p>}
      </div>

      <div className="flex min-h-6 flex-col items-center gap-2">
        {status === 'saving' && <p className="text-ink-muted text-xs">сохраняю запись…</p>}
        {status === 'saved' && <p className="text-ink-muted text-xs">запись сохранена</p>}
        {status === 'error' && (
          <>
            <p className="text-ink-muted text-sm">Не удалось сохранить запись.</p>
            <button type="button" onClick={onRetry} className="btn-gold h-10 px-5 text-sm">
              Повторить
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-ink-muted hover:text-gold rounded-full px-4 py-2 text-sm transition-colors duration-200"
      >
        готово
      </button>
    </div>
  );
}

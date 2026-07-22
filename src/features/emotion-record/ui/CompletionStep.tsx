'use client';

import { Fireflies } from '@/shared/ui/Fireflies';

export function CompletionStep({
  status,
  affirmation,
  relief,
  hint,
  firstRecord = false,
  onRetry,
  onReset,
}: {
  status: 'saving' | 'saved' | 'error';
  affirmation: string | null;
  relief: string | null;
  /** Мягкий вопрос-зерно: на днях к нему можно вернуться на «Пути». */
  hint?: string | null;
  /** Самая первая запись: один раз объясняем, что произошло и где это искать. */
  firstRecord?: boolean;
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

      {firstRecord && (
        <div className="bg-surface/50 max-w-sm rounded-2xl px-5 py-4">
          <p className="text-ink leading-relaxed">
            Это чувство — первая искра твоего тела света. С каждой записью оно будет расти.
          </p>
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">
            А в «Памяти» эта запись тебя дождётся — к ней всегда можно вернуться.
          </p>
        </div>
      )}

      {hint && (
        <div className="border-line/40 max-w-sm border-t pt-5">
          <p className="text-ink-muted/70 text-xs">на днях побудь с этим вопросом</p>
          <p className="font-display text-ink-muted mt-1.5 leading-relaxed">{hint}</p>
        </div>
      )}

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

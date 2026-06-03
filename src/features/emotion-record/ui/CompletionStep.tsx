'use client';

export function CompletionStep({
  status,
  affirmation,
  onRetry,
  onReset,
}: {
  status: 'saving' | 'saved' | 'error';
  affirmation: string | null;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-7 pt-4 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <span
          className="animate-glow absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--color-gold-soft) 0%, transparent 70%)',
          }}
        />
        <span className="bg-gold shadow-glow size-3 rounded-full" />
      </div>

      <div className="max-w-sm">
        <h2 className="font-display text-ink text-2xl">Свет принят</h2>
        {affirmation && <p className="text-ink-muted mt-3 leading-relaxed">«{affirmation}»</p>}
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

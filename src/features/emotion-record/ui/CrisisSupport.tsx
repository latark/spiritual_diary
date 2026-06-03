'use client';

/**
 * Мягкий экран поддержки — показывается, если свободный текст задел crisis-фильтр (§6).
 * Без диагнозов и клиники, тёплый тон, второе лицо. Контакты доверия впишет куратор/психолог
 * школы (§10) — пока место под них помечено. Полноценный crisis-флоу (флаг куратору, LLM-слой)
 * — отдельная фаза.
 */

export function CrisisSupport({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-fade-up mx-auto flex max-w-sm flex-col items-center gap-5 px-2 pt-6 text-center">
      <div className="from-gold-soft to-violet shadow-glow flex size-16 items-center justify-center rounded-full bg-gradient-to-br" />

      <div className="space-y-2">
        <h2 className="font-display text-ink text-2xl">Ты не одна</h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          То, что ты сейчас чувствуешь, важно — и тебе не обязательно проживать это в одиночку.
          Рядом всегда есть тот, кто готов выслушать и побыть с тобой.
        </p>
        <p className="text-ink-muted text-sm leading-relaxed">
          Если внутри очень тяжело, бережно к себе: побудь в тепле, сделай несколько медленных
          вдохов и, если можешь, поделись с близким человеком или со специалистом.
        </p>
      </div>

      {/* TODO(crisis-фаза, §10): сюда — реальные контакты доверия от куратора/психолога школы. */}

      <button type="button" onClick={onBack} className="btn-gold h-11 px-6">
        Я с собой рядом
      </button>
    </div>
  );
}

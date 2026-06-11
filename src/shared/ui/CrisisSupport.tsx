'use client';

/**
 * Мягкий экран поддержки — показывается, если свободный текст задел crisis-фильтр (§6).
 * Общий для всех мест свободного ввода (запись эмоции, осознание на «Пути»), поэтому
 * живёт в shared/ui, а не в отдельной фиче.
 *
 * ОСОБЫЙ регистр: НЕ голос тотема и НЕ spiritual-voice. Никакой эзотерики, метафор и
 * «низкие вибрации пройдут» — спокойный человеческий тон. Признание боли, «ты не одна»,
 * надежда как факт доступности помощи, мягкое приглашение (не приказ). Без описаний
 * методов, морализаторства, обесценивания и пустых обещаний (гайдлайны ВОЗ/AFSP).
 *
 * ⚠️ Контакты — фактические данные (см. skill crisis-safety). Куратор/психолог школы
 * (§10 #4) обязан подтвердить актуальность и состав линий ДО публикации в прод.
 */

interface Hotline {
  title: string;
  phone: string;
  /** tel:-значение без пробелов/дефисов. */
  dial: string;
  note: string;
}

const HOTLINES: Hotline[] = [
  {
    title: 'Телефон доверия для женщин',
    phone: '8 800 7000 600',
    dial: '88007000600',
    note: 'круглосуточно, бесплатно, анонимно',
  },
  {
    title: 'Телефон доверия (для всех, кому трудно)',
    phone: '8 800 2000 122',
    dial: '88002000122',
    note: 'круглосуточно, бесплатно, анонимно',
  },
];

export function CrisisSupport({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-fade-up mx-auto flex max-w-sm flex-col items-center gap-5 px-2 pt-6 text-center">
      <div className="from-gold-soft to-violet shadow-glow flex size-16 items-center justify-center rounded-full bg-gradient-to-br" />

      <div className="space-y-2">
        <h2 className="font-display text-ink text-2xl">Ты не одна</h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          То, что ты сейчас чувствуешь — настоящее. И тебе не обязательно нести это в одиночку.
        </p>
        <p className="text-ink-muted text-sm leading-relaxed">
          Рядом есть люди, которые умеют быть рядом в такие минуты. Если внутри очень тяжело, можно
          просто поговорить с живым человеком — прямо сейчас.
        </p>
      </div>

      <div className="w-full space-y-2">
        {HOTLINES.map((line) => (
          <a
            key={line.dial}
            href={`tel:${line.dial}`}
            className="bg-surface-raised ring-gold/20 hover:ring-gold/50 block rounded-xl px-4 py-3 text-left ring-1 transition-shadow duration-200"
          >
            <span className="text-ink block text-sm">{line.title}</span>
            <span className="text-gold font-display block text-lg tracking-wide">{line.phone}</span>
            <span className="text-ink-muted text-xs">{line.note}</span>
          </a>
        ))}
        <p className="text-ink-muted/80 px-1 pt-1 text-xs leading-relaxed">
          Можно и написать: психологи МЧС онлайн —{' '}
          <a
            href="https://psi.mchs.gov.ru"
            className="text-violet hover:text-gold underline-offset-2 hover:underline"
          >
            psi.mchs.gov.ru
          </a>
        </p>
      </div>

      <button type="button" onClick={onBack} className="btn-gold h-11 px-6">
        Я с собой рядом
      </button>
    </div>
  );
}

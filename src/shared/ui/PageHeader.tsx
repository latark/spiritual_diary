/**
 * Единый заголовок раздела: перекликается с подписью вкладки, чтобы пользователь сразу
 * понимал, где он. Один ритм на всех экранах (font-display + тёплый подзаголовок).
 */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-display text-ink text-3xl">{title}</h1>
      {subtitle ? <p className="text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}

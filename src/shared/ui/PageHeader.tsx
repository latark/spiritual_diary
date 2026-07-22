import type { ReactNode } from 'react';

import { Hint } from '@/shared/ui/Hint';

/**
 * Единый заголовок раздела: перекликается с подписью вкладки, чтобы пользователь сразу
 * понимал, где он. Один ритм на всех экранах (font-display + тёплый подзаголовок).
 * `hint` — необязательная подсказка-«?» рядом с заголовком для неочевидных разделов.
 */
export function PageHeader({
  title,
  subtitle,
  hint,
}: {
  title: string;
  subtitle?: string;
  hint?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-display text-ink flex items-center text-3xl">
        {title}
        {hint ? <Hint srLabel={`О разделе «${title}»`}>{hint}</Hint> : null}
      </h1>
      {subtitle ? <p className="text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}

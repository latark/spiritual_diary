import type { ReactNode } from 'react';

/** Строка-метаданные карточки: тусклый «лид» (причина — / мысль —) и значение. */
export function MetaLine({ lead, children }: { lead: string; children: ReactNode }) {
  return (
    <p className="text-ink-muted text-sm leading-relaxed">
      <span className="text-ink-muted/45">{lead} </span>
      {children}
    </p>
  );
}

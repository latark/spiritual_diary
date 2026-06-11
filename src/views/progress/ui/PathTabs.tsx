'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

type TabId = 'energy' | 'awareness';

/** «Тело и энергии» — основная природа «Пути», открывается первой. «Осознанность» — смысловая. */
const TABS: { id: TabId; label: string }[] = [
  { id: 'energy', label: 'Тело и энергии' },
  { id: 'awareness', label: 'Осознанность' },
];

/**
 * Две природы «Пути» — телесно-энергетическая (чакры) и смысловая (инсайт + осознания) —
 * разведены сегмент-переключателем, чтобы разные ритмы не смешивались в одну стопку.
 * Сервер рендерит фичи и передаёт их сюда слотами; здесь только выбор активной природы.
 */
export function PathTabs({
  energy,
  awareness,
}: {
  energy: React.ReactNode;
  awareness: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>('energy');

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Грани пути" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-shadow duration-200',
                selected
                  ? 'bg-gold text-canvas shadow-glow'
                  : 'bg-surface-raised text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" key={active} className="animate-fade-up">
        {active === 'energy' ? energy : awareness}
      </div>
    </div>
  );
}

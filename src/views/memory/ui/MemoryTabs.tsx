'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

type TabId = 'calendar' | 'awareness';

/** «Память» — архив прожитого: дни (календарь) и осмысленное (лента осознаний). */
const TABS: { id: TabId; label: string }[] = [
  { id: 'calendar', label: 'Календарь' },
  { id: 'awareness', label: 'Осознания' },
];

/**
 * Архив «Памяти» разведён сегмент-переключателем: «Календарь» (полноэкранная сетка дней) и
 * «Осознания» (лента осмысленных записей). Полная высота календаря сохраняется через цепочку
 * lg:flex-1 (родитель → этот компонент → панель календаря). Сервер рендерит фичи и передаёт
 * сюда слотами; здесь только выбор активной грани.
 */
export function MemoryTabs({
  calendar,
  awareness,
}: {
  calendar: React.ReactNode;
  awareness: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>('calendar');

  return (
    <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1">
      <div role="tablist" aria-label="Грани памяти" className="flex flex-wrap gap-2">
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

      <div
        role="tabpanel"
        key={active}
        className="animate-fade-up flex flex-col lg:min-h-0 lg:flex-1"
      >
        {active === 'calendar' ? calendar : awareness}
      </div>
    </div>
  );
}

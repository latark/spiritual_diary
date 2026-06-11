import { getInsightTrail, getMonthEntries } from '@/entities/emotion-entry/server';
import { CalendarView } from '@/features/calendar';
import { InsightTrail, toReturnMoment } from '@/features/weekly-return';

import { MemoryTabs } from './MemoryTabs';

/** Сколько осознаний тянем в ленту «Осознания» (дальше — «показать ещё» на клиенте). */
const TRAIL_LIMIT = 24;

export async function MemoryScreen() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [entries, trail] = await Promise.all([
    getMonthEntries(year, month),
    getInsightTrail(TRAIL_LIMIT),
  ]);

  const insights = trail.map(toReturnMoment);

  return (
    <div className="flex flex-col gap-4 pt-2 lg:min-h-0 lg:flex-1">
      <MemoryTabs
        calendar={<CalendarView initialYear={year} initialMonth={month} initialEntries={entries} />}
        awareness={<InsightTrail insights={insights} />}
      />
    </div>
  );
}

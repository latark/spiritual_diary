'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { generateWeeklyAnalysisAction } from '../model/generate-action';

/**
 * TODO(temp/dev): ручной прогон недельного послания для теста на своих данных, без расписания.
 * Убрать перед бетой вместе с выводом статуса — плановый запуск пойдёт через cron.
 */
export function WeeklyDevTrigger() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function run() {
    setNote(null);
    start(async () => {
      const res = await generateWeeklyAnalysisAction();
      setNote('error' in res ? res.error : res.status === 'ready' ? 'послание готово' : res.status);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="text-ink-muted/60 hover:text-gold text-xs underline underline-offset-4 transition-colors duration-200 disabled:opacity-50"
      >
        {pending ? 'проводник слушает…' : 'сгенерировать послание (temp)'}
      </button>
      {note && <span className="text-ink-muted/50 text-[11px]">{note}</span>}
    </div>
  );
}

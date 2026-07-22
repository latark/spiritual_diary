'use client';

import { useState } from 'react';

import { RecordSteps } from '@/features/emotion-record';
import { EmotionWheel, type SelectedEmotion } from '@/features/emotion-wheel';

const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

/**
 * Парсит дату бэкдейтинга из URL (`?date=YYYY-MM-DD`) в локальный день. Возвращает null,
 * если параметра нет, он битый, относится к будущему или к сегодня (сегодня = обычная запись).
 */
function parseTargetDate(raw?: string): Date | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime() ? d : null;
}

export function RecordEmotionScreen({
  targetDate,
  firstEver = false,
}: {
  targetDate?: string;
  /** Самая первая запись пользователя — для приветственной строки на экране завершения. */
  firstEver?: boolean;
}) {
  const [chosen, setChosen] = useState<SelectedEmotion | null>(null);
  const [recordedFor] = useState(() => parseTargetDate(targetDate));

  if (chosen) {
    return (
      <RecordSteps
        emotion={chosen}
        onReset={() => setChosen(null)}
        recordedFor={recordedFor}
        firstEver={firstEver}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Заголовок не нужен — колесо само спрашивает «Что ты сейчас чувствуешь?».
          При бэкдейтинге оставляем тихую строку дня — это функциональный контекст. */}
      {recordedFor && (
        <p className="text-gold/70 text-center text-sm">за {dayMonth.format(recordedFor)}</p>
      )}
      <EmotionWheel onSelect={setChosen} />
    </div>
  );
}

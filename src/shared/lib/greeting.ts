/**
 * Приветствие по времени суток в часовом поясе пользователя (profiles.timezone, IANA).
 * Считается на сервере на момент запроса — без рассинхрона при гидрации.
 */

export type DayPart = 'morning' | 'day' | 'evening' | 'night';

/** Час (0..23) в указанном часовом поясе. При ошибке — локальный час среды. */
export function hourInTimeZone(timeZone: string, now: Date = new Date()): number {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const hour = parseInt(formatted, 10);
    return Number.isFinite(hour) ? hour % 24 : now.getHours();
  } catch {
    return now.getHours();
  }
}

export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'night';
}

const GREETING: Record<DayPart, string> = {
  morning: 'Доброе утро',
  day: 'Добрый день',
  evening: 'Добрый вечер',
  night: 'Доброй ночи',
};

/**
 * Приветствие для часового пояса пользователя. Без tz — по локальному времени среды.
 * Если передано имя — добавляет обращение: «Доброй ночи, Анечка».
 */
export function greeting(
  timeZone?: string | null,
  name?: string | null,
  now: Date = new Date(),
): string {
  const hour = timeZone ? hourInTimeZone(timeZone, now) : now.getHours();
  const base = GREETING[dayPart(hour)];
  const trimmed = name?.trim();
  return trimmed ? `${base}, ${trimmed}` : base;
}

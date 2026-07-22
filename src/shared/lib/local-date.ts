/**
 * Локальная дата пользователя (по profiles.timezone) — для дневного контента, который
 * меняется в полночь его часового пояса, а не сервера. Считается на сервере на момент
 * запроса, чтобы не было рассинхрона при гидрации.
 */

/** Дата 'YYYY-MM-DD' в указанном часовом поясе. Без tz — UTC. */
export function localDate(timeZone?: string | null, now: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timeZone ?? 'UTC', ...options }).format(
      now,
    );
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', ...options }).format(now);
  }
}

/** Число дней от эпохи для строки 'YYYY-MM-DD' — основа дневных сидов/ротаций. */
export function dayNumber(isoDate: string): number {
  const parts = isoDate.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  // Битый вход дал бы NaN → Date.UTC(NaN) = NaN, и весь детерминизм ротаций/витальности молча
  // ломается (NaN % N = NaN). Лучше явно упасть, чем тихо отдавать мусор.
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error(`dayNumber: некорректная дата '${isoDate}'`);
  }
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

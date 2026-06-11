/** Мягкая подпись «когда это было» — без точных дат, в ритме недели. */
export function recalledWhen(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 2) return 'недавно';
  if (days <= 7) return 'неделю назад';
  if (days <= 13) return `${days} дней назад`;
  return 'некоторое время назад';
}

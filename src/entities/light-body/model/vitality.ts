/**
 * Витальность тела света — насколько ярко оно горит «прямо сейчас». Зависит только от
 * свежести последней записи (light_body_state.updated_at, обновляется при каждой записи).
 * Обратимый слой: гаснет в отсутствие записей, при первой же записи возвращается к 1.
 *
 * Кривая «Заметное затухание»: полная яркость первый день (grace), затем экспоненциальный
 * спад к «покою» VITALITY_FLOOR к ~7-му дню. Тело никогда не гаснет в ноль — оно всегда здесь.
 */

const DAY_MS = 86_400_000;

/** Минимум свечения — тело присутствует даже после долгой паузы. */
export const VITALITY_FLOOR = 0.25;

const GRACE_DAYS = 1;
// k подобран под опорные точки: д3 ≈0.55, д5 ≈0.38, д7 ≈ floor.
const DECAY_K = 0.46;

/** Целых дней с последней записи. null (записей не было) → Infinity → покой. */
export function daysSinceLastRecord(lastRecordAt: string | null, now: number = Date.now()): number {
  if (!lastRecordAt) return Infinity;
  const elapsed = now - new Date(lastRecordAt).getTime();
  return elapsed <= 0 ? 0 : elapsed / DAY_MS;
}

/** Яркость 0..1 по числу дней простоя. 1 — только что записал, VITALITY_FLOOR — покой. */
export function vitality(days: number): number {
  if (days <= GRACE_DAYS) return 1;
  const v = VITALITY_FLOOR + (1 - VITALITY_FLOOR) * Math.exp(-DECAY_K * (days - GRACE_DAYS));
  return v < VITALITY_FLOOR ? VITALITY_FLOOR : v;
}

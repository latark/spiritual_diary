import type { WeeklyMessage } from './types';

/**
 * Выходной фильтр §6/§7: ИИ-послание не должно содержать медицинских claim'ов и диагнозов.
 * Матчим по НАЧАЛУ слова (стем), а не подстрокой — иначе «увлечение» ловилось бы на «лечени».
 * Срабатывание → послание целиком заменяется safe-режимом (status safe_fallback), текст не
 * показываем. Это страховка поверх запретов в промпте, её нельзя ослаблять даже для тестов.
 */
const FORBIDDEN_STEMS = [
  'депресс',
  'диагноз',
  'диагност',
  'симптом',
  'терапи',
  'психотерап',
  'лечени',
  'вылеч',
  'излеч',
  'исцел',
  'невроз',
  'психоз',
  'расстройств',
  'патолог',
  'клиническ',
  'антидепрессант',
  'препарат',
  'таблетк',
  'биполярн',
  'шизофрен',
] as const;

export type FilterResult = { safe: true } | { safe: false; reason: string };

export function filterWeeklyMessage(m: WeeklyMessage): FilterResult {
  const tokens = [m.greeting, m.pattern, m.softening, m.invitation]
    .join(' ')
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

  for (const token of tokens) {
    const stem = FORBIDDEN_STEMS.find((s) => token.startsWith(s));
    if (stem) return { safe: false, reason: `медицинский маркер: «${token}»` };
  }
  return { safe: true };
}

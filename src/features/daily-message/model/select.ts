import { emotionGift } from '@/shared/content/emotion-gifts';
import { EMOTION_FAMILIES } from '@/shared/content/emotions';
import { LIFE_SPHERE_BY_ID } from '@/shared/content/life-spheres';
import { MIND_ATTITUDES } from '@/shared/content/mind-attitudes';
import { dayNumber } from '@/shared/lib/local-date';
import { hashString, mulberry32, seededShuffle } from '@/shared/lib/seed';

import type { DailyMessage } from './types';

const FAMILY_BY_ID = new Map(EMOTION_FAMILIES.map((family) => [family.id, family]));

/**
 * Чистый детерминированный выбор «послания дня». Без БД и pg_cron: одна и та же пара
 * (userId, localDate) всегда даёт один результат.
 *
 * Карта: персональная перестановка набора пар (сид от userId) → выбор по номеру дня.
 * Полный цикл равен длине набора, поэтому пара не повторяется в окне ~52 дней.
 *
 * Эмоция дня: из светлой стороны пары (positiveEmotions). Берём мягкий оттенок (сила ≤3),
 * чтобы приглашение было спокойным — наблюдать «симпатию» естественнее, чем «эйфорию».
 */
export function selectDailyMessage(userId: string, localDate: string): DailyMessage {
  const order = seededShuffle(MIND_ATTITUDES, mulberry32(hashString(userId)));
  const index = ((dayNumber(localDate) % order.length) + order.length) % order.length;
  const attitude = order[index]!;

  const rng = mulberry32(hashString(`${userId}|${localDate}`));
  const families = attitude.positiveEmotions;
  const familyId = families[Math.floor(rng() * families.length)] ?? EMOTION_FAMILIES[0]!.id;
  const family = FAMILY_BY_ID.get(familyId) ?? EMOTION_FAMILIES[0]!;
  const mild = family.shades.filter((shade) => shade.strength <= 3);
  const pool = mild.length > 0 ? mild : family.shades;
  const shade = pool[Math.floor(rng() * pool.length)]!;

  const sphere = LIFE_SPHERE_BY_ID[attitude.sphere];

  return {
    attitude: { id: attitude.id, negative: attitude.negative, positive: attitude.positive },
    sphere: { id: sphere.id, name: sphere.name, short: sphere.short },
    recommended: {
      shadeId: shade.id,
      name: shade.name,
      familyId: family.id,
      familyName: family.name,
      color: shade.color,
      gift: emotionGift(shade.id, family.id),
    },
  };
}

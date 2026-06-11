import type { LifeSphereId } from '@/shared/content/life-spheres';

/**
 * «Послание дня» — пара установок ума (тёмная сторона → светлая переустановка) на сегодня
 * плюс выведенная из светлой стороны эмоция, которую полезно сегодня пронаблюдать.
 * Карта и эмоция совмещены в одно касание, чтобы не плодить отдельный дневной контур.
 */
export interface DailyMessage {
  attitude: {
    id: number;
    /** Тёмная сторона: знакомая ограничивающая мысль. null — у пары только светлая сторона. */
    negative: string | null;
    /** Светлая сторона: переустановка. */
    positive: string;
  };
  /** Сфера жизни (= чакра), к которой относится установка. */
  sphere: {
    id: LifeSphereId;
    name: string;
    short: string;
  };
  /** Эмоция для наблюдения — светлый оттенок, созвучный переустановке. */
  recommended: {
    shadeId: string;
    name: string;
    familyId: string;
    familyName: string;
    color: string;
    /** «Дар» оттенка — на что он указывает. null, если для оттенка нет текста. */
    gift: string | null;
  };
}

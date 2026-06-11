import type { LifeSphereId } from '@/shared/content/life-spheres';

/**
 * Запись эмоции — бизнес-сущность дневника (camelCase-зеркало строки emotion_entries).
 * Живёт в entities, т.к. её читают несколько фич: календарь («Память»), возвращение и
 * лента осознаний («Путь»). Каталог эмоций статический, поэтому храним снимок имени/цвета.
 */
export interface EmotionEntry {
  id: string;
  familyId: string;
  shadeId: string;
  emotionName: string;
  emotionColor: string;
  /** Сила, выбранная при записи, 1..5. */
  intensity: number;
  /** Сила после дыхания (переоценка облегчения), 1..5. null = переоценку пропустили. */
  intensityAfter: number | null;
  /** Причина: сфера жизни (= id чакры) ИЛИ свой текст. */
  causeSphere: LifeSphereId | null;
  causeCustom: string | null;
  /** Фоновая мысль: id из каталога ИЛИ свой текст. */
  thoughtId: number | null;
  thoughtCustom: string | null;
  /** Локализация в теле — id анатомических зон. */
  bodyZones: string[];
  /** Осознание, дописанное позже на «Пути». null = к записи ещё не возвращались. */
  awareness: string | null;
  /** ISO-момент записи. */
  createdAt: string;
}

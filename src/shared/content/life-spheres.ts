/**
 * 7 сфер жизни — из школьной практики «Ревизия жизни по 7 сферам».
 * Совпадают с 7 чакрами (те же id, что в диагностике онбординга): сфера = чакра,
 * названная жизненной областью. Используются как «причина» при записи эмоции.
 */

export type LifeSphereId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown';

export interface LifeSphere {
  id: LifeSphereId;
  /** Полное название сферы. */
  name: string;
  /** Короткая метка для чипа. */
  short: string;
  /** Наводящий вопрос (из методички) — можно показывать подсказкой. */
  question: string;
}

export const LIFE_SPHERES: LifeSphere[] = [
  { id: 'root', name: 'Тело и здоровье', short: 'Тело', question: 'Как дела с телом и здоровьем?' },
  {
    id: 'sacral',
    name: 'Семья и личная жизнь',
    short: 'Семья',
    question: 'Как в семье и близких отношениях?',
  },
  {
    id: 'solar',
    name: 'Работа и финансы',
    short: 'Работа',
    question: 'Как с работой и деньгами?',
  },
  {
    id: 'heart',
    name: 'Любовь к себе и людям',
    short: 'Любовь',
    question: 'Как с любовью к себе и принятием людей?',
  },
  {
    id: 'throat',
    name: 'Творчество и реализация',
    short: 'Творчество',
    question: 'Как с самовыражением и реализацией планов?',
  },
  {
    id: 'third_eye',
    name: 'Мысли и установки',
    short: 'Мысли',
    question: 'Что с мыслями и внутренними установками?',
  },
  {
    id: 'crown',
    name: 'Связь с Высшим Я',
    short: 'Дух',
    question: 'Как со связью с Высшим Я и смыслом?',
  },
];

export const LIFE_SPHERE_BY_ID: Record<LifeSphereId, LifeSphere> = Object.fromEntries(
  LIFE_SPHERES.map((s) => [s.id, s]),
) as Record<LifeSphereId, LifeSphere>;

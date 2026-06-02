/**
 * Детектор крайних состояний — быстрый keyword-слой (RU + EN).
 *
 * CLAUDE.md §6: любой свободный пользовательский ввод обязан проходить эту проверку.
 * Это первый, грубый слой. Глубокий LLM-классификатор, запись в `crisis_flags`,
 * алерт куратору и полноценный экран поддержки — отдельная фаза crisis-safety.
 *
 * ⚠️ Этот слой НЕЛЬЗЯ выключать или ослаблять, в том числе для тестов.
 *
 * Слой намеренно склонен к перестраховке: лучше лишний раз показать мягкую поддержку,
 * чем пропустить острое состояние. Обычные тяжёлые эмоции (грусть, усталость, злость)
 * сами по себе НЕ являются триггером — ловим маркеры суицидальных намерений,
 * самоповреждения, острой безнадёжности и намерения навредить другим.
 */

export type CrisisCategory = 'suicide' | 'self_harm' | 'hopelessness' | 'harm_others';

export interface CrisisResult {
  triggered: boolean;
  categories: CrisisCategory[];
}

/** Приводим текст к виду, удобному для поиска: нижний регистр, ё→е, всё кроме букв/цифр → пробел. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Фразы-маркеры по категориям. Сопоставление — по подстроке в нормализованном тексте.
const PATTERNS: Record<CrisisCategory, string[]> = {
  suicide: [
    'покончить с собой',
    'покончу с собой',
    'счеты с жизнью',
    'наложить на себя руки',
    'не хочу жить',
    'жить не хочу',
    'не хочу больше жить',
    'больше не хочу жить',
    'не вижу смысла жить',
    'нет смысла жить',
    'смысла жить нет',
    'хочу умереть',
    'хочу сдохнуть',
    'лучше умереть',
    'лучше бы умереть',
    'лучше бы я умер',
    'уйти из жизни',
    'убить себя',
    'убью себя',
    'покончить с жизнью',
    'суицид',
    'самоубийств',
    'kill myself',
    'killing myself',
    'end my life',
    'want to die',
    'suicide',
    'suicidal',
    'no reason to live',
    'better off dead',
    'don t want to live',
  ],
  self_harm: [
    'причинить себе вред',
    'причиняю себе вред',
    'режу себя',
    'резать себя',
    'порезать себя',
    'селфхарм',
    'self harm',
    'cut myself',
    'cutting myself',
    'hurt myself',
  ],
  hopelessness: [
    'больше не могу жить',
    'не хочу существовать',
    'не хочу больше существовать',
    'всем будет лучше без меня',
    'без меня всем будет лучше',
    'никому не нужна',
    'никому не нужен',
    'нет выхода',
    'no way out',
    'cant go on',
    'can t go on',
  ],
  harm_others: [
    'хочу убить',
    'убью их',
    'убью его',
    'убью ее',
    'причинить вред другим',
    'want to kill',
    'kill them',
    'hurt others',
  ],
};

export function detectCrisis(text: string): CrisisResult {
  const normalized = normalize(text);
  if (!normalized) return { triggered: false, categories: [] };

  const categories: CrisisCategory[] = [];
  for (const category of Object.keys(PATTERNS) as CrisisCategory[]) {
    if (PATTERNS[category].some((phrase) => normalized.includes(phrase))) {
      categories.push(category);
    }
  }
  return { triggered: categories.length > 0, categories };
}

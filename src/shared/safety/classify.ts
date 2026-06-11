/**
 * Глубокий слой crisis-детекции — единая точка входа для серверной проверки текста.
 *
 * Сейчас реализован только быстрый keyword-слой (`detectCrisis`). LLM-классификатор
 * (Claude Haiku, ловит иносказания и контекст, который keyword пропускает) — следующий
 * шаг; шов под него уже здесь: функция async и возвращает `detectedBy`, поэтому
 * подключение модели не затронет вызывающий код.
 *
 * CLAUDE.md §6/§7: слой намеренно перестраховывается; в LLM нельзя слать PII —
 * обезличивать текст перед отправкой. Эту проверку нельзя ослаблять, в том числе для тестов.
 */

import { detectCrisis, type CrisisCategory } from './crisis';

export interface CrisisClassification {
  triggered: boolean;
  categories: CrisisCategory[];
  /** Какой слой поймал состояние. Маппится на crisis_flags.detected_by. */
  detectedBy: 'keyword' | 'llm';
}

export async function classifyCrisis(text: string): Promise<CrisisClassification> {
  const keyword = detectCrisis(text);
  if (keyword.triggered) {
    return { triggered: true, categories: keyword.categories, detectedBy: 'keyword' };
  }

  // TODO(crisis LLM-слой): здесь — вызов Claude Haiku по обезличенному тексту (§7).
  // Подключается одной функцией; при срабатывании вернуть detectedBy: 'llm'.
  // До тех пор глубокий слой = keyword, и чистый keyword означает «не сработало».

  return { triggered: false, categories: [], detectedBy: 'keyword' };
}

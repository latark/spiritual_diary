/**
 * Диагностика профиля чакр. 7 чакр × 3 вопроса = 21 вопрос.
 * Каждый ответ — насколько утверждение про тебя (1 «почти нет» … 4 «постоянно»).
 * Все утверждения положительные (здоровое состояние чакры) → выше балл = сильнее чакра.
 * Итог на чакру: 0..100.
 *
 * ⚠️ КОНТЕНТ-ЧЕРНОВИК вопросов и интерпретаций. Финальные формулировки —
 * из методички школы (development_plan O-05, «контент уже есть в методичке»).
 * Список чакр, id и алгоритм расчёта — финальные.
 */

export type ChakraId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown';

export interface ChakraInfo {
  id: ChakraId;
  name: string;
  color: string;
}

export const CHAKRAS: ChakraInfo[] = [
  { id: 'root', name: 'Корневая', color: '#C0392B' },
  { id: 'sacral', name: 'Сакральная', color: '#E67E22' },
  { id: 'solar', name: 'Солнечное сплетение', color: '#F1C40F' },
  { id: 'heart', name: 'Сердечная', color: '#2ECC71' },
  { id: 'throat', name: 'Горловая', color: '#3498DB' },
  { id: 'third_eye', name: 'Третий глаз', color: '#5B6BBF' },
  { id: 'crown', name: 'Коронная', color: '#9B59B6' },
];

export interface ChakraQuestion {
  id: string;
  chakra: ChakraId;
  prompt: string;
}

/** 4 варианта ответа — одинаковые для всех вопросов. */
export const CHAKRA_ANSWER_OPTIONS = [
  { label: 'Почти никогда', value: 1 },
  { label: 'Редко', value: 2 },
  { label: 'Часто', value: 3 },
  { label: 'Почти всегда', value: 4 },
] as const;

export const CHAKRA_QUESTIONS: ChakraQuestion[] = [
  // Корневая — безопасность, опора, тело
  { id: 'root_1', chakra: 'root', prompt: 'Я чувствую себя в безопасности и под защитой' },
  { id: 'root_2', chakra: 'root', prompt: 'У меня есть ощущение опоры и стабильности в жизни' },
  { id: 'root_3', chakra: 'root', prompt: 'Я хорошо чувствую своё тело и его потребности' },
  // Сакральная — чувства, удовольствие, творчество
  { id: 'sacral_1', chakra: 'sacral', prompt: 'Я позволяю себе удовольствие и радость' },
  { id: 'sacral_2', chakra: 'sacral', prompt: 'Мои эмоции текут свободно, я их не подавляю' },
  { id: 'sacral_3', chakra: 'sacral', prompt: 'Во мне живёт творческая энергия и интерес' },
  // Солнечное сплетение — воля, уверенность
  { id: 'solar_1', chakra: 'solar', prompt: 'Я уверена в себе и своих решениях' },
  { id: 'solar_2', chakra: 'solar', prompt: 'Я умею отстаивать свои границы' },
  { id: 'solar_3', chakra: 'solar', prompt: 'Я чувствую внутреннюю силу что-то менять' },
  // Сердечная — любовь, принятие
  { id: 'heart_1', chakra: 'heart', prompt: 'Я открыта любви — к себе и к другим' },
  { id: 'heart_2', chakra: 'heart', prompt: 'Я умею прощать и отпускать обиды' },
  { id: 'heart_3', chakra: 'heart', prompt: 'Я чувствую сострадание и тепло' },
  // Горловая — самовыражение, правда
  { id: 'throat_1', chakra: 'throat', prompt: 'Я говорю то, что действительно чувствую' },
  { id: 'throat_2', chakra: 'throat', prompt: 'Мне легко выражать себя словами' },
  { id: 'throat_3', chakra: 'throat', prompt: 'Я живу в согласии со своей правдой' },
  // Третий глаз — интуиция, ясность
  { id: 'third_eye_1', chakra: 'third_eye', prompt: 'Я доверяю своей интуиции' },
  { id: 'third_eye_2', chakra: 'third_eye', prompt: 'У меня ясное видение ситуаций и себя' },
  { id: 'third_eye_3', chakra: 'third_eye', prompt: 'Я замечаю знаки и внутренние подсказки' },
  // Коронная — связь, смысл
  { id: 'crown_1', chakra: 'crown', prompt: 'Я чувствую связь с чем-то большим, чем я' },
  { id: 'crown_2', chakra: 'crown', prompt: 'В моей жизни есть глубокий смысл' },
  { id: 'crown_3', chakra: 'crown', prompt: 'Я ощущаю внутренний покой и доверие к жизни' },
];

export type ChakraProfile = Record<ChakraId, number>;

/**
 * Считает профиль из ответов (map questionId → 1..4).
 * Балл чакры = среднее по её 3 вопросам, отмасштабированное в 0..100.
 */
export function computeChakraProfile(answers: Record<string, number>): ChakraProfile {
  const profile = {} as ChakraProfile;
  for (const chakra of CHAKRAS) {
    const qs = CHAKRA_QUESTIONS.filter((q) => q.chakra === chakra.id);
    const vals = qs.map((q) => answers[q.id] ?? 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = vals.length > 0 ? sum / vals.length : 0;
    profile[chakra.id] = Math.round(((avg - 1) / 3) * 100);
  }
  return profile;
}

export function chakraState(score: number): 'weak' | 'balanced' | 'strong' {
  if (score < 45) return 'weak';
  if (score < 70) return 'balanced';
  return 'strong';
}

export function chakraStateLabel(score: number): string {
  const s = chakraState(score);
  return s === 'weak' ? 'требует внимания' : s === 'balanced' ? 'в норме' : 'сильная';
}

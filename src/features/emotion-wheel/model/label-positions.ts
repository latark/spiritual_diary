// Откалибровано вручную через /wheel-calibrate (точки — центры подписей, % от размера колеса).
// joy и anger — арты пересобраны по геометрии (центрированы, единый радиус), подписи пересчитаны.
// Остальные 8 семей — прошлый вариант артов и подписей (первая калибровка).
// Источник правды для раскладки подписей; правится повторной калибровкой.

export interface Pt {
  x: number;
  y: number;
}

/** Подписи семей на общем колесе. */
export const OVERVIEW_POS: Record<string, Pt> = {
  joy: { x: 49.7, y: 16.9 },
  love: { x: 68.4, y: 22.6 },
  peace: { x: 80.7, y: 39.3 },
  interest: { x: 80.3, y: 61.7 },
  surprise: { x: 69.6, y: 79.4 },
  fear: { x: 49.9, y: 87.2 },
  sadness: { x: 29.7, y: 79.4 },
  shame: { x: 18.4, y: 62.1 },
  disgust: { x: 18.8, y: 40 },
  anger: { x: 30.9, y: 23.1 },
};

/** Центр цветка каждой семьи (joy/anger пересобраны → центр; остальные — прошлые метки). */
export const FAMILY_CENTER: Record<string, Pt> = {
  joy: { x: 50, y: 50 },
  love: { x: 50.2, y: 52.3 },
  peace: { x: 49.9, y: 52.6 },
  interest: { x: 50.1, y: 50.7 },
  surprise: { x: 50, y: 50 },
  fear: { x: 49.3, y: 50.9 },
  sadness: { x: 48.3, y: 50.6 },
  shame: { x: 50, y: 51 },
  disgust: { x: 49.8, y: 54.2 },
  anger: { x: 50, y: 50 },
};

/** Подписи оттенков внутри каждой семьи. */
export const FAMILY_POS: Record<string, Record<string, Pt>> = {
  joy: {
    joy_1: { x: 49.9, y: 18.1 },
    joy_2: { x: 70.9, y: 29.4 },
    joy_3: { x: 70.2, y: 69.2 },
    joy_4: { x: 50, y: 77.7 },
    joy_5: { x: 29.7, y: 69.9 },
    joy_6: { x: 29, y: 28.9 },
  },
  love: {
    love_1: { x: 50.1, y: 28.7 },
    love_2: { x: 68.7, y: 36.9 },
    love_3: { x: 72.9, y: 58 },
    love_4: { x: 60.2, y: 72.4 },
    love_5: { x: 40.5, y: 71.6 },
    love_6: { x: 28.5, y: 57.4 },
    love_7: { x: 31.3, y: 36.9 },
  },
  peace: {
    peace_1: { x: 50.1, y: 25.7 },
    peace_2: { x: 70.1, y: 37.3 },
    peace_3: { x: 72.3, y: 63.6 },
    peace_4: { x: 28.2, y: 62.7 },
    peace_5: { x: 29.2, y: 36.7 },
  },
  interest: {
    interest_1: { x: 50.4, y: 30 },
    interest_2: { x: 71.6, y: 50.3 },
    interest_3: { x: 50.1, y: 70.5 },
    interest_4: { x: 28, y: 50 },
  },
  surprise: {
    surprise_1: { x: 50.4, y: 29.1 },
    surprise_2: { x: 70.7, y: 49.8 },
    surprise_3: { x: 50.3, y: 70.3 },
    surprise_4: { x: 28.7, y: 49.8 },
  },
  fear: {
    fear_1: { x: 50.1, y: 30 },
    fear_2: { x: 68.3, y: 41.7 },
    fear_3: { x: 68.9, y: 60.6 },
    fear_4: { x: 48.9, y: 72.2 },
    fear_5: { x: 29.5, y: 61.1 },
    fear_6: { x: 29.4, y: 40.8 },
  },
  sadness: {
    sadness_1: { x: 48.5, y: 28.9 },
    sadness_2: { x: 68.3, y: 41.8 },
    sadness_3: { x: 67.9, y: 59 },
    sadness_4: { x: 48.4, y: 70.9 },
    sadness_5: { x: 29.4, y: 59.6 },
    sadness_6: { x: 28.8, y: 41.3 },
  },
  shame: {
    shame_1: { x: 49.8, y: 30 },
    shame_2: { x: 70.5, y: 50.4 },
    shame_3: { x: 49.5, y: 71 },
    shame_4: { x: 29, y: 49.4 },
  },
  disgust: {
    disgust_1: { x: 50, y: 32.7 },
    disgust_2: { x: 69, y: 63.9 },
    disgust_3: { x: 31.1, y: 63.6 },
  },
  anger: {
    anger_1: { x: 50.3, y: 23.1 },
    anger_2: { x: 71.3, y: 33.6 },
    anger_3: { x: 75.2, y: 55.6 },
    anger_4: { x: 61.5, y: 73.1 },
    anger_5: { x: 38.9, y: 72.6 },
    anger_6: { x: 24.8, y: 55.5 },
    anger_7: { x: 29.8, y: 33.8 },
  },
};

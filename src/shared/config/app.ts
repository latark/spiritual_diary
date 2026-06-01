export const APP = {
  /** Рабочее название, финальный нейминг — открытый вопрос (CLAUDE.md §10.6) */
  name: 'Твой духовный дневник',
  shortName: 'Дневник',
  locale: 'ru',
  /** Тихие часы уведомлений по умолчанию */
  quietHours: { start: 22, end: 8 },
} as const;

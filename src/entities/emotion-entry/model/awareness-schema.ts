import { z } from 'zod';

/**
 * Осознание (в UI — «инсайт»), дописываемое к записи на «Пути» и в «Памяти».
 * Свободный текст → проходит crisis-фильтр в server action.
 */
export const awarenessSchema = z.object({
  entryId: z.string().uuid(),
  text: z.string().trim().min(1, 'Напиши хоть пару слов').max(1000, 'Чуть короче?'),
});

export type AwarenessInput = z.infer<typeof awarenessSchema>;

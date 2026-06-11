import { z } from 'zod';

/**
 * Осознание (в UI — «инсайт»), дописываемое к записи на «Пути» и в «Памяти».
 * Свободный текст → проходит crisis-фильтр в server action.
 */
export const awarenessSchema = z.object({
  entryId: z.string().uuid(),
  // Лестница «Инсайт» синтезирует осознание из нескольких полей (по 1000 симв.) — лимит с
  // запасом под их склейку, а не под одно поле.
  text: z.string().trim().min(1, 'Напиши хоть пару слов').max(4100, 'Чуть короче?'),
});

export type AwarenessInput = z.infer<typeof awarenessSchema>;

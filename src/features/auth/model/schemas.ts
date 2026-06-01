import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(1, 'Как тебя называть?').max(80, 'Слишком длинное имя'),
  email: z.email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  consent: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === 'on' || v === 'true' || v === true, 'Нужно согласие на обработку данных'),
  marketingConsent: z.union([z.literal('on'), z.boolean()]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

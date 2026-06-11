import { z } from 'zod';

export const onboardingSchema = z.object({
  birthDate: z.string().min(1, 'Укажи дату рождения'),
  birthTime: z.string().nullable(),
  birthLocation: z.string().nullable(),
  intention: z.string().trim().min(1, 'Опиши намерение').max(500, 'Слишком длинно'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

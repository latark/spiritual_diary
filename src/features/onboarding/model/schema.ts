import { z } from 'zod';

export const onboardingSchema = z.object({
  intention: z.string().trim().min(1, 'Опиши намерение').max(500, 'Слишком длинно'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

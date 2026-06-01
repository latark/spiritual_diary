import { z } from 'zod';

const chakraProfileSchema = z.object({
  root: z.number().int().min(0).max(100),
  sacral: z.number().int().min(0).max(100),
  solar: z.number().int().min(0).max(100),
  heart: z.number().int().min(0).max(100),
  throat: z.number().int().min(0).max(100),
  third_eye: z.number().int().min(0).max(100),
  crown: z.number().int().min(0).max(100),
});

export const onboardingSchema = z.object({
  birthDate: z.string().min(1, 'Укажи дату рождения'),
  birthTime: z.string().nullable(),
  birthLocation: z.string().nullable(),
  chakraProfile: chakraProfileSchema,
  intention: z.string().trim().min(1, 'Опиши намерение').max(500, 'Слишком длинно'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

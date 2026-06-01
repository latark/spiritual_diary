import type { ChakraProfile } from './chakra';

/** Данные, собираемые за онбординг и записываемые в profiles в конце. */
export interface OnboardingData {
  birthDate: string; // yyyy-mm-dd
  birthTime: string | null; // HH:mm
  birthLocation: string | null;
  chakraProfile: ChakraProfile | null;
  intention: string;
}

export const EMPTY_ONBOARDING: OnboardingData = {
  birthDate: '',
  birthTime: null,
  birthLocation: null,
  chakraProfile: null,
  intention: '',
};

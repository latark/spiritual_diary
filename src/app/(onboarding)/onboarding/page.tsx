import { redirect } from 'next/navigation';

import { OnboardingFlow } from '@/features/onboarding';
import { getCurrentUser } from '@/shared/lib/auth';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <OnboardingFlow />;
}

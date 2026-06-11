import { redirect } from 'next/navigation';

import { OnboardingFlow } from '@/features/onboarding';
import { createSupabaseServerClient } from '@/shared/api/supabase';

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return <OnboardingFlow />;
}

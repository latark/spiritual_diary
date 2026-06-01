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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  return <OnboardingFlow name={profile?.display_name ?? ''} />;
}

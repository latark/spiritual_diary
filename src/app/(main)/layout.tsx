import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getCurrentUser, getProfile } from '@/shared/lib/auth';
import { AppShell } from '@/widgets/app-shell';

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile();
  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return <AppShell>{children}</AppShell>;
}

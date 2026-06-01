import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { AppShell } from '@/widgets/app-shell';

export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}

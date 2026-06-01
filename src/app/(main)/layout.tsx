import type { ReactNode } from 'react';

import { AppShell } from '@/widgets/app-shell';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

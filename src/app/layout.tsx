import type { Metadata, Viewport } from 'next';

import { APP } from '@/shared/config/app';
import { cormorant, inter } from '@/shared/config/fonts';
import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: APP.name,
  description: 'Духовный дневник эмоций: колесо вибраций, дыхание, световое тело.',
};

export const viewport: Viewport = {
  themeColor: '#0F0B1F',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={APP.locale} className={`${cormorant.variable} ${inter.variable} dark h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { ROUTES } from '@/shared/config/navigation';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <div>
        <h1 className="font-display text-ink text-3xl">Доброе утро</h1>
        <p className="text-ink-muted mt-1">С чего начнём сегодня?</p>
      </div>

      <Link
        href={ROUTES.record}
        className="animate-glow bg-gold text-canvas flex h-20 items-center justify-center gap-3 rounded-2xl text-lg font-medium"
      >
        <Sparkles className="size-6" strokeWidth={1.75} />
        Записать эмоцию
      </Link>
      <p className="font-display text-ink-muted -mt-5 text-center">Что ты сейчас чувствуешь?</p>
    </div>
  );
}

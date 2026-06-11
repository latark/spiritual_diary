'use client';

import { usePathname } from 'next/navigation';

/**
 * Мягкое появление контента при переходе между разделами — продукт медленный, резкая
 * смена экрана выбивает из ритма. Ключ по пути перезапускает fade-up на каждой навигации.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up flex flex-1 flex-col">
      {children}
    </div>
  );
}

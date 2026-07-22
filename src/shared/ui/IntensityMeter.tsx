import { cn } from '@/shared/lib/cn';

/**
 * Read-only шкала силы эмоции — ряд из 5 огоньков, зажжённых до `level`. Тот же образ, что
 * интерактивный `IntensityDots` при записи, но без выбора: для карточек «Памяти» и «Пути».
 * `glow` — тёплое свечение зажжённых точек (в плотной сетке календаря выключаем).
 */
export function IntensityMeter({
  level,
  color,
  size = 'sm',
  glow = true,
  className,
}: {
  level: number;
  color: string;
  size?: 'sm' | 'md';
  glow?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-1', className)} aria-label={`сила ${level} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const lit = n <= level;
        return (
          <span
            key={n}
            className={cn(
              'rounded-full transition-opacity duration-300',
              size === 'sm' ? 'size-1.5' : 'size-3',
            )}
            style={{
              backgroundColor: color,
              opacity: lit ? (glow ? 1 : 0.9) : 0.16,
              boxShadow: lit && glow ? `0 0 6px -1px ${color}` : 'none',
            }}
          />
        );
      })}
    </span>
  );
}

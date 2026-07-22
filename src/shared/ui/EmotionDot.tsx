import { cn } from '@/shared/lib/cn';

/**
 * Цветная точка эмоции. Позитив — тёплый светлячок (внешнее свечение); негатив — матовая
 * точка с тёмным ядром (inset-кольцо). Один образ для карточек «Памяти» и «Пути».
 */
export function EmotionDot({
  color,
  positive,
  size = 'md',
  className,
}: {
  color: string;
  positive: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full',
        size === 'sm' ? 'size-3' : 'size-3.5',
        className,
      )}
      style={{
        backgroundColor: color,
        boxShadow: positive ? `0 0 12px -1px ${color}` : 'inset 0 0 0 2px rgba(15, 11, 31, 0.45)',
      }}
    />
  );
}

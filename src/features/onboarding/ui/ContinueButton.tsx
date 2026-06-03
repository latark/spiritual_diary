import { cn } from '@/shared/lib/cn';

interface ContinueButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
  /** Выравнивание в блоке: по умолчанию к правому краю; 'center' — по центру. */
  align?: 'right' | 'center';
  /** Размер: 'md' (по умолчанию) или чуть меньший 'sm'. */
  size?: 'md' | 'sm';
  /** Доп. классы (добавляются последними — можно переопределить, напр. паддинг). */
  className?: string;
}

export function ContinueButton({
  children = 'Продолжить',
  disabled,
  busy,
  onClick,
  align = 'right',
  size = 'md',
  className,
}: ContinueButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className={cn(
        'btn-gold',
        align === 'center' ? 'mx-auto' : 'ms-auto me-0',
        size === 'sm' ? 'h-10 px-4 text-sm' : 'h-12',
        (disabled || busy) && 'opacity-40',
        className,
      )}
    >
      {busy ? '...' : children}
    </button>
  );
}

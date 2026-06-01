import { cn } from '@/shared/lib/cn';

interface ContinueButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
}

export function ContinueButton({
  children = 'Продолжить',
  disabled,
  busy,
  onClick,
}: ContinueButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className={cn(
        'bg-gold text-canvas hover:shadow-glow h-12 w-full rounded-lg font-medium transition-shadow duration-300',
        (disabled || busy) && 'opacity-40',
      )}
    >
      {busy ? '...' : children}
    </button>
  );
}

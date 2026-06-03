'use client';

import { useFormStatus } from 'react-dom';

import { cn } from '@/shared/lib/cn';

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}

export function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  required,
  placeholder,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink-muted text-sm">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="bg-surface-raised text-ink placeholder:text-ink-muted/50 rounded-md px-4 py-3 transition-shadow duration-300"
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn('btn-gold mt-2 h-12', pending && 'opacity-60')}
    >
      {pending ? '...' : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-danger text-sm">{message}</p>;
}

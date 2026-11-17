import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn('border-border bg-surface-1 shadow-card rounded-lg border p-4', className)}
      {...props}
    />
  );
}

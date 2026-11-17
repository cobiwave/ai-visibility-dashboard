import { cn } from '@/shared/lib/cn';

/** A grey placeholder block. Size it with the same classes as the real content. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('bg-surface-3 rounded-sm motion-safe:animate-pulse', className)}
    />
  );
}

'use client';

import { cn } from '@/shared/lib/cn';

/**
 * A toggle button: the label names the action ("Track …") and stays the same,
 * while `aria-pressed` tells screen readers whether it's currently on.
 */
export function TrackToggle({
  tracked,
  label,
  onToggle,
}: {
  tracked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={tracked}
      aria-label={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-md text-lg',
        'hover:bg-surface-3 motion-safe:duration-fast motion-safe:transition-colors',
        tracked ? 'text-warning' : 'text-text-muted',
      )}
      onClick={onToggle}
    >
      <span aria-hidden>{tracked ? '★' : '☆'}</span>
    </button>
  );
}

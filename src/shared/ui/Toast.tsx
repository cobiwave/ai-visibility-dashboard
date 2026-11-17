'use client';

import { useEffect } from 'react';

const AUTO_DISMISS_MS = 6000;

export interface ToastMessage {
  /** A new id restarts the timer even when the text repeats. */
  id: number;
  text: string;
}

/**
 * The live region is always in the DOM and only its content changes: screen
 * readers announce changes inside an existing region, not a region that
 * appears together with its text.
 */
export function Toast({
  toast,
  onDismiss,
  dismissLabel,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [toast, onDismiss]);

  return (
    <div role="status" className="fixed right-4 bottom-4 z-10 max-w-sm">
      {toast ? (
        <div className="border-danger bg-surface-2 shadow-popover flex items-start gap-3 rounded-md border p-3 text-sm">
          <p className="flex-1">{toast.text}</p>
          <button
            type="button"
            aria-label={dismissLabel}
            className="text-text-muted hover:text-text-primary rounded-sm px-1"
            onClick={onDismiss}
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

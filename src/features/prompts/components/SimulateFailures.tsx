'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SimulateFailuresState {
  simulateFailures: boolean;
  setSimulateFailures: (value: boolean) => void;
}

const SimulateFailuresContext = createContext<SimulateFailuresState | null>(null);

/**
 * Demo-only client state: the switch lives in the filter bar, the ★ mutation
 * lives in the table, and both are separate client leaves under a Server
 * Component. A context is the smallest way to share one boolean between them.
 * Not in the URL on purpose: it's a demo control, not a shareable view.
 */
export function SimulateFailuresProvider({ children }: { children: ReactNode }) {
  const [simulateFailures, setSimulateFailures] = useState(false);

  return (
    <SimulateFailuresContext value={{ simulateFailures, setSimulateFailures }}>
      {children}
    </SimulateFailuresContext>
  );
}

export function useSimulateFailures(): SimulateFailuresState {
  const state = useContext(SimulateFailuresContext);
  if (!state) throw new Error('useSimulateFailures must be used inside SimulateFailuresProvider');
  return state;
}

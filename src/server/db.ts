import 'server-only';

import { DATASET_SEED, generateDataset } from '@/server/generate-dataset';

// Built once per server instance. On Vercel each function instance has its
// own copy, so mutable state below can "revert" after a cold start. That's
// acceptable for a mock; in production this is a database.
const dataset = generateDataset(DATASET_SEED);

declare global {
  // `var` is how a property is declared on globalThis in TypeScript.
  var mockTrackedById: Map<string, boolean> | undefined;
}

// Mutable state lives next to the read-only dataset, not inside it, and on
// globalThis rather than in module scope: Next bundles Route Handlers
// separately from pages and Server Actions, so a module-level Map exists once
// per bundle. A ★ written by the action was invisible to GET /api/prompts.
// globalThis is shared by every bundle in the process (still per instance).
globalThis.mockTrackedById ??= new Map(
  dataset.prompts.map((prompt) => [prompt.id, prompt.tracked]),
);
const trackedById = globalThis.mockTrackedById;

const MIN_LATENCY_MS = 150;
const MAX_LATENCY_MS = 400;

/** Simulated network/database latency, 150–400 ms unless a value is given. */
export function sleep(
  ms = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS),
): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getBrand() {
  return dataset.brand;
}

export function getMetrics() {
  return dataset.metrics;
}

export function getAnswers() {
  return dataset.answers;
}

export function getPrompts() {
  return dataset.prompts.map((prompt) => ({
    ...prompt,
    tracked: trackedById.get(prompt.id) ?? prompt.tracked,
  }));
}

export function getPrompt(id: string) {
  return getPrompts().find((prompt) => prompt.id === id) ?? null;
}

export function getAnswersForPrompt(promptId: string) {
  return dataset.answers.filter((answer) => answer.promptId === promptId);
}

/** Returns false when the prompt doesn't exist. */
export function writeTracked(id: string, tracked: boolean): boolean {
  if (!trackedById.has(id)) return false;
  trackedById.set(id, tracked);
  return true;
}

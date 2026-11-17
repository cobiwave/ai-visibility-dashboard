const TAG_PREFIXES = {
  metrics: 'metrics:',
  prompt: 'prompt:',
  prompts: 'prompts:',
} as const;

export const cacheTags = {
  metrics: (brandId: string) => `${TAG_PREFIXES.metrics}${brandId}`,
  prompt: (id: string) => `${TAG_PREFIXES.prompt}${id}`,
  prompts: (brandId: string) => `${TAG_PREFIXES.prompts}${brandId}`,
} as const;

// Derived from the same constants the factory uses, so they can't drift.
export const ALLOWED_TAG_PREFIXES = Object.values(TAG_PREFIXES);

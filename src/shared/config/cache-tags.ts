export const cacheTags = {
  metrics: (brandId: string) => `metrics:${brandId}`,
  prompt: (id: string) => `prompt:${id}`,
  prompts: (brandId: string) => `prompts:${brandId}`,
} as const;

export const ALLOWED_TAG_PREFIXES = ['metrics:', 'prompt:', 'prompts:'] as const;

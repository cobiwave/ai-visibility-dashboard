// Enumerations every feature needs. They live in shared/ so features don't
// have to import each other just to agree on what an engine or topic is.

export const ENGINE_IDS = ['chatgpt', 'perplexity', 'gemini', 'claude', 'ai-overviews'] as const;
export type EngineId = (typeof ENGINE_IDS)[number];

export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export const TOPICS = ['subscription', 'specialty', 'price', 'delivery', 'brand'] as const;
export type Topic = (typeof TOPICS)[number];

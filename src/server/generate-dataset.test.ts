import { describe, expect, it } from 'vitest';
import { DATASET_SEED, generateDataset } from './generate-dataset';
import { ENGINE_IDS, TOPICS } from '@/shared/config/domain';

describe('generateDataset', () => {
  it('returns deep-equal data for the same seed', () => {
    expect(generateDataset(DATASET_SEED)).toEqual(generateDataset(DATASET_SEED));
  });

  it('returns different data for a different seed', () => {
    expect(generateDataset(1)).not.toEqual(generateDataset(2));
  });

  it('has 120 unique prompts with text in both locales', () => {
    const { prompts } = generateDataset(DATASET_SEED);

    expect(prompts).toHaveLength(120);
    expect(new Set(prompts.map((prompt) => prompt.id)).size).toBe(120);
    expect(prompts[0]?.id).toBe('p_001');
    for (const prompt of prompts) {
      expect(prompt.text.en.length).toBeGreaterThan(0);
      expect(prompt.text.es.length).toBeGreaterThan(0);
    }
    for (const topic of TOPICS) {
      expect(prompts.filter((prompt) => prompt.topic === topic)).toHaveLength(24);
    }
  });

  it('has one answer per prompt per engine', () => {
    const { prompts, answers } = generateDataset(DATASET_SEED);

    expect(answers).toHaveLength(prompts.length * ENGINE_IDS.length);
    for (const answer of answers) {
      expect(answer.mentioned).toBe(answer.position !== null);
      expect(answer.mentioned).toBe(answer.sentiment !== null);
    }
  });

  it('has 30 days of metrics per engine within range', () => {
    const { metrics } = generateDataset(DATASET_SEED);

    for (const engine of ENGINE_IDS) {
      const series = metrics.filter((metric) => metric.engine === engine);
      expect(new Set(series.map((metric) => metric.date)).size).toBe(30);
    }
    for (const metric of metrics) {
      expect(metric.visibilityScore).toBeGreaterThanOrEqual(0);
      expect(metric.visibilityScore).toBeLessThanOrEqual(100);
      expect(metric.shareOfVoice).toBeGreaterThanOrEqual(0);
      expect(metric.shareOfVoice).toBeLessThanOrEqual(1);
    }
  });
});

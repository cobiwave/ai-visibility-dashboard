import { describe, expect, it } from 'vitest';
import { ALLOWED_TAG_PREFIXES, cacheTags } from './cache-tags';

describe('cacheTags', () => {
  it('produces tags that start with an allowed prefix', () => {
    const tags = Object.values(cacheTags).map((makeTag) => makeTag('northwind'));

    for (const tag of tags) {
      expect(ALLOWED_TAG_PREFIXES.some((prefix) => tag.startsWith(prefix))).toBe(true);
    }
  });

  it('has one allowed prefix per factory entry', () => {
    expect(ALLOWED_TAG_PREFIXES).toHaveLength(Object.keys(cacheTags).length);
  });
});

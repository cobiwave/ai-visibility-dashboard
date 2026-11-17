import { describe, expect, it } from 'vitest';
import { pageItems } from './pagination';

describe('pageItems', () => {
  it('lists every page when there are few', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
    expect(pageItems(1, 0)).toEqual([]);
  });

  it('shows gaps around the current page', () => {
    expect(pageItems(5, 12)).toEqual([1, 'gap', 4, 5, 6, 'gap', 12]);
  });

  it('has no gap next to the edges', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 'gap', 12]);
    expect(pageItems(3, 12)).toEqual([1, 2, 3, 4, 'gap', 12]);
    expect(pageItems(12, 12)).toEqual([1, 'gap', 11, 12]);
  });
});

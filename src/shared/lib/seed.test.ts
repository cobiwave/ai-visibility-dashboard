import { describe, expect, it } from 'vitest';
import { float, int, mulberry32, pick } from './seed';

describe('mulberry32', () => {
  it('returns the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);

    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it('returns values in [0, 1)', () => {
    const rng = mulberry32(7);

    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('helpers', () => {
  it('int stays within inclusive bounds', () => {
    const rng = mulberry32(1);
    const values = Array.from({ length: 500 }, () => int(rng, 1, 3));

    expect(new Set(values)).toEqual(new Set([1, 2, 3]));
  });

  it('float stays within bounds', () => {
    const rng = mulberry32(2);

    for (let i = 0; i < 500; i++) {
      const value = float(rng, 10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThan(20);
    }
  });

  it('pick throws on an empty array', () => {
    expect(() => pick(mulberry32(3), [])).toThrow();
  });
});

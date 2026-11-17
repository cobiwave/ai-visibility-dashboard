export type Rng = () => number;

// mulberry32: a tiny, fast 32-bit PRNG. Same seed, same sequence.
// Not cryptographic; only for stable mock data.
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Float in [min, max). */
export function float(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Integer in [min, max], both inclusive. */
export function int(rng: Rng, min: number, max: number): number {
  return Math.floor(float(rng, min, max + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[int(rng, 0, items.length - 1)];

  if (item === undefined) {
    throw new Error('pick() needs a non-empty array');
  }

  return item;
}

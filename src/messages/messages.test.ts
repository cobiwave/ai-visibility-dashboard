import { describe, expect, it } from 'vitest';
import en from './en.json';
import es from './es.json';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('message catalogs', () => {
  it('en and es have identical keys', () => {
    expect(keyPaths(es).sort()).toEqual(keyPaths(en).sort());
  });
});

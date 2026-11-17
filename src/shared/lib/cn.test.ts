import { describe, expect, it } from 'vitest';
import { cn } from '@/shared/lib/cn';

describe('cn', () => {
  it('joins classes and keeps the last conflicting utility', () => {
    expect(cn('px-2 text-sm', 'px-4', { 'text-base': true })).toBe('px-4 text-base');
  });
});

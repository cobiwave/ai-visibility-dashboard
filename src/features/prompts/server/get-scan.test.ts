import { describe, expect, it } from 'vitest';
import {
  getScan,
  parseScanId,
  SCAN_DURATION_MS,
  SCAN_QUEUED_MS,
  scanAt,
  toScanId,
} from './get-scan';

const startedAt = '2026-11-17T12:00:00.000Z';
const t0 = Date.parse(startedAt);

describe('scanAt', () => {
  it('is queued right after starting', () => {
    expect(scanAt('scan_1', startedAt, t0)).toMatchObject({ status: 'queued', progress: 0 });
  });

  it('is running with progress proportional to elapsed time', () => {
    expect(scanAt('scan_1', startedAt, t0 + SCAN_QUEUED_MS)).toMatchObject({ status: 'running' });
    expect(scanAt('scan_1', startedAt, t0 + SCAN_DURATION_MS / 2)).toMatchObject({
      status: 'running',
      progress: 0.5,
    });
  });

  it('progress never decreases over time', () => {
    const progress = [0, 1000, 3000, 6000, 7999, 8000, 20_000].map(
      (elapsed) => scanAt('scan_1', startedAt, t0 + elapsed).progress,
    );

    expect(progress).toEqual(progress.toSorted((a, b) => a - b));
  });

  it('is done at ~8 s and stays done', () => {
    expect(scanAt('scan_1', startedAt, t0 + SCAN_DURATION_MS)).toMatchObject({
      status: 'done',
      progress: 1,
    });
    expect(scanAt('scan_1', startedAt, t0 + 60_000)).toMatchObject({ status: 'done', progress: 1 });
  });
});

describe('scan ids', () => {
  it('round-trips the start time through the id', () => {
    expect(parseScanId(toScanId(t0))).toBe(t0);
  });

  it.each(['scan_1', 'scan_abc', `x_${String(t0)}`, `scan_${String(t0)}0`, ''])(
    'rejects %j',
    (id) => {
      expect(parseScanId(id)).toBeNull();
    },
  );

  it('any instance derives the same state from the id alone', async () => {
    const id = toScanId(t0);

    await expect(getScan(id, t0 + SCAN_DURATION_MS / 2)).resolves.toMatchObject({
      id,
      status: 'running',
      progress: 0.5,
    });
    await expect(getScan(id, t0 + SCAN_DURATION_MS)).resolves.toMatchObject({ status: 'done' });
  });

  it('returns null for unknown or future scans', async () => {
    await expect(getScan('scan_nope', t0)).resolves.toBeNull();
    await expect(getScan(toScanId(t0 + 1000), t0)).resolves.toBeNull();
  });
});

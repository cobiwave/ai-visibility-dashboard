import { describe, expect, it } from 'vitest';
import { secretsMatch, validateRevalidateRequest } from './revalidate-request';

const SECRET = 'test-secret';
const valid = { secret: SECRET, expectedSecret: SECRET, body: { tags: ['metrics:northwind'] } };

describe('secretsMatch', () => {
  it('matches equal secrets and rejects different ones of any length', () => {
    expect(secretsMatch(SECRET, SECRET)).toBe(true);
    expect(secretsMatch('test-secreT', SECRET)).toBe(false);
    expect(secretsMatch('short', SECRET)).toBe(false);
    expect(secretsMatch('', SECRET)).toBe(false);
  });
});

describe('validateRevalidateRequest', () => {
  it('accepts a correct secret and allow-listed tags', () => {
    expect(
      validateRevalidateRequest({
        ...valid,
        body: { tags: ['metrics:northwind', 'prompts:northwind', 'prompt:p_001'] },
      }),
    ).toEqual({
      ok: true,
      tags: ['metrics:northwind', 'prompts:northwind', 'prompt:p_001'],
    });
  });

  it('fails closed when the server has no secret configured', () => {
    expect(validateRevalidateRequest({ ...valid, expectedSecret: undefined })).toMatchObject({
      status: 500,
    });
    expect(validateRevalidateRequest({ ...valid, secret: '', expectedSecret: '' })).toMatchObject({
      status: 500,
    });
  });

  it('returns 401 for a missing or wrong secret', () => {
    expect(validateRevalidateRequest({ ...valid, secret: null })).toMatchObject({
      status: 401,
      error: 'unauthorized',
    });
    expect(validateRevalidateRequest({ ...valid, secret: 'nope' })).toMatchObject({ status: 401 });
  });

  it('checks the secret before the body', () => {
    expect(validateRevalidateRequest({ ...valid, secret: 'nope', body: null })).toMatchObject({
      status: 401,
    });
  });

  it.each([
    ['no body', null],
    ['not an object', 'metrics:northwind'],
    ['missing tags', {}],
    ['empty tags', { tags: [] }],
    ['non-string tag', { tags: [42] }],
    ['empty string tag', { tags: [''] }],
    ['tag over 256 chars', { tags: [`metrics:${'x'.repeat(256)}`] }],
  ])('returns 400 invalid_body for %s', (_, body) => {
    expect(validateRevalidateRequest({ ...valid, body })).toMatchObject({
      status: 400,
      error: 'invalid_body',
    });
  });

  it.each([
    ['unknown prefix', ['users:northwind']],
    ['prefix only', ['metrics:']],
    ['one bad tag among good ones', ['metrics:northwind', 'admin']],
  ])('returns 400 tag_not_allowed for %s', (_, tags) => {
    expect(validateRevalidateRequest({ ...valid, body: { tags } })).toMatchObject({
      status: 400,
      error: 'tag_not_allowed',
    });
  });
});

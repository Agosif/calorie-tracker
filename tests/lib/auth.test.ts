import { describe, expect, test, beforeAll } from 'vitest';
import { signSession, verifySession } from '@/lib/auth';

beforeAll(() => {
  process.env.COOKIE_SECRET = '0'.repeat(64);
});

describe('auth', () => {
  test('signSession then verifySession returns the userId', async () => {
    const token = await signSession(1);
    const userId = await verifySession(token);
    expect(userId).toBe(1);
  });

  test('verifySession returns null for tampered token', async () => {
    const token = await signSession(1);
    const tampered = token.slice(0, -2) + 'xx';
    const userId = await verifySession(tampered);
    expect(userId).toBeNull();
  });

  test('verifySession returns null for empty string', async () => {
    expect(await verifySession('')).toBeNull();
  });

  test('verifySession returns null for garbage input', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull();
  });
});

import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from './auth';

export async function getUserId(): Promise<number | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value ?? '';
  return await verifySession(token);
}

export async function requireUserId(): Promise<number> {
  const id = await getUserId();
  if (!id) throw new Error('unauthenticated');
  return id;
}

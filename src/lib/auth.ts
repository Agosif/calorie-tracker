import { SignJWT, jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error('COOKIE_SECRET not set');
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: number): Promise<string> {
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const uid = payload.uid;
    return typeof uid === 'number' ? uid : null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'ct_session';

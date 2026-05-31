import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signSession, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  if (body.data.password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'wrong password' }, { status: 401 });
  }

  const [user] = await db.select().from(users).limit(1);
  if (!user) return NextResponse.json({ error: 'no user seeded' }, { status: 500 });

  const token = await signSession(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

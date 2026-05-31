import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireUserId } from '@/lib/session';

export async function GET() {
  const userId = await requireUserId();
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  return NextResponse.json(u);
}

const patchSchema = z.object({
  dailyCalorieGoal: z.number().int().positive(),
  dailyProteinGoalG: z.number().int().nonnegative(),
  dailyCarbGoalG: z.number().int().nonnegative(),
  dailyFatGoalG: z.number().int().nonnegative(),
});

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  const body = patchSchema.parse(await req.json());
  const [u] = await db.update(users).set(body).where(eq(users.id, userId)).returning();
  return NextResponse.json(u);
}

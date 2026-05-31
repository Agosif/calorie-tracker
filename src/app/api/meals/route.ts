import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, gte, lt, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';
import { dayBoundsUtc, todayKey } from '@/lib/date';

const createSchema = z.object({
  consumedAt: z.string().datetime().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().min(1),
  calories: z.number().int().nonnegative(),
  proteinG: z.number().int().nonnegative(),
  carbsG: z.number().int().nonnegative(),
  fatG: z.number().int().nonnegative(),
  fiberG: z.number().int().nonnegative().default(0),
  sugarG: z.number().int().nonnegative().default(0),
  sodiumMg: z.number().int().nonnegative().default(0),
  satFatG: z.number().int().nonnegative().default(0),
  aiConfidence: z.number().min(0).max(1).nullable().optional(),
  source: z.enum(['photo', 'manual']),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  const body = createSchema.parse(await req.json());

  const [row] = await db
    .insert(meals)
    .values({
      userId,
      consumedAt: body.consumedAt ? new Date(body.consumedAt) : undefined,
      mealType: body.mealType,
      name: body.name,
      calories: body.calories,
      proteinG: body.proteinG,
      carbsG: body.carbsG,
      fatG: body.fatG,
      fiberG: body.fiberG,
      sugarG: body.sugarG,
      sodiumMg: body.sodiumMg,
      satFatG: body.satFatG,
      aiConfidence: body.aiConfidence ?? null,
      source: body.source,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(row);
}

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  const dateKey = req.nextUrl.searchParams.get('date') ?? todayKey();
  const { start, end } = dayBoundsUtc(dateKey);

  const rows = await db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.consumedAt, start), lt(meals.consumedAt, end)))
    .orderBy(desc(meals.consumedAt));

  return NextResponse.json(rows);
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  calories: z.number().int().nonnegative().optional(),
  proteinG: z.number().int().nonnegative().optional(),
  carbsG: z.number().int().nonnegative().optional(),
  fatG: z.number().int().nonnegative().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  notes: z.string().nullable().optional(),
  consumedAt: z.string().datetime().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const body = patchSchema.parse(await req.json());

  const patch: Record<string, unknown> = { ...body };
  if (body.consumedAt) patch.consumedAt = new Date(body.consumedAt);

  const [row] = await db
    .update(meals)
    .set(patch)
    .where(and(eq(meals.id, Number(id)), eq(meals.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await ctx.params;

  const [row] = await db
    .delete(meals)
    .where(and(eq(meals.id, Number(id)), eq(meals.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

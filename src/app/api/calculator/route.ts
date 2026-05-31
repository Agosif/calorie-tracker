import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireUserId } from '@/lib/session';
import { calculateGoals } from '@/lib/calculator';

export async function GET() {
  const userId = await requireUserId();
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  return NextResponse.json({
    heightCm: u.heightCm,
    weightKg: u.weightKg,
    bodyFatPct: u.bodyFatPct,
    age: u.age,
    sex: u.sex,
    activityLevel: u.activityLevel,
    goal: u.goal,
    goalPace: u.goalPace,
  });
}

const saveSchema = z.object({
  heightCm: z.number().int().positive(),
  weightKg: z.number().positive(),
  bodyFatPct: z.number().min(0).max(70).nullable().optional(),
  age: z.number().int().positive().max(120),
  sex: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  goalPace: z.enum(['slow', 'moderate', 'fast']),
  applyToGoals: z.boolean().default(false),
});

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  const body = saveSchema.parse(await req.json());

  const computed = calculateGoals({
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    age: body.age,
    sex: body.sex,
    activityLevel: body.activityLevel,
    goal: body.goal,
    goalPace: body.goalPace,
    bodyFatPct: body.bodyFatPct ?? null,
  });

  const update: Record<string, unknown> = {
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    bodyFatPct: body.bodyFatPct ?? null,
    age: body.age,
    sex: body.sex,
    activityLevel: body.activityLevel,
    goal: body.goal,
    goalPace: body.goalPace,
  };

  if (body.applyToGoals) {
    update.dailyCalorieGoal = computed.targetCalories;
    update.dailyProteinGoalG = computed.proteinG;
    update.dailyCarbGoalG = computed.carbsG;
    update.dailyFatGoalG = computed.fatG;
    update.dailyFiberGoalG = computed.fiberG;
    update.dailySugarGoalG = computed.sugarG;
    update.dailySodiumGoalMg = computed.sodiumMg;
    update.dailySatFatGoalG = computed.satFatG;
  }

  await db.update(users).set(update).where(eq(users.id, userId));

  return NextResponse.json({ stats: body, computed, applied: body.applyToGoals });
}

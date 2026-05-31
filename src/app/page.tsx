import Link from 'next/link';
import { and, eq, gte, lt, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';
import { dayBoundsUtc, todayKey } from '@/lib/date';
import { CalorieRing } from '@/components/calorie-ring';
import { MacroBars } from '@/components/macro-bars';
import { MealCard } from '@/components/meal-card';
import { buttonVariants } from '@/components/ui/button';

export default async function TodayPage() {
  const userId = await requireUserId();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const { start, end } = dayBoundsUtc(todayKey());

  const rows = await db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.consumedAt, start), lt(meals.consumedAt, end)))
    .orderBy(desc(meals.consumedAt));

  const totals = rows.reduce(
    (a, m) => ({
      cal: a.cal + m.calories,
      p: a.p + m.proteinG,
      c: a.c + m.carbsG,
      f: a.f + m.fatG,
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );

  const remaining = Math.max(0, user.dailyCalorieGoal - totals.cal);

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-lg font-semibold">Today</h1>
        <div className="flex gap-4">
          <Link href="/history" className="text-sm text-stone-600">History</Link>
          <Link href="/settings" className="text-sm text-stone-600">Settings</Link>
        </div>
      </header>

      <div className="py-6">
        <CalorieRing remaining={remaining} goal={user.dailyCalorieGoal} />
      </div>

      <MacroBars
        macros={[
          { label: 'Protein', have: totals.p, goal: user.dailyProteinGoalG, color: '#5C8C5A' },
          { label: 'Carbs',   have: totals.c, goal: user.dailyCarbGoalG,    color: '#FF6B35' },
          { label: 'Fat',     have: totals.f, goal: user.dailyFatGoalG,     color: '#A78BFA' },
        ]}
      />

      <section className="mt-6 px-4 space-y-2">
        {rows.length === 0 ? (
          <p className="text-stone-500 text-center py-6">No meals logged yet today.</p>
        ) : (
          rows.map((m) => <MealCard key={m.id} meal={m} />)
        )}
      </section>

      <div className="fixed bottom-6 inset-x-0 flex justify-center items-center gap-3 px-6">
        <Link href="/log" className={buttonVariants({ variant: 'outline' })}>+ Manual</Link>
        <Link
          href="/scan"
          className={buttonVariants({ size: 'lg', className: 'h-16 w-16 rounded-full text-3xl' })}
        >
          📷
        </Link>
      </div>
    </main>
  );
}

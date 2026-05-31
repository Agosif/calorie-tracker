import { and, eq, gte, lt, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { db } from '@/lib/db';
import { users, meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';
import { dayBoundsUtc, todayKey } from '@/lib/date';
import { CalorieTrackerCard } from '@/components/ui/tracker-card';

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
      fiber: a.fiber + m.fiberG,
      sugar: a.sugar + m.sugarG,
      sodium: a.sodium + m.sodiumMg,
      satFat: a.satFat + m.satFatG,
    }),
    { cal: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0, sodium: 0, satFat: 0 },
  );

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-12">
      <header className="flex justify-between items-center p-4 max-w-sm mx-auto">
        <h1 className="text-lg font-semibold">Today</h1>
        <div className="flex gap-4">
          <Link href="/history" className="text-sm text-stone-600 dark:text-stone-400">History</Link>
          <Link href="/settings" className="text-sm text-stone-600 dark:text-stone-400">Settings</Link>
        </div>
      </header>

      <div className="px-4 flex justify-center">
        <CalorieTrackerCard
          icon={<Activity className="h-6 w-6" />}
          title="Daily intake"
          subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          currentCalories={totals.cal}
          goalCalories={user.dailyCalorieGoal}
          nutrients={[
            { label: 'Protein', current: totals.p,      goal: user.dailyProteinGoalG,   unit: 'g' },
            { label: 'Carbs',   current: totals.c,      goal: user.dailyCarbGoalG,      unit: 'g' },
            { label: 'Fat',     current: totals.f,      goal: user.dailyFatGoalG,       unit: 'g' },
            { label: 'Fiber',   current: totals.fiber,  goal: user.dailyFiberGoalG,     unit: 'g' },
            { label: 'Sugar',   current: totals.sugar,  goal: user.dailySugarGoalG,     unit: 'g' },
            { label: 'Sat fat', current: totals.satFat, goal: user.dailySatFatGoalG,    unit: 'g' },
            { label: 'Sodium',  current: totals.sodium, goal: user.dailySodiumGoalMg,   unit: 'mg' },
          ]}
          todaysMeals={rows.map((m) => ({
            id: m.id,
            name: m.name,
            calories: m.calories,
            mealType: m.mealType,
          }))}
        />
      </div>
    </main>
  );
}

import Link from 'next/link';
import { and, eq, gte, lt, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';
import { dayBoundsUtc } from '@/lib/date';
import { MealCard } from '@/components/meal-card';

export default async function DayDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const userId = await requireUserId();
  const { start, end } = dayBoundsUtc(date);

  const rows = await db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.consumedAt, start), lt(meals.consumedAt, end)))
    .orderBy(desc(meals.consumedAt));

  const total = rows.reduce((s, m) => s + m.calories, 0);

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <header className="flex items-center justify-between mb-4">
        <Link href="/history" className="text-sm">← History</Link>
        <h1 className="text-lg font-semibold">{date}</h1>
        <span />
      </header>
      <p className="text-center mb-4 text-stone-700">
        Total: <span className="font-semibold tabular-nums">{total}</span> cal
      </p>
      <div className="space-y-2">
        {rows.map((m) => <MealCard key={m.id} meal={m} />)}
        {rows.length === 0 && <p className="text-stone-500 text-center">No meals.</p>}
      </div>
    </main>
  );
}

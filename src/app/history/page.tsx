import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';

type Day = { date_key: string; calories: number; meal_count: number };

export default async function HistoryPage() {
  const userId = await requireUserId();
  const result = await db.execute(sql`
    SELECT
      to_char(consumed_at AT TIME ZONE 'Europe/Bratislava', 'YYYY-MM-DD') AS date_key,
      SUM(calories)::int AS calories,
      COUNT(*)::int AS meal_count
    FROM ${meals}
    WHERE user_id = ${userId}
    GROUP BY date_key
    ORDER BY date_key DESC
    LIMIT 60
  `);

  const days = (result.rows ?? result) as unknown as Day[];

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <header className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm">← Today</Link>
        <h1 className="text-lg font-semibold">History</h1>
        <span />
      </header>
      <ul className="space-y-2">
        {days.map((d) => (
          <li key={d.date_key}>
            <Link
              href={`/history/${d.date_key}`}
              className="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-200"
            >
              <div>
                <div className="font-medium">{d.date_key}</div>
                <div className="text-xs text-stone-500">{d.meal_count} meal{d.meal_count === 1 ? '' : 's'}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular-nums">{d.calories}</div>
                <div className="text-xs text-stone-500">cal</div>
              </div>
            </Link>
          </li>
        ))}
        {days.length === 0 && <p className="text-stone-500 text-center mt-12">No history yet.</p>}
      </ul>
    </main>
  );
}

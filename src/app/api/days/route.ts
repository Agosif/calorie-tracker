import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meals } from '@/lib/schema';
import { requireUserId } from '@/lib/session';

export async function GET() {
  const userId = await requireUserId();

  const result = await db.execute(sql`
    SELECT
      to_char(consumed_at AT TIME ZONE 'Europe/Bratislava', 'YYYY-MM-DD') AS date_key,
      SUM(calories)::int AS calories,
      SUM(protein_g)::int AS protein_g,
      SUM(carbs_g)::int AS carbs_g,
      SUM(fat_g)::int AS fat_g,
      COUNT(*)::int AS meal_count
    FROM ${meals}
    WHERE user_id = ${userId}
    GROUP BY date_key
    ORDER BY date_key DESC
    LIMIT 60
  `);

  return NextResponse.json(result.rows ?? result);
}

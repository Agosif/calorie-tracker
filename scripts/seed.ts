import { db } from '../src/lib/db';
import { users } from '../src/lib/schema';

async function main() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log('User already exists, skipping seed');
    return;
  }
  const [user] = await db.insert(users).values({}).returning();
  console.log('Seeded user', user);
}

main().catch((e) => { console.error(e); process.exit(1); });

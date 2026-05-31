'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type GoalKey =
  | 'dailyCalorieGoal'
  | 'dailyProteinGoalG'
  | 'dailyCarbGoalG'
  | 'dailyFatGoalG'
  | 'dailyFiberGoalG'
  | 'dailySugarGoalG'
  | 'dailySodiumGoalMg'
  | 'dailySatFatGoalG';

const GOAL_FIELDS: { key: GoalKey; label: string; unit: string }[] = [
  { key: 'dailyCalorieGoal',   label: 'Calories',  unit: 'kcal' },
  { key: 'dailyProteinGoalG',  label: 'Protein',   unit: 'g' },
  { key: 'dailyCarbGoalG',     label: 'Carbs',     unit: 'g' },
  { key: 'dailyFatGoalG',      label: 'Fat',       unit: 'g' },
  { key: 'dailyFiberGoalG',    label: 'Fiber',     unit: 'g' },
  { key: 'dailySugarGoalG',    label: 'Sugar',     unit: 'g' },
  { key: 'dailySodiumGoalMg',  label: 'Sodium',    unit: 'mg' },
  { key: 'dailySatFatGoalG',   label: 'Sat fat',   unit: 'g' },
];

type GoalsState = Record<GoalKey, string>;

export default function SettingsPage() {
  const router = useRouter();
  const [g, setG] = useState<GoalsState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((u) => {
      setG({
        dailyCalorieGoal:   String(u.dailyCalorieGoal),
        dailyProteinGoalG:  String(u.dailyProteinGoalG),
        dailyCarbGoalG:     String(u.dailyCarbGoalG),
        dailyFatGoalG:      String(u.dailyFatGoalG),
        dailyFiberGoalG:    String(u.dailyFiberGoalG),
        dailySugarGoalG:    String(u.dailySugarGoalG),
        dailySodiumGoalMg:  String(u.dailySodiumGoalMg),
        dailySatFatGoalG:   String(u.dailySatFatGoalG),
      });
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!g) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dailyCalorieGoal:  Number(g.dailyCalorieGoal),
        dailyProteinGoalG: Number(g.dailyProteinGoalG),
        dailyCarbGoalG:    Number(g.dailyCarbGoalG),
        dailyFatGoalG:     Number(g.dailyFatGoalG),
        dailyFiberGoalG:   Number(g.dailyFiberGoalG),
        dailySugarGoalG:   Number(g.dailySugarGoalG),
        dailySodiumGoalMg: Number(g.dailySodiumGoalMg),
        dailySatFatGoalG:  Number(g.dailySatFatGoalG),
      }),
    });
    setSaving(false);
    router.replace('/');
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.replace('/login');
  }

  if (!g) return <main className="p-6">Loading…</main>;

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <header className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm">← Today</Link>
        <h1 className="text-lg font-semibold">Settings</h1>
        <span />
      </header>
      <form onSubmit={save} className="space-y-3 max-w-md">
        <p className="text-sm text-stone-600">Daily goals</p>
        {GOAL_FIELDS.map((f) => (
          <div key={f.key}>
            <Label className="text-xs">
              {f.label} ({f.unit})
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              value={g[f.key]}
              onChange={(e) => setG({ ...g, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </form>

      <hr className="my-8 border-stone-200" />
      <Button variant="outline" onClick={logout} className="w-full">Log out</Button>
    </main>
  );
}

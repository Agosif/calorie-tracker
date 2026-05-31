'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Goals = { calorie: string; protein: string; carb: string; fat: string };

export default function SettingsPage() {
  const router = useRouter();
  const [g, setG] = useState<Goals>({ calorie: '', protein: '', carb: '', fat: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((u) => {
      setG({
        calorie: String(u.dailyCalorieGoal),
        protein: String(u.dailyProteinGoalG),
        carb: String(u.dailyCarbGoalG),
        fat: String(u.dailyFatGoalG),
      });
      setLoading(false);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dailyCalorieGoal: Number(g.calorie),
        dailyProteinGoalG: Number(g.protein),
        dailyCarbGoalG: Number(g.carb),
        dailyFatGoalG: Number(g.fat),
      }),
    });
    setSaving(false);
    router.replace('/');
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.replace('/login');
  }

  if (loading) return <main className="p-6">Loading…</main>;

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <header className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm">← Today</Link>
        <h1 className="text-lg font-semibold">Settings</h1>
        <span />
      </header>
      <form onSubmit={save} className="space-y-4 max-w-md">
        {(['calorie','protein','carb','fat'] as const).map((k) => (
          <div key={k}>
            <Label className="capitalize">{k} goal {k === 'calorie' ? '(cal)' : '(g)'}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={g[k]}
              onChange={(e) => setG({ ...g, [k]: e.target.value })}
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

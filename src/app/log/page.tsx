'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function LogPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<typeof TYPES[number]>('snack');
  const [saving, setSaving] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealType,
        name,
        calories: Number(calories) || 0,
        proteinG: Number(protein) || 0,
        carbsG: Number(carbs) || 0,
        fatG: Number(fat) || 0,
        source: 'manual',
      }),
    });
    setSaving(false);
    if (res.ok) router.replace('/');
  }

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <h1 className="text-xl font-semibold mb-4">Manual entry</h1>
      <form onSubmit={onSave} className="space-y-4 max-w-md">
        <div>
          <Label>What did you eat?</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Calories</Label>
            <Input type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} required />
          </div>
          <div>
            <Label>Protein (g)</Label>
            <Input type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div>
            <Label>Carbs (g)</Label>
            <Input type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div>
            <Label>Fat (g)</Label>
            <Input type="number" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Meal</Label>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {TYPES.map((t) => (
              <Button
                key={t}
                variant={mealType === t ? 'default' : 'outline'}
                onClick={() => setMealType(t)}
                type="button"
                size="sm"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Logging...' : 'Log meal'}
        </Button>
      </form>
    </main>
  );
}

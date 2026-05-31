'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

type NumField = 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG' | 'sugarG' | 'sodiumMg' | 'satFatG';

const FIELDS: { key: NumField; label: string; unit: string }[] = [
  { key: 'calories',  label: 'Calories', unit: 'kcal' },
  { key: 'proteinG',  label: 'Protein',  unit: 'g' },
  { key: 'carbsG',    label: 'Carbs',    unit: 'g' },
  { key: 'fatG',      label: 'Fat',      unit: 'g' },
  { key: 'fiberG',    label: 'Fiber',    unit: 'g' },
  { key: 'sugarG',    label: 'Sugar',    unit: 'g' },
  { key: 'sodiumMg',  label: 'Sodium',   unit: 'mg' },
  { key: 'satFatG',   label: 'Sat fat',  unit: 'g' },
];

export default function LogPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<NumField, string>>({
    calories: '', proteinG: '', carbsG: '', fatG: '',
    fiberG: '', sugarG: '', sodiumMg: '', satFatG: '',
  });
  const [mealType, setMealType] = useState<typeof TYPES[number]>('snack');
  const [saving, setSaving] = useState(false);

  function set(key: NumField, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealType,
        name,
        calories: Number(values.calories) || 0,
        proteinG: Number(values.proteinG) || 0,
        carbsG: Number(values.carbsG) || 0,
        fatG: Number(values.fatG) || 0,
        fiberG: Number(values.fiberG) || 0,
        sugarG: Number(values.sugarG) || 0,
        sodiumMg: Number(values.sodiumMg) || 0,
        satFatG: Number(values.satFatG) || 0,
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
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label className="text-xs">
                {f.label} ({f.unit})
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                required={f.key === 'calories'}
              />
            </div>
          ))}
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

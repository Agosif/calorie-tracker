'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  initial: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    confidence: number;
    notes?: string;
  };
};

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function ConfirmCard({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [calories, setCalories] = useState(String(initial.calories));
  const [protein, setProtein] = useState(String(initial.proteinG));
  const [carbs, setCarbs] = useState(String(initial.carbsG));
  const [fat, setFat] = useState(String(initial.fatG));
  const [mealType, setMealType] = useState<typeof TYPES[number]>(guessMealType());
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealType,
        name,
        calories: Number(calories),
        proteinG: Number(protein),
        carbsG: Number(carbs),
        fatG: Number(fat),
        aiConfidence: initial.confidence,
        source: 'photo',
        notes: initial.notes,
      }),
    });
    setSaving(false);
    if (res.ok) router.replace('/');
  }

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(['Calories', 'Protein g', 'Carbs g', 'Fat g'] as const).map((label, i) => (
          <div key={label}>
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={[calories, protein, carbs, fat][i]}
              onChange={(e) => [setCalories, setProtein, setCarbs, setFat][i](e.target.value)}
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
      {initial.notes && <p className="text-sm text-stone-600 italic">{initial.notes}</p>}
      <p className="text-xs text-stone-500">AI confidence: {Math.round(initial.confidence * 100)}%</p>
      <Button onClick={onSave} disabled={saving} className="w-full">
        {saving ? 'Logging...' : 'Log meal'}
      </Button>
    </div>
  );
}

function guessMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

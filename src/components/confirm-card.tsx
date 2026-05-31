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
    fiberG: number;
    sugarG: number;
    sodiumMg: number;
    satFatG: number;
    confidence: number;
    notes?: string;
  };
};

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

export function ConfirmCard({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [values, setValues] = useState<Record<NumField, string>>({
    calories: String(initial.calories),
    proteinG: String(initial.proteinG),
    carbsG: String(initial.carbsG),
    fatG: String(initial.fatG),
    fiberG: String(initial.fiberG),
    sugarG: String(initial.sugarG),
    sodiumMg: String(initial.sodiumMg),
    satFatG: String(initial.satFatG),
  });
  const [mealType, setMealType] = useState<typeof TYPES[number]>(guessMealType());
  const [saving, setSaving] = useState(false);

  function set(key: NumField, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function onSave() {
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

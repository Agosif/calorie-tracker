'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  CalculatedGoals,
  ActivityLevel,
  Goal,
  GoalPace,
  Sex,
} from '@/lib/calculator';

type Stats = {
  heightCm: string;
  weightKg: string;
  bodyFatPct: string;
  age: string;
  sex: Sex | '';
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
  goalPace: GoalPace | '';
};

const EMPTY: Stats = {
  heightCm: '', weightKg: '', bodyFatPct: '', age: '',
  sex: '', activityLevel: '', goal: '', goalPace: '',
};

const ACTIVITY: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentary',    label: 'Sedentary',   hint: 'Desk job, no exercise' },
  { value: 'light',        label: 'Light',       hint: '1–3x/week' },
  { value: 'moderate',     label: 'Moderate',    hint: '3–5x/week' },
  { value: 'active',       label: 'Active',      hint: '6–7x/week' },
  { value: 'very_active',  label: 'Very active', hint: 'Physical job + training' },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: 'lose',     label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain',     label: 'Gain weight' },
];

const PACES: { value: GoalPace; label: string }[] = [
  { value: 'slow',     label: 'Slow' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'fast',     label: 'Fast' },
];

export default function CalculatorPage() {
  const router = useRouter();
  const [s, setS] = useState<Stats>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [preview, setPreview] = useState<CalculatedGoals | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/calculator').then((r) => r.json()).then((data) => {
      setS({
        heightCm:      data.heightCm   != null ? String(data.heightCm)   : '',
        weightKg:      data.weightKg   != null ? String(data.weightKg)   : '',
        bodyFatPct:    data.bodyFatPct != null ? String(data.bodyFatPct) : '',
        age:           data.age        != null ? String(data.age)        : '',
        sex:           (data.sex ?? '') as Sex | '',
        activityLevel: (data.activityLevel ?? '') as ActivityLevel | '',
        goal:          (data.goal ?? '') as Goal | '',
        goalPace:      (data.goalPace ?? '') as GoalPace | '',
      });
      setLoaded(true);
    });
  }, []);

  const formComplete =
    s.heightCm && s.weightKg && s.age &&
    s.sex && s.activityLevel && s.goal && s.goalPace;

  async function calculate() {
    if (!formComplete) return;
    setBusy(true);
    const res = await fetch('/api/calculator', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heightCm: Number(s.heightCm),
        weightKg: Number(s.weightKg),
        bodyFatPct: s.bodyFatPct ? Number(s.bodyFatPct) : null,
        age: Number(s.age),
        sex: s.sex,
        activityLevel: s.activityLevel,
        goal: s.goal,
        goalPace: s.goalPace,
        applyToGoals: false,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setPreview(data.computed);
    }
  }

  async function applyToGoals() {
    if (!formComplete) return;
    setBusy(true);
    await fetch('/api/calculator', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heightCm: Number(s.heightCm),
        weightKg: Number(s.weightKg),
        bodyFatPct: s.bodyFatPct ? Number(s.bodyFatPct) : null,
        age: Number(s.age),
        sex: s.sex,
        activityLevel: s.activityLevel,
        goal: s.goal,
        goalPace: s.goalPace,
        applyToGoals: true,
      }),
    });
    setBusy(false);
    router.push('/');
  }

  if (!loaded) return <main className="p-6">Loading…</main>;

  return (
    <main className="min-h-screen p-4 bg-stone-50">
      <header className="flex items-center justify-between mb-4 max-w-md mx-auto">
        <Link href="/settings" className="text-sm">← Settings</Link>
        <h1 className="text-lg font-semibold">Calorie calculator</h1>
        <span />
      </header>

      <div className="max-w-md mx-auto space-y-6">
        <p className="text-sm text-stone-600">
          Tell me your stats. I&apos;ll compute daily calories + macros using Mifflin-St Jeor
          (or Katch-McArdle if you give body fat %).
        </p>

        <section className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Height (cm)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={s.heightCm}
              onChange={(e) => setS({ ...s, heightCm: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Weight (kg)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={s.weightKg}
              onChange={(e) => setS({ ...s, weightKg: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Age</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={s.age}
              onChange={(e) => setS({ ...s, age: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Body fat % (optional)</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 18"
              value={s.bodyFatPct}
              onChange={(e) => setS({ ...s, bodyFatPct: e.target.value })}
            />
          </div>
        </section>

        <section>
          <Label className="text-xs">Sex (for BMR formula)</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(['male', 'female'] as const).map((v) => (
              <Button
                key={v}
                type="button"
                variant={s.sex === v ? 'default' : 'outline'}
                onClick={() => setS({ ...s, sex: v })}
                size="sm"
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <Label className="text-xs">Activity level</Label>
          <div className="grid grid-cols-1 gap-1 mt-1">
            {ACTIVITY.map((a) => (
              <Button
                key={a.value}
                type="button"
                variant={s.activityLevel === a.value ? 'default' : 'outline'}
                onClick={() => setS({ ...s, activityLevel: a.value })}
                size="sm"
                className="justify-between"
              >
                <span>{a.label}</span>
                <span className="text-xs opacity-70">{a.hint}</span>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <Label className="text-xs">Goal</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {GOALS.map((g) => (
              <Button
                key={g.value}
                type="button"
                variant={s.goal === g.value ? 'default' : 'outline'}
                onClick={() => setS({ ...s, goal: g.value })}
                size="sm"
              >
                {g.label}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <Label className="text-xs">Pace</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {PACES.map((p) => (
              <Button
                key={p.value}
                type="button"
                variant={s.goalPace === p.value ? 'default' : 'outline'}
                onClick={() => setS({ ...s, goalPace: p.value })}
                size="sm"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </section>

        <Button
          onClick={calculate}
          disabled={!formComplete || busy}
          className="w-full"
          variant="outline"
        >
          {busy ? 'Calculating…' : 'Calculate'}
        </Button>

        {preview && (
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold">Suggested daily targets</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-stone-600">BMR</span>
              <span className="tabular-nums text-right">{preview.bmr} kcal</span>
              <span className="text-stone-600">TDEE</span>
              <span className="tabular-nums text-right">{preview.tdee} kcal</span>
              <span className="font-semibold">Target calories</span>
              <span className="tabular-nums text-right font-semibold">{preview.targetCalories} kcal</span>
              <hr className="col-span-2 my-1 border-stone-200" />
              <span className="text-stone-600">Protein</span>
              <span className="tabular-nums text-right">{preview.proteinG} g</span>
              <span className="text-stone-600">Carbs</span>
              <span className="tabular-nums text-right">{preview.carbsG} g</span>
              <span className="text-stone-600">Fat</span>
              <span className="tabular-nums text-right">{preview.fatG} g</span>
              <span className="text-stone-600">Fiber</span>
              <span className="tabular-nums text-right">{preview.fiberG} g</span>
              <span className="text-stone-600">Sugar (max)</span>
              <span className="tabular-nums text-right">{preview.sugarG} g</span>
              <span className="text-stone-600">Sodium (max)</span>
              <span className="tabular-nums text-right">{preview.sodiumMg} mg</span>
              <span className="text-stone-600">Sat fat (max)</span>
              <span className="tabular-nums text-right">{preview.satFatG} g</span>
            </div>
            <Button
              onClick={applyToGoals}
              disabled={busy}
              className="w-full"
            >
              {busy ? 'Applying…' : 'Apply to my goals'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

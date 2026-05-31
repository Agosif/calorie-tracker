import Link from 'next/link';
import type { Meal } from '@/lib/schema';

const EMOJI: Record<Meal['mealType'], string> = {
  breakfast: '🍳', lunch: '🥗', dinner: '🍽️', snack: '🍎',
};

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <Link
      href={`/history/${new Date(meal.consumedAt).toISOString().slice(0, 10)}`}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200"
    >
      <div className="text-2xl">{EMOJI[meal.mealType]}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{meal.name}</div>
        <div className="text-xs text-stone-500 capitalize">{meal.mealType}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold tabular-nums">{meal.calories}</div>
        <div className="text-xs text-stone-500">cal</div>
      </div>
    </Link>
  );
}
